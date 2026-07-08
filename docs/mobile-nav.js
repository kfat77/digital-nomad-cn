/**
 * Mobile Bottom Navigation Bar
 * Auto-injected on mobile devices for quick access to core features
 */

(function() {
  // Only show on mobile
  if (window.innerWidth > 768) return;
  if (document.getElementById('mobile-bottom-nav')) return;

  const currentPath = window.location.pathname;
  const isEn = currentPath.includes('/en/');

  const navItems = isEn ? [
    { icon: '🏠', label: 'Home', href: '/digital-nomad-cn/en/' },
    { icon: '🌍', label: 'Countries', href: '/digital-nomad-cn/en/countries/' },
    { icon: '🎯', label: 'Recommend', href: '/digital-nomad-cn/en/recommend/' },
    { icon: '🤖', label: 'AI', href: '/digital-nomad-cn/en/assistant/' },
  ] : [
    { icon: '🏠', label: '首页', href: '/digital-nomad-cn/' },
    { icon: '🌍', label: '国家', href: '/digital-nomad-cn/country/' },
    { icon: '🎯', label: '推荐', href: '/digital-nomad-cn/recommend/' },
    { icon: '🤖', label: 'AI助手', href: '/digital-nomad-cn/assistant/' },
  ];

  const nav = document.createElement('nav');
  nav.id = 'mobile-bottom-nav';
  nav.innerHTML = navItems.map(item => {
    const isActive = currentPath === item.href || currentPath.startsWith(item.href.replace(/\/$/, ''));
    return `<a href="${item.href}" class="mbn-item${isActive ? ' active' : ''}">
      <span class="mbn-icon">${item.icon}</span>
      <span class="mbn-label">${item.label}</span>
    </a>`;
  }).join('');

  const style = document.createElement('style');
  style.textContent = `
    #mobile-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: var(--bg, #fff);
      border-top: 1px solid var(--border, #e5e5e5);
      padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
      z-index: 1000;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    #mobile-bottom-nav .mbn-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 4px 12px;
      text-decoration: none;
      color: var(--muted, #666);
      transition: color 0.2s;
      flex: 1;
    }
    #mobile-bottom-nav .mbn-item.active {
      color: var(--accent, #2563eb);
    }
    #mobile-bottom-nav .mbn-icon {
      font-size: 20px;
      line-height: 1;
    }
    #mobile-bottom-nav .mbn-label {
      font-size: 10px;
      font-weight: 500;
    }
    /* Add bottom padding to body to prevent content being hidden behind nav */
    body { padding-bottom: 64px !important; }
    .footer { margin-bottom: 64px; }
  `;

  document.head.appendChild(style);
  document.body.appendChild(nav);
})();
