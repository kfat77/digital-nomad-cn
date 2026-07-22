-- 社区论坛：匿名发帖。请在 Supabase SQL Editor 中执行一次。

CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 4 AND 80),
  category TEXT NOT NULL CHECK (category IN ('银行卡', '电话卡', '海外证券', '出海生活')),
  content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 4 AND 1200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_created ON public.forum_topics(category, created_at DESC);
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_forum_topics(p_category TEXT DEFAULT NULL)
RETURNS TABLE(id UUID, title TEXT, category TEXT, content TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT t.id, t.title, t.category, t.content, t.created_at FROM public.forum_topics t WHERE p_category IS NULL OR t.category = p_category ORDER BY t.created_at DESC LIMIT 100; $$;

CREATE OR REPLACE FUNCTION public.create_forum_topic(p_title TEXT, p_category TEXT, p_content TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$ BEGIN
  IF p_title IS NULL OR char_length(trim(p_title)) NOT BETWEEN 4 AND 80 THEN RAISE EXCEPTION '标题长度应为 4 至 80 个字符'; END IF;
  IF p_category NOT IN ('银行卡', '电话卡', '海外证券', '出海生活') THEN RAISE EXCEPTION '无效的分类'; END IF;
  IF p_content IS NULL OR char_length(trim(p_content)) NOT BETWEEN 4 AND 1200 THEN RAISE EXCEPTION '内容长度应为 4 至 1200 个字符'; END IF;
  INSERT INTO public.forum_topics(title, category, content) VALUES (trim(p_title), p_category, trim(p_content));
END; $$;

GRANT EXECUTE ON FUNCTION public.get_forum_topics(TEXT), public.create_forum_topic(TEXT, TEXT, TEXT) TO anon, authenticated;
