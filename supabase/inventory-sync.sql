-- 允许 GitHub Actions 使用 Supabase service_role 同步供应商库存。
-- 在 Supabase Dashboard → SQL Editor 中执行一次。
GRANT SELECT, UPDATE ON public.product_settings TO service_role;
