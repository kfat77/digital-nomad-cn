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
  // 商品配置（双产品，DB 优先，此处为 fallback）
  PRODUCTS: {
    card: {
      name: 'giffgaff 电话卡',
      description: '英国 +44 号码 · 实体 SIM 卡 · 跨境邮寄',
      price: 58,
      stockKey: 'card_stock',
      priceKey: 'card_price'
    },
    recharge: {
      name: 'giffgaff 10英镑充值券（不含白卡）',
      description: '10英镑充值额度 · 不含实体SIM卡 · 充值码在线发送',
      price: 80,
      stockKey: 'recharge_stock',
      priceKey: 'recharge_price'
    }
  },
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
    url: 'https://xbebxoxgghyjtwaqxoes.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZWJ4b3hnZ2h5anR3YXF4b2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzM3MzYsImV4cCI6MjEwMDE0OTczNn0.VrWAG3Q_gW2gax5svroCEuhAEOgV9cGknxv1iObh_C8'
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
    pending_payment: '待支付',
    user_paid: '待确认收款',
    pending: '待处理',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
};
