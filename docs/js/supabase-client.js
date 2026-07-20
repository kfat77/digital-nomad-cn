/**
 * Supabase 客户端初始化
 * 依赖：@supabase/supabase-js@2 (CDN UMD)
 *       需在 HTML 中先引入 supabase.min.js
 *       再引入 config.js → supabase-client.js
 *
 * 初始化后挂载到 window.sb（全局可用）
 */
(function () {
  var cfg = (window.SITE_CONFIG || {}).SUPABASE || {};

  if (!cfg.url || !cfg.anonKey || cfg.url === 'YOUR_SUPABASE_URL') {
    console.warn('[Supabase] 未配置 URL 或 anon key，请在 js/config.js 中填写。');
    window.sb = null;
    return;
  }

  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.error('[Supabase] SDK 未加载，请检查 script 标签引入顺序。');
    window.sb = null;
    return;
  }

  window.sb = window.supabase.createClient(cfg.url, cfg.anonKey);
})();
