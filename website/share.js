// Social sharing bar for Digital Nomad Guide
// Auto-injects share buttons on pages with .share-target element
(function() {
    'use strict';

    const platforms = [
        {
            name: 'X / Twitter',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            share: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        },
        {
            name: 'LinkedIn',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
            share: (url, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        },
        {
            name: 'Copy Link',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
            action: async (btn) => {
                try {
                    await navigator.clipboard.writeText(location.href);
                    btn.style.background = '#22c55e';
                    setTimeout(() => btn.style.background = '', 1500);
                } catch(e) { alert('Copy failed'); }
            }
        },
        {
            name: 'Native Share',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>',
            action: () => {
                if (navigator.share) {
                    navigator.share({ title: document.title, url: location.href });
                }
            }
        }
    ];

    function initShareBar() {
        const targets = document.querySelectorAll('.share-target');
        if (!targets.length) return;

        const url = location.href;
        const title = document.title;

        targets.forEach(target => {
            const bar = document.createElement('div');
            bar.className = 'share-bar';
            bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:16px 0;';

            platforms.forEach(p => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.title = p.name;
                btn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;border:1px solid var(--border);background:var(--bg-card);color:var(--foreground);font-size:13px;cursor:pointer;transition:all 0.2s;';
                btn.innerHTML = p.icon + '<span>' + p.name + '</span>';
                btn.addEventListener('click', () => {
                    if (p.action) {
                        p.action(btn);
                    } else {
                        window.open(p.share(url, title), '_blank', 'width=600,height=400');
                    }
                    if (window.DNAnalytics) DNAnalytics.trackEvent('share', { platform: p.name });
                });
                bar.appendChild(btn);
            });

            target.appendChild(bar);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShareBar);
    } else {
        initShareBar();
    }
})();
