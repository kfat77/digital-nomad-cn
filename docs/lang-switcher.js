/**
 * Language Switcher Component
 * 
 * Features:
 * - Auto-detects current language from URL path
 * - Links to corresponding page in alternate language
 * - Falls back to homepage if translated page doesn't exist
 * - Injects a polished language switcher into the header
 */
(function() {
  'use strict';

  const BASE_URL = 'https://kfat77.github.io/digital-nomad-cn';

  // Language configuration
  const CONFIG = {
    zh: {
      code: 'zh-CN',
      label: '中文',
      flag: '🇨🇳',
      pathPrefix: ''
    },
    en: {
      code: 'en',
      label: 'English',
      flag: '🇬🇧',
      pathPrefix: '/en'
    }
  };

  // URL mapping for pages that have different paths between languages
  const PATH_MAP = {
    // Chinese -> English
    '/country/': '/en/countries/',
    '/visa/': '/en/visas/',
    '/city/': '/en/cities/',
    '/articles/': '/en/articles/',
    '/compare/': '/en/compare/',
    '/routes/': '/en/routes/',
    '/search/': '/en/search/',
    '/recommend/': '/en/recommend/',
    '/assistant/': '/en/assistant/',
    '/faq/': '/en/faq/',
    // English -> Chinese
    '/en/countries/': '/country/',
    '/en/visas/': '/visa/',
    '/en/cities/': '/city/',
    '/en/articles/': '/articles/',
    '/en/compare/': '/compare/',
    '/en/routes/': '/routes/',
    '/en/search/': '/search/',
    '/en/recommend/': '/recommend/',
    '/en/assistant/': '/assistant/',
    '/en/faq/': '/faq/',
  };

  function detectLanguage() {
    const path = window.location.pathname;
    // Remove base path if site is in subfolder
    const relativePath = path.replace(/^\/digital-nomad-cn/, '');
    return relativePath.startsWith('/en/') ? 'en' : 'zh';
  }

  function getAlternateUrl() {
    const path = window.location.pathname;
    const relativePath = path.replace(/^\/digital-nomad-cn/, '');
    const currentLang = detectLanguage();
    const targetLang = currentLang === 'zh' ? 'en' : 'zh';

    // Try path mapping first
    for (const [from, to] of Object.entries(PATH_MAP)) {
      if (relativePath.startsWith(from)) {
        const alternatePath = relativePath.replace(from, to);
        return alternatePath;
      }
    }

    // Default: add or remove /en/ prefix
    if (currentLang === 'zh') {
      return '/en' + relativePath;
    } else {
      return relativePath.replace(/^\/en/, '') || '/';
    }
  }

  function createSwitcher() {
    const currentLang = detectLanguage();
    const targetLang = currentLang === 'zh' ? 'en' : 'zh';
    const targetConfig = CONFIG[targetLang];
    const alternateUrl = getAlternateUrl();

    // Create switcher element
    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    switcher.innerHTML = `
      <a href="${alternateUrl}" class="lang-switcher-btn" 
         hreflang="${targetConfig.code}" 
         title="Switch to ${targetConfig.label}"
         aria-label="Switch to ${targetConfig.label}">
        <span class="lang-flag">${targetConfig.flag}</span>
        <span class="lang-label">${targetConfig.label}</span>
      </a>
    `;

    return switcher;
  }

  function injectStyles() {
    if (document.getElementById('lang-switcher-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'lang-switcher-styles';
    style.textContent = `
      .lang-switcher {
        display: inline-flex;
        align-items: center;
        margin-left: 8px;
      }
      .lang-switcher-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: rgba(255,255,255,0.05);
        color: #ffffff;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        transition: all 0.2s ease;
      }
      .lang-switcher-btn:hover {
        background: rgba(255,255,255,0.1);
        border-color: rgba(255,255,255,0.2);
      }
      .lang-switcher-btn .lang-flag {
        font-size: 1rem;
        line-height: 1;
      }
      .lang-switcher-btn .lang-label {
        line-height: 1;
      }
      @media (max-width: 768px) {
        .lang-switcher-btn .lang-label {
          display: none;
        }
        .lang-switcher-btn {
          padding: 6px 8px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();

    // Find header inner container
    const headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;

    // Check if a switcher already exists
    if (headerInner.querySelector('.lang-switcher')) return;

    // Find the GitHub button or theme toggle to insert before
    const githubBtn = headerInner.querySelector('.github-btn');
    const themeToggle = headerInner.querySelector('.theme-toggle');
    
    const switcher = createSwitcher();
    
    if (githubBtn && githubBtn.nextSibling) {
      headerInner.insertBefore(switcher, githubBtn.nextSibling);
    } else if (themeToggle) {
      headerInner.insertBefore(switcher, themeToggle);
    } else {
      headerInner.appendChild(switcher);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
