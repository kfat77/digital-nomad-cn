-- 社区论坛：IP 锁定账户（替代 supabase/community.sql 的匿名发帖方案）
--
-- 规则：
--   1. 不提供登录、也不提供注册。访问论坛时按客户端网络地址自动生成账户。
--   2. 同一个网络地址 = 同一个账户，因此无法用不同名字重复发言。
--   3. 每个人可以给自己的账户取名字（可选），改名后所有历史发言同步改名。
--
-- 隐私：数据库只保存加盐哈希（ip_hash），不保存原始 IP。
-- 部署：在 Supabase Dashboard → SQL Editor 中执行本文件一次，可重复执行。
--
-- 注意：下面的 SALT 请改成一个你自己的随机字符串再执行。
-- 哈希里含盐，改盐等于换一套身份键，所有既有账户会重新生成。

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------- 基础表

CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 4 AND 80),
  category TEXT NOT NULL CHECK (category IN ('银行卡', '电话卡', '海外证券', '出海生活')),
  content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 4 AND 1200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS ip_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_created ON public.forum_topics(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_ip_created ON public.forum_topics(ip_hash, created_at DESC);
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.forum_identities (
  ip_hash TEXT PRIMARY KEY,
  display_name TEXT,
  topic_count INTEGER NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name_updated_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_identities_name
  ON public.forum_identities (lower(display_name)) WHERE display_name IS NOT NULL;
ALTER TABLE public.forum_identities ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------- 内部工具

-- 加盐哈希。search_path 里带上 extensions(pgcrypto 在 Supabase 通常装在这里),
-- 拿不到 pgcrypto 时退回 md5,保证函数一定可用。
CREATE OR REPLACE FUNCTION public.forum_hash(p_value TEXT)
RETURNS TEXT LANGUAGE plpgsql IMMUTABLE SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  RETURN encode(digest(p_value, 'sha256'), 'hex');
EXCEPTION WHEN OTHERS THEN
  RETURN md5(p_value);
END; $$;

-- 从 PostgREST 转发的请求头里取客户端网络地址。
--
-- 取值顺序按「可信度」排,不看谁先出现:
--   cf-connecting-ip  由 Cloudflare 覆写,调用方伪造不了;
--   x-real-ip         由网关覆写,同样伪造不了;
--   x-forwarded-for   标准代理是「追加」语义,所以取最后一段(网关补的那一段),
--                     取第一段等于把伪造权交给调用方。
CREATE OR REPLACE FUNCTION public.forum_client_ip()
RETURNS TEXT LANGUAGE plpgsql STABLE SET search_path = public, pg_temp
AS $$
DECLARE
  headers TEXT;
  raw TEXT;
  parts TEXT[];
BEGIN
  BEGIN
    headers := current_setting('request.headers', true);
  EXCEPTION WHEN OTHERS THEN
    headers := NULL;
  END;
  IF headers IS NULL OR headers = '' THEN RETURN NULL; END IF;

  BEGIN
    raw := COALESCE(
      headers::json ->> 'cf-connecting-ip',
      headers::json ->> 'x-real-ip'
    );
    IF raw IS NULL OR btrim(raw) = '' THEN
      raw := headers::json ->> 'x-forwarded-for';
      IF raw IS NOT NULL AND btrim(raw) <> '' THEN
        parts := string_to_array(raw, ',');
        raw := parts[array_length(parts, 1)];
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;

  IF raw IS NULL OR btrim(raw) = '' THEN RETURN NULL; END IF;
  RETURN btrim(raw);
END; $$;

-- 账户主键：加盐哈希后的网络地址。取不到地址时返回 NULL，由调用方报错。
CREATE OR REPLACE FUNCTION public.forum_identity_key()
RETURNS TEXT LANGUAGE plpgsql STABLE SET search_path = public, pg_temp
AS $$
DECLARE
  ip TEXT;
BEGIN
  ip := public.forum_client_ip();
  IF ip IS NULL THEN RETURN NULL; END IF;
  RETURN public.forum_hash('nomad-essentials-forum-2026-09-a7f3c1|' || ip);
END; $$;

-- 对外账户标签：取过名字用名字，否则用「游客 + 哈希前四位」，保证同一网络地址始终同一个称呼。
CREATE OR REPLACE FUNCTION public.forum_label(p_ip_hash TEXT, p_display_name TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(p_display_name,
    CASE WHEN p_ip_hash IS NULL THEN '早期匿名帖'
         ELSE '游客 ' || left(p_ip_hash, 4) END);
$$;

-- ---------------------------------------------------------------- 对外 RPC

-- 读取（或首次创建）当前账户。
CREATE OR REPLACE FUNCTION public.forum_whoami()
RETURNS TABLE(display_name TEXT, author_label TEXT, needs_name BOOLEAN,
              topic_count INTEGER, first_seen_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  k TEXT;
  v public.forum_identities%ROWTYPE;
BEGIN
  k := public.forum_identity_key();
  IF k IS NULL THEN
    RAISE EXCEPTION '无法识别你的网络地址，请稍后重试';
  END IF;

  INSERT INTO public.forum_identities(ip_hash) VALUES (k)
    ON CONFLICT (ip_hash) DO UPDATE SET last_seen_at = now()
    RETURNING * INTO v;

  RETURN QUERY SELECT v.display_name,
                      public.forum_label(v.ip_hash, v.display_name),
                      v.display_name IS NULL,
                      v.topic_count,
                      v.first_seen_at;
END; $$;

-- 给自己的账户取名字（可随时改，改完历史发言一并跟着变）。
CREATE OR REPLACE FUNCTION public.set_forum_name(p_name TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  k TEXT;
  clean TEXT;
  taken INTEGER;
BEGIN
  k := public.forum_identity_key();
  IF k IS NULL THEN
    RAISE EXCEPTION '无法识别你的网络地址，请稍后重试';
  END IF;

  clean := btrim(regexp_replace(COALESCE(p_name, ''), '\s+', ' ', 'g'));
  IF char_length(clean) NOT BETWEEN 2 AND 16 THEN
    RAISE EXCEPTION '名字需要 2 到 16 个字符';
  END IF;
  IF clean ~ '[<>@/]' THEN
    RAISE EXCEPTION '名字里不能出现 < > @ / 这几个字符';
  END IF;

  SELECT count(*) INTO taken FROM public.forum_identities i
   WHERE lower(i.display_name) = lower(clean) AND i.ip_hash <> k;
  IF taken > 0 THEN
    RAISE EXCEPTION '这个名字已经被别的账户用了，换一个吧';
  END IF;

  INSERT INTO public.forum_identities(ip_hash, display_name, name_updated_at)
    VALUES (k, clean, now())
    ON CONFLICT (ip_hash) DO UPDATE
      SET display_name = clean, name_updated_at = now(), last_seen_at = now();

  RETURN clean;
END; $$;

-- 发帖。作者一律取当前网络地址对应的账户，不接受调用方指定的名字。
DROP FUNCTION IF EXISTS public.create_forum_topic(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.create_forum_topic(p_title TEXT, p_category TEXT, p_content TEXT)
RETURNS TABLE(author_label TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  k TEXT;
  v public.forum_identities%ROWTYPE;
  label TEXT;
  recent INTEGER;
BEGIN
  k := public.forum_identity_key();
  IF k IS NULL THEN
    RAISE EXCEPTION '无法识别你的网络地址，请稍后重试';
  END IF;

  IF p_title IS NULL OR char_length(btrim(p_title)) NOT BETWEEN 4 AND 80 THEN
    RAISE EXCEPTION '标题长度应为 4 至 80 个字符';
  END IF;
  IF p_category IS NULL OR p_category NOT IN ('银行卡', '电话卡', '海外证券', '出海生活') THEN
    RAISE EXCEPTION '无效的分类';
  END IF;
  IF p_content IS NULL OR char_length(btrim(p_content)) NOT BETWEEN 4 AND 1200 THEN
    RAISE EXCEPTION '内容长度应为 4 至 1200 个字符';
  END IF;

  SELECT count(*) INTO recent FROM public.forum_topics t
   WHERE t.ip_hash = k AND t.created_at > now() - interval '1 hour';
  IF recent >= 5 THEN
    RAISE EXCEPTION '同一网络地址每小时最多发布 5 个话题，请稍后再试';
  END IF;

  INSERT INTO public.forum_identities AS fi (ip_hash) VALUES (k)
    ON CONFLICT (ip_hash) DO UPDATE
      SET last_seen_at = now(), topic_count = fi.topic_count + 1
    RETURNING * INTO v;

  label := public.forum_label(v.ip_hash, v.display_name);

  INSERT INTO public.forum_topics(title, category, content, ip_hash)
    VALUES (btrim(p_title), p_category, btrim(p_content), k);

  RETURN QUERY SELECT label;
END; $$;

-- 列表。作者名实时取自账户表，因此改名后历史发言会一起改名。
DROP FUNCTION IF EXISTS public.get_forum_topics(TEXT);
CREATE OR REPLACE FUNCTION public.get_forum_topics(p_category TEXT DEFAULT NULL)
RETURNS TABLE(id UUID, title TEXT, category TEXT, content TEXT,
              author_label TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT t.id, t.title, t.category, t.content,
         public.forum_label(t.ip_hash, i.display_name) AS author_label,
         t.created_at
    FROM public.forum_topics t
    LEFT JOIN public.forum_identities i ON i.ip_hash = t.ip_hash
   WHERE p_category IS NULL OR t.category = p_category
   ORDER BY t.created_at DESC
   LIMIT 100;
$$;

-- ---------------------------------------------------------------- 权限

-- 内部工具不对外开放，避免前端直接读到哈希或原始地址。
REVOKE ALL ON FUNCTION public.forum_hash(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.forum_client_ip() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.forum_identity_key() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.forum_label(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- 两张表都只走上面的函数访问:直接收回表权限,ip_hash 永远不会出现在前端拿到的响应里。
REVOKE ALL ON TABLE public.forum_topics FROM anon, authenticated;
REVOKE ALL ON TABLE public.forum_identities FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.forum_whoami() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_forum_name(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_forum_topic(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_forum_topics(TEXT) TO anon, authenticated;
