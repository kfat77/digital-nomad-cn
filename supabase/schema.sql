-- ============================================================
-- giffgaff 电话卡订单系统 · V1 MVP（安全修复版）
-- 单表设计：orders + admin_users 白名单
-- 执行方式：粘贴到 Supabase SQL Editor 运行
--
-- 安全修复：
--   P0-1: 新增 create_order RPC，匿名用户不直接 INSERT 表
--   P0-2: admin_users 白名单 + is_admin() 函数，仅管理员可 SELECT/UPDATE
--   P2-7: 所有 SECURITY DEFINER 函数加 search_path
-- ============================================================

-- ------------------------------------------------------------
-- 1. orders 表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,
  tracking_code   TEXT NOT NULL,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price      NUMERIC(10,2) NOT NULL,
  total_price     NUMERIC(10,2) NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,
  shipping_address TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','shipped','completed','cancelled')),
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
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
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
  p_shipping_address TEXT
) RETURNS TABLE(
  order_number  TEXT,
  tracking_code TEXT
) AS $$
DECLARE
  v_order_number  TEXT;
  v_tracking_code TEXT;
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

  INSERT INTO orders (
    quantity, unit_price, total_price,
    customer_name, customer_phone, customer_email,
    shipping_address, status
  ) VALUES (
    p_quantity, p_unit_price, p_total_price,
    p_customer_name, p_customer_phone, NULLIF(TRIM(p_customer_email), ''),
    p_shipping_address, 'pending'
  )
  RETURNING order_number, tracking_code INTO v_order_number, v_tracking_code;

  RETURN QUERY SELECT v_order_number, v_tracking_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 允许匿名调用 create_order（下单）
GRANT EXECUTE ON FUNCTION create_order(INT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_order(INT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT) TO authenticated;

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
-- 9. 部署清单（手动执行）
--    a. 将本文件全部内容粘贴到 Supabase SQL Editor 运行
--    b. 添加管理员邮箱：
--       INSERT INTO admin_users(email) VALUES('你的管理员邮箱@example.com');
--    c. 在 Supabase Dashboard → Authentication → Users 创建对应账号
--    d. 在 Authentication → Settings 关闭 "Enable email signups"（禁止公开注册）
-- ============================================================
