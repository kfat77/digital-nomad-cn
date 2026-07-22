-- ============================================================
-- giffgaff 电话卡订单系统 · V1.2（多产品版）
-- 支持：giffgaff 电话卡 + 10英镑充值券
-- 单表设计：orders + admin_users 白名单 + product_settings
-- 执行方式：粘贴到 Supabase SQL Editor 运行
--
-- 安全修复：
--   P0-1: 新增 create_order RPC，匿名用户不直接 INSERT 表
--   P0-2: admin_users 白名单 + is_admin() 函数，仅管理员可 SELECT/UPDATE
--   P2-7: 所有 SECURITY DEFINER 函数加 search_path
--   V1.2: 多产品支持（card + recharge），RPC 绕过 RLS 权限策略
-- ============================================================

-- ------------------------------------------------------------
-- 1. orders 表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,
  tracking_code   TEXT NOT NULL,
  product_type    VARCHAR(20) NOT NULL DEFAULT 'card'
                  CHECK (product_type IN ('card', 'recharge')),
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price      NUMERIC(10,2) NOT NULL,
  total_price     NUMERIC(10,2) NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,
  shipping_address TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending_payment'
                  CHECK (status IN ('pending_payment','user_paid','confirmed','shipped','completed','cancelled')),
  courier_company TEXT,
  tracking_number TEXT,
  admin_remark    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引：按状态筛选 + 按时间排序
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ------------------------------------------------------------
-- 2. admin_users 白名单表
--    存储管理员邮箱，RLS 策略通过 is_admin() 检查此表
--    部署时：INSERT INTO admin_users(email) VALUES('你的邮箱');
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. 订单号 + 查询码自动生成（INSERT 时触发）
--    订单号格式：GF-YYYYMMDD-NNNN
--    查询码格式：6 位大写字母数字
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  daily_seq INT;
BEGIN
  -- 当日序号
  SELECT COALESCE(MAX(seq), 0) + 1 INTO daily_seq
  FROM (
    SELECT ROW_NUMBER() OVER (ORDER BY created_at) AS seq
    FROM orders
    WHERE DATE(created_at) = DATE(now())
  ) sub;

  NEW.order_number := 'GF-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(daily_seq::TEXT, 4, '0');
  NEW.tracking_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.customer_phone) FROM 1 FOR 6));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_generate_order_number ON orders;
CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION fn_generate_order_number();

-- ------------------------------------------------------------
-- 4. updated_at 自动更新（UPDATE 时触发）
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_update_updated_at ON orders;
CREATE TRIGGER trg_update_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_updated_at();

-- ------------------------------------------------------------
-- 5. is_admin() — 检查当前认证用户是否在 admin_users 白名单中
--    使用 SECURITY DEFINER 绕过 admin_users 的 RLS
--    V1.1: 改用 auth.email() 替代 auth.jwt() ->> 'email'，兼容 Supabase Auth v2+
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE LOWER(email) = LOWER(auth.email())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------
-- 6. create_order RPC — 匿名用户下单入口
--    SECURITY DEFINER 绕过 RLS 执行 INSERT
--    返回订单号 + 查询码（匿名用户无需 SELECT 权限）
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_order(
  p_quantity        INT,
  p_unit_price      NUMERIC(10,2),
  p_total_price     NUMERIC(10,2),
  p_customer_name   TEXT,
  p_customer_phone  TEXT,
  p_customer_email  TEXT,
  p_shipping_address TEXT,
  p_product_type    TEXT DEFAULT 'card'
) RETURNS TABLE(
  order_number  TEXT,
  tracking_code TEXT
) AS $$
DECLARE
  _rec       RECORD;
  _stock_key TEXT;
  _stock     INT;
BEGIN
  -- 基本参数校验
  IF p_quantity IS NULL OR p_quantity < 1 THEN
    RAISE EXCEPTION '数量必须大于 0';
  END IF;
  IF p_customer_name IS NULL OR TRIM(p_customer_name) = '' THEN
    RAISE EXCEPTION '收货人姓名不能为空';
  END IF;
  IF p_customer_phone IS NULL OR TRIM(p_customer_phone) = '' THEN
    RAISE EXCEPTION '手机号不能为空';
  END IF;
  IF p_shipping_address IS NULL OR TRIM(p_shipping_address) = '' THEN
    RAISE EXCEPTION '收货地址不能为空';
  END IF;
  IF p_product_type NOT IN ('card', 'recharge') THEN
    RAISE EXCEPTION '无效的产品类型';
  END IF;

  -- 库存检查：-1=无限库存, 0=售罄, >0=有限库存
  _stock_key := CASE WHEN p_product_type = 'recharge' THEN 'recharge_stock' ELSE 'card_stock' END;
  SELECT value::INT INTO _stock FROM product_settings WHERE key = _stock_key;
  IF _stock = 0 THEN
    RAISE EXCEPTION '该商品已售罄';
  ELSIF _stock > 0 AND p_quantity > _stock THEN
    RAISE EXCEPTION '库存不足，当前剩余 % 张', _stock;
  END IF;

  INSERT INTO orders (
    quantity, unit_price, total_price,
    customer_name, customer_phone, customer_email,
    shipping_address, status, product_type
  ) VALUES (
    p_quantity, p_unit_price, p_total_price,
    p_customer_name, p_customer_phone, NULLIF(TRIM(p_customer_email), ''),
    p_shipping_address, 'pending_payment', p_product_type
  )
  RETURNING * INTO _rec;

  -- 有限库存才扣减（-1 和 0 不扣减）
  IF _stock > 0 THEN
    UPDATE product_settings SET value = (_stock - p_quantity)::TEXT, updated_at = now()
    WHERE key = _stock_key;
  END IF;

  -- RETURN NEXT 赋值输出参数，避免 RETURN QUERY 中 AS 别名歧义
  order_number  := _rec.order_number;
  tracking_code := _rec.tracking_code;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 允许匿名调用 create_order（下单）
GRANT EXECUTE ON FUNCTION create_order(INT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_order(INT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 6.5 用户标记已支付 RPC（匿名调用）
--     用户在下单成功页扫码支付后点"我已支付"按钮触发
--     通过 order_number + tracking_code 双重验证，防止越权
--     仅 pending_payment 状态可调用，改为 user_paid 待 admin 确认
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION user_mark_paid(
  p_order_number  TEXT,
  p_tracking_code TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  _order_id UUID;
  _status   TEXT;
BEGIN
  IF p_order_number IS NULL OR p_tracking_code IS NULL THEN
    RAISE EXCEPTION '订单号和查询码不能为空';
  END IF;

  -- 验证订单号 + 查询码匹配
  SELECT id, status INTO _order_id, _status
  FROM public.orders
  WHERE order_number = p_order_number AND tracking_code = p_tracking_code;

  IF _order_id IS NULL THEN
    RAISE EXCEPTION '订单号或查询码不正确';
  END IF;

  IF _status <> 'pending_payment' THEN
    RAISE EXCEPTION '当前订单状态不支持此操作（%）', _status;
  END IF;

  UPDATE public.orders
  SET status = 'user_paid', updated_at = now()
  WHERE id = _order_id AND status = 'pending_payment';
END;
$$;

GRANT EXECUTE ON FUNCTION user_mark_paid(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION user_mark_paid(TEXT, TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 7. RLS — 行级安全策略
--
--    orders 表：
--      匿名用户：无直接表访问（通过 create_order RPC 下单，query_order RPC 查询）
--      管理员（is_admin()）：可 SELECT / UPDATE 全部订单
--
--    admin_users 表：
--      仅管理员可读（防止邮箱枚举）
-- ------------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 移除旧的宽松策略（如果存在）
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "auth_select_orders" ON orders;
DROP POLICY IF EXISTS "auth_update_orders" ON orders;

-- 仅管理员可查看所有订单
CREATE POLICY "admin_select_orders"
  ON orders FOR SELECT TO authenticated
  USING (is_admin());

-- 仅管理员可更新订单（确认、发货、取消）
CREATE POLICY "admin_update_orders"
  ON orders FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- admin_users 表 RLS：仅管理员可读
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_admin_users" ON admin_users;
CREATE POLICY "admin_read_admin_users"
  ON admin_users FOR SELECT TO authenticated
  USING (is_admin());

-- ------------------------------------------------------------
-- 8. RPC 函数：匿名用户通过订单号 + 查询码查询物流
--    只返回物流相关字段，不返回收货地址、手机号等隐私信息
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION query_order(p_order_number TEXT, p_tracking_code TEXT)
RETURNS TABLE (
  order_number    TEXT,
  status          TEXT,
  quantity        INT,
  total_price     NUMERIC,
  courier_company TEXT,
  tracking_number TEXT,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.order_number,
    o.status,
    o.quantity,
    o.total_price,
    o.courier_company,
    o.tracking_number,
    o.created_at,
    o.updated_at
  FROM orders o
  WHERE o.order_number = p_order_number
    AND o.tracking_code = p_tracking_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 允许匿名调用 query_order
GRANT EXECUTE ON FUNCTION query_order(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION query_order(TEXT, TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 9. 产品设置表 — 价格 + 库存管理
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO product_settings(key, value) VALUES('card_price', '58') ON CONFLICT(key) DO NOTHING;
INSERT INTO product_settings(key, value) VALUES('card_stock', '-1')  ON CONFLICT(key) DO NOTHING;
INSERT INTO product_settings(key, value) VALUES('recharge_price', '80') ON CONFLICT(key) DO NOTHING;
INSERT INTO product_settings(key, value) VALUES('recharge_stock', '-1')  ON CONFLICT(key) DO NOTHING;

-- 公开 RPC：前端读取价格和库存（下单页用）
-- SECURITY DEFINER：以函数所有者权限运行，绕过 RLS 和 anon 缺少表权限的问题
CREATE OR REPLACE FUNCTION get_product_info()
RETURNS TABLE(key TEXT, value TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT ps.key, ps.value FROM product_settings ps
  WHERE ps.key IN ('card_price', 'card_stock', 'recharge_price', 'recharge_stock');
$$;

GRANT EXECUTE ON FUNCTION get_product_info() TO anon, authenticated;
-- GitHub Actions 使用 service_role 同步供应商库存。
GRANT SELECT, UPDATE ON public.product_settings TO service_role;

-- ------------------------------------------------------------
-- 10. Admin RPC：管理员查询所有订单（SECURITY DEFINER 绕过 RLS）
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_get_orders(p_filter TEXT DEFAULT NULL)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users a
    JOIN auth.users u ON LOWER(u.email) = LOWER(a.email)
    WHERE u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'permission denied: not an admin';
  END IF;

  RETURN QUERY
    SELECT * FROM public.orders o
    WHERE (p_filter IS NULL OR o.status = p_filter)
    ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_orders(TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 10. Admin RPC：管理员更新订单（SECURITY DEFINER 绕过 RLS）
--     admin.html 通过 sb.rpc('admin_update_order') 调用
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_update_order(
  p_order_id UUID,
  p_status TEXT DEFAULT NULL,
  p_courier_company TEXT DEFAULT NULL,
  p_tracking_number TEXT DEFAULT NULL,
  p_admin_remark TEXT DEFAULT NULL
)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users a
    JOIN auth.users u ON LOWER(u.email) = LOWER(a.email)
    WHERE u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'permission denied: not an admin';
  END IF;

  RETURN QUERY
    UPDATE public.orders
    SET
      status = COALESCE(p_status, status),
      courier_company = COALESCE(p_courier_company, courier_company),
      tracking_number = COALESCE(p_tracking_number, tracking_number),
      admin_remark = COALESCE(p_admin_remark, admin_remark),
      updated_at = now()
    WHERE id = p_order_id
    RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_order(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 12. Admin RPC：管理产品设置（价格、库存）
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_get_settings()
RETURNS TABLE(key TEXT, value TEXT, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users a
    JOIN auth.users u ON LOWER(u.email) = LOWER(a.email)
    WHERE u.id = auth.uid()
  ) THEN RAISE EXCEPTION 'permission denied: not an admin'; END IF;

  RETURN QUERY SELECT ps.key, ps.value, ps.updated_at FROM public.product_settings ps;
END;
$$;
GRANT EXECUTE ON FUNCTION admin_get_settings() TO authenticated;

CREATE OR REPLACE FUNCTION admin_update_settings(p_key TEXT, p_value TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users a
    JOIN auth.users u ON LOWER(u.email) = LOWER(a.email)
    WHERE u.id = auth.uid()
  ) THEN RAISE EXCEPTION 'permission denied: not an admin'; END IF;

  INSERT INTO public.product_settings(key, value, updated_at)
  VALUES(p_key, p_value, now())
  ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;
END;
$$;
GRANT EXECUTE ON FUNCTION admin_update_settings(TEXT, TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 13. 部署清单（手动执行）
--    a. 将本文件全部内容粘贴到 Supabase SQL Editor 运行
--    b. 添加管理员邮箱：
--       INSERT INTO admin_users(email) VALUES('你的管理员邮箱@example.com');
--    c. 在 Supabase Dashboard → Authentication → Users 创建对应账号
--    d. 在 Authentication → Settings 关闭 "Enable email signups"（禁止公开注册）
-- ============================================================
