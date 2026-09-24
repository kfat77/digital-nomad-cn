-- ============================================================
-- 订阅商城接入 · V1.0
-- 在既有 giffgaff 订单系统（schema.sql）之上扩展 X Premium / TG Premium 订阅类产品
-- 执行方式：粘贴到 Supabase SQL Editor 运行一次（可重复执行）
--
-- 设计要点：
--   * 复用同一张 orders 表与同一套后台，不另起一套订单体系
--   * 价格只以 product_settings 为准，下单时由服务端读取，前端传什么都不作数
--   * 新增 admin_new_orders，供后台轮询「有没有人刚下单」，用于提醒
-- ============================================================

-- ------------------------------------------------------------
-- 1. orders 表扩展
-- ------------------------------------------------------------
-- 1.1 放开产品类型约束，纳入订阅类产品
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_product_type_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_product_type_check
  CHECK (product_type IN ('card', 'recharge', 'x_premium', 'tg_premium'));

-- 1.2 订阅类订单专有字段（实物订单留空）
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_account TEXT;   -- 目标账号：X/TG 用户名
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS plan_code       TEXT;   -- 套餐代码：x_3m / tg_12m ...
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pay_currency    TEXT;   -- 计价币种：cny / usdt
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_contact TEXT;  -- 联系方式：TG / 邮箱 / 手机号
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_note    TEXT;  -- 买家备注

-- 1.3 数字商品没有收货地址与手机号，放开非空约束（实物订单行为不变）
ALTER TABLE public.orders ALTER COLUMN shipping_address DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN customer_phone   DROP NOT NULL;

-- ------------------------------------------------------------
-- 2. 订单号生成：按产品类型分前缀
--    card / recharge -> GF-，x_premium -> X-，tg_premium -> TG-
--    同时让查询码的盐值兼容 customer_phone 为空的情况
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  daily_seq INT;
  prefix    TEXT;
BEGIN
  SELECT COALESCE(MAX(seq), 0) + 1 INTO daily_seq
  FROM (
    SELECT ROW_NUMBER() OVER (ORDER BY created_at) AS seq
    FROM public.orders
    WHERE DATE(created_at) = DATE(now())
  ) sub;

  prefix := CASE NEW.product_type
              WHEN 'x_premium'  THEN 'X-'
              WHEN 'tg_premium' THEN 'TG-'
              ELSE 'GF-'
            END;

  NEW.order_number := prefix || to_char(now(), 'YYYYMMDD') || '-' || LPAD(daily_seq::TEXT, 4, '0');
  NEW.tracking_code := UPPER(SUBSTRING(
    MD5(RANDOM()::TEXT || COALESCE(NEW.customer_phone, NEW.customer_contact, NEW.service_account, ''))
    FROM 1 FOR 6));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------
-- 3. 管理员校验复用函数
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_require_admin()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users a
    JOIN auth.users u ON LOWER(u.email) = LOWER(a.email)
    WHERE u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'permission denied: not an admin';
  END IF;
END;
$$;

-- ------------------------------------------------------------
-- 4. 套餐与价格（存 product_settings，后台「产品设置」页可直接改）
--    数值取自服务方公开配置，如需调整改这里或后台改即可
--    0 = 该币种当前不可用
-- ------------------------------------------------------------
INSERT INTO public.product_settings(key, value) VALUES
  ('sub_x_3m_cny',        '27'),
  ('sub_x_3m_usdt',       '4'),
  ('sub_x_6m_cny',        '54'),
  ('sub_x_6m_usdt',       '8'),
  ('sub_x_12m_cny',       '0'),
  ('sub_x_12m_usdt',      '45'),
  ('sub_x_12m_plus_cny',  '0'),
  ('sub_x_12m_plus_usdt', '210'),
  ('sub_tg_3m_cny',       '101'),
  ('sub_tg_3m_usdt',      '14'),
  ('sub_tg_6m_cny',       '131'),
  ('sub_tg_6m_usdt',      '19'),
  ('sub_tg_12m_cny',      '222'),
  ('sub_tg_12m_usdt',     '32'),
  ('sub_accepting',       '1'),   -- 1=接单中，0=暂停接单
  ('sub_pay_note',        ''),    -- 下单成功页的支付说明，留空则不显示
  ('sub_direct_url',      'https://ronvip.pages.dev/?ref=RP39040825423J2A5C'),
  ('sub_notify_webhook',  '')     -- 可选推送地址，留空则不推送
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- 5. 套餐代码校验表（函数内联，避免额外建表）
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_plan_product(p_plan_code TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE p_plan_code
    WHEN 'x_3m'        THEN 'x_premium'
    WHEN 'x_6m'        THEN 'x_premium'
    WHEN 'x_12m'       THEN 'x_premium'
    WHEN 'x_12m_plus'  THEN 'x_premium'
    WHEN 'tg_3m'       THEN 'tg_premium'
    WHEN 'tg_6m'       THEN 'tg_premium'
    WHEN 'tg_12m'      THEN 'tg_premium'
    ELSE NULL
  END;
$$;

-- ------------------------------------------------------------
-- 6. 公开 RPC：前端读取套餐价格与接单状态
--    只返回 sub_ 前缀的键，不暴露其它设置
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_subscription_info()
RETURNS TABLE(key TEXT, value TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT ps.key, ps.value
  FROM public.product_settings ps
  WHERE ps.key LIKE 'sub\_%'
    AND ps.key NOT LIKE 'sub\_notify\_webhook';   -- 推送地址不下发到前端
$$;

GRANT EXECUTE ON FUNCTION public.get_subscription_info() TO anon, authenticated;

-- ------------------------------------------------------------
-- 7. 下单 RPC：订阅类订单入口（匿名可调用）
--    价格由服务端从 product_settings 读取，前端传的价格不作数
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_subscription_order(
  p_plan_code        TEXT,
  p_currency         TEXT,
  p_service_account  TEXT,
  p_customer_contact TEXT,
  p_customer_name    TEXT DEFAULT NULL,
  p_customer_email   TEXT DEFAULT NULL,
  p_customer_note    TEXT DEFAULT NULL,
  p_quantity         INT  DEFAULT 1
) RETURNS TABLE(
  order_number TEXT,
  tracking_code TEXT,
  unit_price   NUMERIC,
  total_price  NUMERIC,
  pay_currency TEXT
) AS $$
DECLARE
  _product    TEXT;
  _currency   TEXT;
  _price      NUMERIC;
  _accepting  TEXT;
  _price_key  TEXT;
  _rec        RECORD;
BEGIN
  -- 参数校验
  _product := public.fn_plan_product(p_plan_code);
  IF _product IS NULL THEN
    RAISE EXCEPTION '无效的套餐代码';
  END IF;

  _currency := LOWER(COALESCE(p_currency, ''));
  IF _currency NOT IN ('cny', 'usdt') THEN
    RAISE EXCEPTION '请选择支付币种';
  END IF;

  IF p_service_account IS NULL OR TRIM(p_service_account) = '' THEN
    RAISE EXCEPTION '请填写需要开通的目标账号';
  END IF;
  IF p_customer_contact IS NULL OR TRIM(p_customer_contact) = '' THEN
    RAISE EXCEPTION '请填写联系方式';
  END IF;
  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 10 THEN
    RAISE EXCEPTION '数量需在 1 - 10 之间';
  END IF;

  -- 接单开关
  SELECT value INTO _accepting FROM public.product_settings WHERE key = 'sub_accepting';
  IF _accepting IS NOT NULL AND _accepting <> '1' THEN
    RAISE EXCEPTION '当前暂停接单，请稍后再试';
  END IF;

  -- 价格以数据库为准
  _price_key := 'sub_' || p_plan_code || '_' || _currency;
  SELECT NULLIF(value, '')::NUMERIC INTO _price
  FROM public.product_settings WHERE key = _price_key;

  IF _price IS NULL OR _price <= 0 THEN
    IF _currency = 'cny' THEN
      RAISE EXCEPTION '该套餐暂不支持人民币结算，请改用 USDT';
    ELSE
      RAISE EXCEPTION '该套餐价格未配置，请联系客服';
    END IF;
  END IF;

  INSERT INTO public.orders (
    quantity, unit_price, total_price,
    customer_name, customer_phone, customer_email, customer_contact,
    shipping_address, status, product_type,
    service_account, plan_code, pay_currency, customer_note
  ) VALUES (
    p_quantity, _price, _price * p_quantity,
    COALESCE(NULLIF(TRIM(COALESCE(p_customer_name, '')), ''), TRIM(p_service_account)),
    NULL,
    NULLIF(TRIM(COALESCE(p_customer_email, '')), ''),
    TRIM(p_customer_contact),
    NULL, 'pending_payment', _product,
    TRIM(p_service_account), p_plan_code, _currency,
    NULLIF(TRIM(COALESCE(p_customer_note, '')), '')
  )
  RETURNING * INTO _rec;

  order_number  := _rec.order_number;
  tracking_code := _rec.tracking_code;
  unit_price    := _price;
  total_price   := _price * p_quantity;
  pay_currency  := _currency;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.create_subscription_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_subscription_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INT) TO authenticated;

-- ------------------------------------------------------------
-- 8. 新订单轮询 RPC（仅管理员）
--    后台每隔一段时间调一次，用来判断「有没有新下单」
--    用 (created_at, id) 元组比较，避免同一时刻两单被漏掉
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_new_orders(
  p_since   TIMESTAMPTZ,
  p_last_id UUID DEFAULT NULL
) RETURNS TABLE(
  new_count        INT,
  latest_id        UUID,
  latest_at        TIMESTAMPTZ,
  latest_number    TEXT,
  latest_product   TEXT,
  latest_plan      TEXT,
  latest_account   TEXT,
  latest_total     NUMERIC,
  latest_currency  TEXT,
  latest_contact   TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.fn_require_admin();

  RETURN QUERY
  WITH fresh AS (
    SELECT o.* FROM public.orders o
    WHERE (o.created_at, o.id) > (
      COALESCE(p_since, '-infinity'::TIMESTAMPTZ),
      COALESCE(p_last_id, '00000000-0000-0000-0000-000000000000'::UUID)
    )
  ), agg AS (
    SELECT COUNT(*)::INT AS c FROM fresh
  ), latest_row AS (
    SELECT * FROM fresh ORDER BY created_at DESC, id DESC LIMIT 1
  )
  SELECT a.c,
         t.id,
         t.created_at,
         t.order_number,
         t.product_type,
         t.plan_code,
         t.service_account,
         t.total_price,
         t.pay_currency,
         COALESCE(t.customer_contact, t.customer_phone, '')
  FROM agg a LEFT JOIN latest_row t ON TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_new_orders(TIMESTAMPTZ, UUID) TO authenticated;

-- ------------------------------------------------------------
-- 9.（可选）无人值守推送：下单后把消息推到你手机
--    默认关闭。在后台「产品设置」里给 sub_notify_webhook 填上地址即生效，
--    例如 Telegram Bot 的 sendMessage 接口、或任意接收 JSON 的推送服务。
--    pg_net 未安装 / 地址为空 / 推送失败，都不影响下单本身。
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  _hook TEXT;
  _body TEXT;
BEGIN
  BEGIN
    SELECT value INTO _hook FROM public.product_settings WHERE key = 'sub_notify_webhook';
    IF _hook IS NULL OR TRIM(_hook) = '' THEN
      RETURN NEW;
    END IF;

    _body := json_build_object(
      'text',
      '新订单 ' || NEW.order_number ||
      ' · ' || COALESCE(NEW.product_type, '') ||
      ' · ¥' || COALESCE(NEW.total_price::TEXT, '') ||
      ' · 账号 ' || COALESCE(NEW.service_account, '-') ||
      ' · 联系 ' || COALESCE(NEW.customer_contact, NEW.customer_phone, '-')
    )::TEXT;

    PERFORM net.http_post(
      url     := _hook,
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body    := _body::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    -- 推送只是锦上添花，任何失败都不能阻断下单
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_order ON public.orders;
CREATE TRIGGER trg_notify_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_new_order();

-- ------------------------------------------------------------
-- 10. 执行清单
--   a. 本文件全部内容粘贴到 Supabase SQL Editor 运行一次
--   b. 后台「产品设置」页可改价格、暂停接单、填支付说明
--   c. 想让关掉网页也能收到提醒：给 sub_notify_webhook 填入推送地址
-- ============================================================
