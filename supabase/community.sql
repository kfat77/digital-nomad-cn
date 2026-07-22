-- 社区讨论模块：每张工具卡的匿名留言与有用度投票。
-- 在 Supabase SQL Editor 中执行一次；不需要在前端暴露任何新密钥。

CREATE TABLE IF NOT EXISTS public.tool_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL CHECK (char_length(tool_id) BETWEEN 2 AND 120),
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 2 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tool_comments_tool_created ON public.tool_comments(tool_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.tool_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL CHECK (char_length(tool_id) BETWEEN 2 AND 120),
  direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tool_votes_tool_direction ON public.tool_votes(tool_id, direction);

ALTER TABLE public.tool_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_votes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_tool_comments(p_tool_id TEXT)
RETURNS TABLE(message TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT c.message, c.created_at FROM public.tool_comments c WHERE c.tool_id = p_tool_id ORDER BY c.created_at DESC LIMIT 100; $$;

CREATE OR REPLACE FUNCTION public.add_tool_comment(p_tool_id TEXT, p_message TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$ BEGIN
  IF p_tool_id IS NULL OR char_length(p_tool_id) NOT BETWEEN 2 AND 120 THEN RAISE EXCEPTION '无效的工具标识'; END IF;
  IF p_message IS NULL OR char_length(trim(p_message)) NOT BETWEEN 2 AND 500 THEN RAISE EXCEPTION '留言长度应为 2 至 500 个字符'; END IF;
  INSERT INTO public.tool_comments(tool_id, message) VALUES (p_tool_id, trim(p_message));
END; $$;

CREATE OR REPLACE FUNCTION public.get_tool_votes(p_tool_id TEXT)
RETURNS TABLE(upvotes BIGINT, downvotes BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT count(*) FILTER (WHERE direction = 'up'), count(*) FILTER (WHERE direction = 'down') FROM public.tool_votes WHERE tool_id = p_tool_id; $$;

CREATE OR REPLACE FUNCTION public.vote_for_tool(p_tool_id TEXT, p_direction TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$ BEGIN
  IF p_tool_id IS NULL OR char_length(p_tool_id) NOT BETWEEN 2 AND 120 THEN RAISE EXCEPTION '无效的工具标识'; END IF;
  IF p_direction NOT IN ('up', 'down') THEN RAISE EXCEPTION '无效的评价'; END IF;
  INSERT INTO public.tool_votes(tool_id, direction) VALUES (p_tool_id, p_direction);
END; $$;

GRANT EXECUTE ON FUNCTION public.get_tool_comments(TEXT), public.add_tool_comment(TEXT, TEXT), public.get_tool_votes(TEXT), public.vote_for_tool(TEXT, TEXT) TO anon, authenticated;
