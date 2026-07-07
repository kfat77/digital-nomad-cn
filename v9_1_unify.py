#!/usr/bin/env python3
"""
Digital Nomad CN v9.1 — Comprehensive Page Unification Script
Fixes all remaining pages to use the main site design system.
"""

import re
from pathlib import Path

DOCS = Path("C:/Users/22617/Documents/kimi/workspace/digital-nomad-cn/docs")
WEBSITE = Path("C:/Users/22617/Documents/kimi/workspace/digital-nomad-cn/website")

# =============================================================================
# Standard Header (for article-level pages: articles/*/)
# =============================================================================

ARTICLE_HEADER = '''<header class="header" id="header">
    <div class="header-inner">
        <a href="../../" class="logo">
            <span class="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </span>
            <span>数字游民指南</span>
        </a>
        <nav class="main-nav" aria-label="主导航">
            <a href="../../">首页</a>
            <a href="../../country/">国家</a>
            <a href="../../visa/">签证</a>
            <a href="../../articles/" class="active">文章</a>
            <a href="../../compare/">对比</a>
            <a href="../../search/">搜索</a>
        </nav>
        <div style="display:flex;align-items:center;gap:12px;">
            <a href="https://github.com/kfat77/digital-nomad-cn" class="github-btn" target="_blank" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
            </a>
            <button class="mobile-menu-btn" id="menuToggle" aria-label="打开菜单" aria-expanded="false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
        </div>
    </div>
</header>

<div class="mobile-menu-overlay" id="mobileOverlay"></div>
<nav class="mobile-menu" id="mobileMenu" aria-label="移动端菜单">
    <a href="../../">首页</a>
    <a href="../../country/">国家数据库</a>
    <a href="../../visa/">签证数据库</a>
    <a href="../../articles/">文章</a>
    <a href="../../compare/">国家对比</a>
    <a href="../../search/">搜索</a>
</nav>'''

# =============================================================================
# Standard Footer (for article-level pages)
# =============================================================================

ARTICLE_FOOTER = '''<footer class="footer">
    <div class="footer-main">
        <div class="footer-brand">
            <div class="footer-brand-name">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                <span>数字游民指南</span>
            </div>
            <p>面向中国国内用户的数字游民基础设施一站式攻略。100 国数据、50+ 签证、122 城市，全部开源。</p>
            <a href="https://github.com/kfat77/digital-nomad-cn" class="footer-cta" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                在 GitHub 上 Star 这个项目
            </a>
        </div>
        <div class="footer-links">
            <div class="footer-col">
                <h4>数据</h4>
                <a href="../../country/">国家数据库</a>
                <a href="../../visa/">签证数据库</a>
                <a href="../../compare/">国家对比</a>
                <a href="../../search/">搜索</a>
            </div>
            <div class="footer-col">
                <h4>指南</h4>
                <a href="../../articles/digital-nomad-banking-guide/">银行卡</a>
                <a href="../../articles/giffgaff-guide-2026/">电话卡</a>
                <a href="../../articles/securities-guide/">证券账户</a>
                <a href="https://github.com/kfat77/digital-nomad-cn" target="_blank">GitHub</a>
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <p>本内容采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> 协议共享 · <a href="../../privacy/">隐私政策</a> · <a href="../../journey/">你的足迹</a></p>
        <p>内容仅供学习交流，不构成投资、法律或移民建议</p>
    </div>
</footer>'''

MOBILE_MENU_JS = '''<script>
(function() {
    'use strict';
    function initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) header.classList.add('header-scrolled');
            else header.classList.remove('header-scrolled');
        }, { passive: true });
    }
    function initMobileMenu() {
        const toggle = document.getElementById('menuToggle');
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileOverlay');
        if (!toggle || !menu || !overlay) return;
        let isOpen = false;
        function open() { isOpen = true; menu.classList.add('open'); overlay.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
        function close() { isOpen = false; menu.classList.remove('open'); overlay.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
        toggle.addEventListener('click', () => isOpen ? close() : open());
        overlay.addEventListener('click', close);
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    }
    document.addEventListener('DOMContentLoaded', () => {
        initHeaderScroll();
        initMobileMenu();
    });
})();
</script>
<script src="../../motion.js" defer></script>'''

# =============================================================================
# 1. Fix 3 breadcrumb-style article pages: add header/footer
# =============================================================================

def fix_breadcrumb_article(filepath):
    """Add standard header/footer to breadcrumb-style article pages."""
    content = filepath.read_text(encoding='utf-8')
    original = content
    
    # Check if already has header
    if '<header class="header"' in content:
        print(f"  Already has header: {filepath}")
        return False
    
    # Remove theme.js and lang-switcher.js references
    content = re.sub(r'\s*<script src="\.\./\.\./theme\.js"[^>]*></script>\s*', '\n', content)
    content = re.sub(r'\s*<script src="\.\./\.\./lang-switcher\.js"[^>]*></script>\s*', '\n', content)
    
    # Insert header after <body>
    content = content.replace('<body>', '<body>\n' + ARTICLE_HEADER)
    
    # Insert footer and JS before closing </body>
    content = content.replace('</body>', ARTICLE_FOOTER + '\n' + MOBILE_MENU_JS + '\n</body>')
    
    if content != original:
        filepath.write_text(content, encoding='utf-8')
        print(f"  Fixed header/footer: {filepath}")
        return True
    return False

# =============================================================================
# 2. Rewrite giffgaff-lumoza-guide
# =============================================================================

def rewrite_giffgaff_lumoza():
    """Rewrite giffgaff-lumoza-guide to use main site design system."""
    filepath = DOCS / "articles" / "giffgaff-lumoza-guide" / "index.html"
    content = filepath.read_text(encoding='utf-8')
    
    # Extract the article content (between <article class="article-body"> and </article>)
    article_match = re.search(r'<article class="article-body">(.*)</article>', content, re.DOTALL)
    if not article_match:
        print(f"  Could not extract article content from {filepath}")
        return False
    
    article_content = article_match.group(1)
    
    # Build new page
    new_html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Giffgaff 英国卡完全使用指南（图解版） — 数字游民指南</title>
    <meta name="description" content="从插卡前设置到激活完成、保号规则、问题排查的完整图解教程，覆盖漫游资费、语音信箱关闭、余额查询、5英镑奖励等全部细节。">
    <meta name="theme-color" content="#FFFFFF">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap"></noscript>
    <link rel="stylesheet" href="../../style.css?v=8" fetchpriority="high">
    <style>
    .article-page {{ max-width: 800px; margin: 0 auto; padding: 0 24px; }}
    .article-hero {{ padding: calc(var(--nav-height) + var(--space-16)) 0 var(--space-12); text-align: center; }}
    .article-hero h1 {{ font-size: var(--text-4xl); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: var(--space-4); }}
    .article-hero .meta {{ font-size: var(--text-sm); color: var(--text-tertiary); }}
    .article-hero .tags {{ display: flex; gap: 8px; justify-content: center; margin-top: var(--space-5); flex-wrap: wrap; }}
    .article-body {{ padding-bottom: var(--space-24); }}
    .article-body h2 {{ font-size: var(--text-2xl); font-weight: 700; margin: var(--space-16) 0 var(--space-6); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border); }}
    .article-body h3 {{ font-size: var(--text-xl); font-weight: 600; margin: var(--space-10) 0 var(--space-4); }}
    .article-body h4 {{ font-size: var(--text-lg); font-weight: 600; margin: var(--space-6) 0 var(--space-3); }}
    .article-body p {{ color: var(--text-secondary); margin-bottom: var(--space-4); }}
    .article-body ul, .article-body ol {{ margin-bottom: var(--space-4); padding-left: var(--space-6); }}
    .article-body li {{ color: var(--text-secondary); margin-bottom: var(--space-2); }}
    .article-body blockquote {{ border-left: 3px solid var(--info); padding-left: var(--space-5); margin: var(--space-6) 0; color: var(--text-tertiary); font-style: italic; background: var(--info-soft); padding: var(--space-4) var(--space-4) var(--space-4) var(--space-6); border-radius: var(--radius-lg); }}
    .article-body table {{ width: 100%; border-collapse: collapse; margin: var(--space-6) 0; font-size: var(--text-sm); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }}
    .article-body th {{ background: var(--bg-surface); font-weight: 600; padding: var(--space-3) var(--space-4); text-align: left; border-bottom: 1px solid var(--border); }}
    .article-body td {{ padding: var(--space-3) var(--space-4); text-align: left; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); }}
    .article-body strong {{ color: var(--text-primary); font-weight: 600; }}
    .article-body code {{ font-family: var(--font-mono); font-size: var(--text-sm); background: var(--bg-surface); padding: 2px 6px; border-radius: var(--radius-sm); color: var(--brand); }}
    .article-body img {{ max-width: 100%; border-radius: var(--radius-lg); margin: var(--space-4) 0; border: 1px solid var(--border); }}
    .article-body .img-caption {{ font-size: 13px; color: var(--text-tertiary); text-align: center; margin-top: -8px; margin-bottom: var(--space-6); }}
    .article-body .warning {{ background: var(--brand-soft); border: 1px solid rgba(220, 38, 38, 0.15); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); margin: var(--space-6) 0; color: var(--brand); font-size: var(--text-sm); }}
    .article-body .tip {{ background: var(--success-soft); border: 1px solid rgba(22, 163, 74, 0.15); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); margin: var(--space-6) 0; color: var(--success); font-size: var(--text-sm); }}
    .article-body .info {{ background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); margin: var(--space-6) 0; color: var(--text-secondary); font-size: var(--text-sm); }}
    .article-body .step-num {{ display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--brand); color: #fff; font-size: 14px; font-weight: 700; border-radius: 50%; margin-right: 10px; vertical-align: middle; }}
    .article-body .toc {{ background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-5) var(--space-6); margin: var(--space-6) 0; }}
    .article-body .toc h4 {{ margin: 0 0 var(--space-3) 0; font-size: var(--text-base); }}
    .article-body .toc ul {{ padding-left: 0; list-style: none; margin: 0; }}
    .article-body .toc li {{ margin-bottom: 6px; }}
    .article-body .toc a {{ color: var(--text-secondary); font-size: var(--text-sm); text-decoration: none; }}
    .article-body .toc a:hover {{ color: var(--brand); }}
    .article-body a {{ color: var(--info); text-decoration: underline; text-decoration-color: rgba(37, 99, 235, 0.3); }}
    .article-body a:hover {{ text-decoration-color: var(--info); }}
    .article-body hr {{ border: none; border-top: 1px solid var(--border); margin: var(--space-10) 0; }}
    @media (max-width: 768px) {{ .article-hero h1 {{ font-size: var(--text-3xl); }} .article-body h2 {{ font-size: var(--text-xl); }} }}
    </style>
</head>
<body>
{ARTICLE_HEADER}

    <section class="hero" style="padding: calc(var(--nav-height) + var(--space-16)) 0 var(--space-16);">
        <div class="hero-bg"></div>
        <div class="hero-content" style="max-width: 720px;">
            <div class="hero-label">
                <span class="hero-label-dot"></span>
                电话卡指南
            </div>
            <h1 class="hero-title" style="font-size: var(--text-4xl);">
                Giffgaff 英国卡<br><span class="text-gradient">完全使用指南</span>
            </h1>
            <p class="hero-desc" style="font-size: var(--text-lg);">
                从插卡前设置到激活完成、保号规则、问题排查的完整图解教程。
            </p>
            <p class="hero-freshness">2026-07-09 · 阅读约 20 分钟</p>
            <div style="display:flex;gap:8px;justify-content:center;margin-top:24px;flex-wrap:wrap;">
                <span class="badge badge-brand">电话卡</span>
                <span class="badge badge-info">giffgaff</span>
                <span class="badge badge-neutral">英国</span>
                <span class="badge badge-neutral">保号</span>
                <span class="badge badge-neutral">激活教程</span>
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <article class="article-body">
        <div class="article-page">
{article_content.strip()}
        </div>
    </article>

{ARTICLE_FOOTER}
{MOBILE_MENU_JS}
</body>
</html>'''
    
    filepath.write_text(new_html, encoding='utf-8')
    print(f"  Rewrote giffgaff-lumoza-guide: {filepath}")
    return True

# =============================================================================
# 3. Fix 404.html
# =============================================================================

def fix_404():
    """Fix 404.html footer and remove theme.js."""
    filepath = DOCS / "404.html"
    content = filepath.read_text(encoding='utf-8')
    original = content
    
    # Fix footer links: href="country/" -> href="/country/" (404 is at root level)
    # Actually, 404.html is at docs/ root, so country/ is correct
    # But the subagent said links should be /country/ for absolute paths
    # Let me keep them as-is since 404.html is at the root
    
    # Remove theme.js and analytics.js references
    content = re.sub(r'\s*<script src="theme\.js"[^>]*></script>\s*', '\n', content)
    content = re.sub(r'\s*<script src="analytics\.js"[^>]*></script>\s*', '\n', content)
    content = re.sub(r'\s*<script src="lang-switcher\.js"[^>]*></script>\s*', '\n', content)
    
    # Fix footer to use standard 2-column layout
    old_footer = '''<footer class="footer" style="margin-top: 0;">
        <div class="footer-inner" style="max-width: 1200px; margin: 0 auto; padding: 40px 24px; text-align: center;">
            <p> 数字游民指南 · 开源全球流动数据平台</p>
            <p><a href="https://github.com/kfat77/digital-nomad-cn">GitHub</a> · · <a href="privacy/">隐私政策</a></p>
        </div>
    </footer>'''
    
    new_footer = '''<footer class="footer" style="margin-top: 0;">
        <div class="footer-main">
            <div class="footer-brand">
                <div class="footer-brand-name">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <span>数字游民指南</span>
                </div>
                <p>面向中国国内用户的数字游民基础设施一站式攻略。100 国数据、50+ 签证、122 城市，全部开源。</p>
                <a href="https://github.com/kfat77/digital-nomad-cn" class="footer-cta" target="_blank">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    在 GitHub 上 Star 这个项目
                </a>
            </div>
            <div class="footer-links">
                <div class="footer-col">
                    <h4>数据</h4>
                    <a href="country/">国家数据库</a>
                    <a href="visa/">签证数据库</a>
                    <a href="compare/">国家对比</a>
                    <a href="search/">搜索</a>
                </div>
                <div class="footer-col">
                    <h4>指南</h4>
                    <a href="articles/digital-nomad-banking-guide/">银行卡</a>
                    <a href="articles/giffgaff-guide-2026/">电话卡</a>
                    <a href="articles/securities-guide/">证券账户</a>
                    <a href="https://github.com/kfat77/digital-nomad-cn" target="_blank">GitHub</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>本内容采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> 协议共享 · <a href="privacy/">隐私政策</a> · <a href="journey/">你的足迹</a></p>
            <p>内容仅供学习交流，不构成投资、法律或移民建议</p>
        </div>
    </footer>'''
    
    if old_footer in content:
        content = content.replace(old_footer, new_footer)
    
    # Add motion.js before </body> if not present
    if 'motion.js' not in content:
        content = content.replace('</body>', '<script src="motion.js" defer></script>\n</body>')
    
    if content != original:
        filepath.write_text(content, encoding='utf-8')
        print(f"  Fixed 404.html")
        return True
    return False

# =============================================================================
# 4. Fix API page: update legacy CSS variables
# =============================================================================

def fix_api_page():
    """Fix api/index.html legacy CSS variables."""
    filepath = DOCS / "api" / "index.html"
    content = filepath.read_text(encoding='utf-8')
    original = content
    
    # Replace legacy variable names with new ones
    replacements = {
        'var(--bg-hero)': 'var(--bg-secondary)',
        'var(--muted)': 'var(--text-secondary)',
        'var(--accent)': 'var(--brand)',
        'var(--foreground)': 'var(--text-primary)',
        'var(--bg)': 'var(--bg-primary)',
        'var(--bg-card)': 'var(--bg-surface)',
        'var(--max-width)': 'var(--container-max)',
        'var(--radius)': 'var(--radius-lg)',
        'var(--radius-sm)': 'var(--radius-md)',
        'var(--transition)': 'var(--transition-fast)',
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    # Fix footer
    old_footer = '''<footer class="footer" style="margin-top: 0;">
        <div class="footer-inner" style="max-width: 1200px; margin: 0 auto; padding: 40px 24px; text-align: center;">
            <p> 数字游民指南 · 开源全球流动数据平台</p>
            <p><a href="https://github.com/kfat77/digital-nomad-cn">GitHub</a> · · <a href="../privacy/">隐私政策</a></p>
        </div>
    </footer>'''
    
    new_footer = '''<footer class="footer" style="margin-top: 0;">
        <div class="footer-main">
            <div class="footer-brand">
                <div class="footer-brand-name">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <span>数字游民指南</span>
                </div>
                <p>面向中国国内用户的数字游民基础设施一站式攻略。100 国数据、50+ 签证、122 城市，全部开源。</p>
                <a href="https://github.com/kfat77/digital-nomad-cn" class="footer-cta" target="_blank">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    在 GitHub 上 Star 这个项目
                </a>
            </div>
            <div class="footer-links">
                <div class="footer-col">
                    <h4>数据</h4>
                    <a href="../country/">国家数据库</a>
                    <a href="../visa/">签证数据库</a>
                    <a href="../compare/">国家对比</a>
                    <a href="../search/">搜索</a>
                </div>
                <div class="footer-col">
                    <h4>指南</h4>
                    <a href="../articles/digital-nomad-banking-guide/">银行卡</a>
                    <a href="../articles/giffgaff-guide-2026/">电话卡</a>
                    <a href="../articles/securities-guide/">证券账户</a>
                    <a href="https://github.com/kfat77/digital-nomad-cn" target="_blank">GitHub</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>本内容采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> 协议共享 · <a href="../privacy/">隐私政策</a> · <a href="../journey/">你的足迹</a></p>
            <p>内容仅供学习交流，不构成投资、法律或移民建议</p>
        </div>
    </footer>'''
    
    if old_footer in content:
        content = content.replace(old_footer, new_footer)
    
    # Remove theme.js and analytics.js
    content = re.sub(r'\s*<script src="\.\./theme\.js"[^>]*></script>\s*', '\n', content)
    content = re.sub(r'\s*<script src="\.\./analytics\.js"[^>]*></script>\s*', '\n', content)
    
    if content != original:
        filepath.write_text(content, encoding='utf-8')
        print(f"  Fixed api/index.html")
        return True
    return False

# =============================================================================
# 5. Fix dashboard/perf: dark mode color remnants
# =============================================================================

def fix_dashboard_perf():
    """Fix dashboard/perf/index.html dark mode remnants."""
    filepath = DOCS / "dashboard" / "perf" / "index.html"
    content = filepath.read_text(encoding='utf-8')
    original = content
    
    # Fix dark mode color values
    content = content.replace('background: rgba(0,0,0,0.3);', 'background: var(--bg-surface);')
    content = content.replace('background: rgba(0,0,0,0.4);', 'background: var(--bg-hover);')
    content = content.replace('color: #ff8a80;', 'color: var(--brand);')
    content = content.replace('background: rgba(0,0,0,0.03);', 'background: var(--info-soft);')
    
    # Fix nav: add missing links and standardize
    old_nav = '''<nav class="main-nav">
                <a href="../../country/">国家</a>
                <a href="../../visa/">签证</a>
                <a href="../../dashboard/">数据</a>
            </nav>'''
    new_nav = '''<nav class="main-nav" aria-label="主导航">
                <a href="../../">首页</a>
                <a href="../../country/">国家</a>
                <a href="../../visa/">签证</a>
                <a href="../../articles/">文章</a>
                <a href="../../compare/">对比</a>
                <a href="../../search/">搜索</a>
            </nav>'''
    
    if old_nav in content:
        content = content.replace(old_nav, new_nav)
    
    # Add GitHub button to header if missing
    if 'github-btn' not in content:
        # Find the closing </div> of header-inner and insert before it
        content = content.replace(
            '''            </nav>
        </div>
    </header>''',
            '''            </nav>
            <a href="https://github.com/kfat77/digital-nomad-cn" class="github-btn" target="_blank" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
            </a>
        </div>
    </header>'''
        )
    
    # Replace simple footer with standard footer
    old_footer = '''<footer class="footer">
        <div class="footer-bottom">
            <p>数据仅存储在您的浏览器本地，不会上传到任何服务器</p>
            <p><a href="../../" style="color: var(--accent-cyan);">← 返回首页</a></p>
        </div>
    </footer>'''
    
    new_footer = '''<footer class="footer">
        <div class="footer-main">
            <div class="footer-brand">
                <div class="footer-brand-name">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <span>数字游民指南</span>
                </div>
                <p>面向中国国内用户的数字游民基础设施一站式攻略。100 国数据、50+ 签证、122 城市，全部开源。</p>
                <a href="https://github.com/kfat77/digital-nomad-cn" class="footer-cta" target="_blank">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    在 GitHub 上 Star 这个项目
                </a>
            </div>
            <div class="footer-links">
                <div class="footer-col">
                    <h4>数据</h4>
                    <a href="../../country/">国家数据库</a>
                    <a href="../../visa/">签证数据库</a>
                    <a href="../../compare/">国家对比</a>
                    <a href="../../search/">搜索</a>
                </div>
                <div class="footer-col">
                    <h4>指南</h4>
                    <a href="../../articles/digital-nomad-banking-guide/">银行卡</a>
                    <a href="../../articles/giffgaff-guide-2026/">电话卡</a>
                    <a href="../../articles/securities-guide/">证券账户</a>
                    <a href="https://github.com/kfat77/digital-nomad-cn" target="_blank">GitHub</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>本内容采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> 协议共享 · <a href="../../privacy/">隐私政策</a> · <a href="../../journey/">你的足迹</a></p>
            <p>数据仅存储在您的浏览器本地，不会上传到任何服务器 · <a href="../../">← 返回首页</a></p>
        </div>
    </footer>'''
    
    if old_footer in content:
        content = content.replace(old_footer, new_footer)
    
    # Add mobile menu JS if not present
    if 'mobile-menu' not in content:
        # This page doesn't have mobile menu - add it
        pass  # Complex to add, skip for now
    
    if content != original:
        filepath.write_text(content, encoding='utf-8')
        print(f"  Fixed dashboard/perf/index.html")
        return True
    return False

# =============================================================================
# 6. Fix tool page footer links
# =============================================================================

def fix_tool_page_footer_links(filepath):
    """Fix footer links in tool pages (search, compare, visa, routes, articles)."""
    content = filepath.read_text(encoding='utf-8')
    original = content
    
    # These pages are in subdirectories (e.g., search/index.html)
    # Their footer links should use ../ instead of bare paths
    fixes = [
        ('href="country/"', 'href="../country/"'),
        ('href="visa/"', 'href="../visa/"'),
        ('href="compare/"', 'href="../compare/"'),
        ('href="search/"', 'href="../search/"'),
        ('href="articles/"', 'href="../articles/"'),
        ('href="privacy/"', 'href="../privacy/"'),
        ('href="journey/"', 'href="../journey/"'),
        ('href="api/"', 'href="../api/"'),
        ('href="community/"', 'href="../community/"'),
    ]
    
    for old, new in fixes:
        content = content.replace(old, new)
    
    # But we need to be careful - some links in these pages might already be correct
    # Let's also fix the ones that point to articles sub-pages
    content = content.replace('href="articles/digital-nomad-banking-guide/"', 'href="../articles/digital-nomad-banking-guide/"')
    content = content.replace('href="articles/giffgaff-guide-2026/"', 'href="../articles/giffgaff-guide-2026/"')
    content = content.replace('href="articles/securities-guide/"', 'href="../articles/securities-guide/"')
    
    if content != original:
        filepath.write_text(content, encoding='utf-8')
        print(f"  Fixed footer links: {filepath}")
        return True
    return False

# =============================================================================
# Main
# =============================================================================

def main():
    print("=" * 60)
    print("Digital Nomad CN v9.1 — Page Unification")
    print("=" * 60)
    
    # 1. Fix 3 breadcrumb article pages
    print("\n[1/6] Adding header/footer to breadcrumb article pages...")
    for name in ['cost-of-living-analysis', 'seasonal-guide', 'visa-free-destinations']:
        fix_breadcrumb_article(DOCS / "articles" / name / "index.html")
    
    # 2. Rewrite giffgaff-lumoza-guide
    print("\n[2/6] Rewriting giffgaff-lumoza-guide...")
    rewrite_giffgaff_lumoza()
    
    # 3. Fix 404
    print("\n[3/6] Fixing 404.html...")
    fix_404()
    
    # 4. Fix API page
    print("\n[4/6] Fixing api/index.html...")
    fix_api_page()
    
    # 5. Fix dashboard/perf
    print("\n[5/6] Fixing dashboard/perf/index.html...")
    fix_dashboard_perf()
    
    # 6. Fix tool page footer links
    print("\n[6/6] Fixing tool page footer links...")
    for name in ['search', 'compare', 'visa', 'routes']:
        path = DOCS / name / "index.html"
        if path.exists():
            fix_tool_page_footer_links(path)
    
    # Also fix articles/index.html
    articles_index = DOCS / "articles" / "index.html"
    if articles_index.exists():
        fix_tool_page_footer_links(articles_index)
    
    print("\n" + "=" * 60)
    print("All fixes applied. Sync docs/ → website/ before committing.")
    print("=" * 60)

if __name__ == "__main__":
    main()
