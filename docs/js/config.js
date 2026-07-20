/**
 * 站点配置 · giffgaff 电话卡订单系统 V1
 *
 * 部署前需要替换以下内容：
 * 1. SUPABASE.url  → 你的 Supabase Project URL
 * 2. SUPABASE.anonKey → 你的 Supabase anon key
 * 3. CUSTOMER_SERVICE → 客服联系方式
 * 4. PRODUCT.price → 商品单价（如需调整）
 */
window.SITE_CONFIG = {
  // 商品配置（单品，写死在前端）
  PRODUCT: {
    name: 'giffgaff 电话卡',
    description: '英国 +44 号码 · 实体 SIM 卡 · 跨境邮寄',
    price: 58,
    currency: 'CNY',
    currencySymbol: '¥'
  },

  // Supabase 配置
  // 获取方式：Supabase Dashboard → Project Settings → API
  SUPABASE: {
    url: 'https://xbeboxgghyjtwqoxes.supabase.co',
    anonKey: 'sb_publishable_yAwFFu09wZGS_L_3w_YCbQ_68D3Id4_'
  },

  // 客服联系方式
  CUSTOMER_SERVICE: {
    wechat: 'BCI1277',
    description: '如有疑问，扫码或搜索微信号添加客服'
  },

  // 管理员邮箱白名单（前端双重校验，后端 RLS 也会检查）
  // 部署时：替换为实际管理员邮箱，需与 Supabase Auth 注册邮箱 + admin_users 表一致
  ADMIN: {
    emails: ['kfat750@gmail.com']
  },

  // 订单状态中文映射
  ORDER_STATUS: {
    pending: '待处理',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
};
