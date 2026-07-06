// Privacy-first analytics for Digital Nomad Guide
// Supports configurable backends: goatcounter, plausible, custom endpoint
// Respects navigator.doNotTrack

(function() {
    'use strict';

    const STORAGE_KEY = 'dn-analytics-config';
    const SESSION_KEY = 'dn-analytics-session';

    const DEFAULT_CONFIG = {
        provider: null,      // 'goatcounter', 'plausible', 'custom'
        endpoint: null,    // e.g. 'https://mycode.goatcounter.com/count'
        siteId: null,      // for Plausible or custom
        enabled: false     // disabled until user configures
    };

    function getConfig() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    }

    function saveConfig(cfg) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
    }

    // Respect Do Not Track
    function isDNT() {
        return navigator.doNotTrack === '1' || window.doNotTrack === '1';
    }

    // Generate a simple session ID
    function getSessionId() {
        let session = sessionStorage.getItem(SESSION_KEY);
        if (!session) {
            session = Math.random().toString(36).slice(2) + Date.now().toString(36);
            sessionStorage.setItem(SESSION_KEY, session);
        }
        return session;
    }

    // Collect page context (anonymized)
    function getPageContext() {
        const path = location.pathname;
        const ref = document.referrer ? new URL(document.referrer).hostname : null;
        return {
            path: path,
            title: document.title,
            referrer: ref,
            lang: document.documentElement.lang || 'zh-CN',
            screen: `${window.screen.width}x${window.screen.height}`,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    function sendBeacon(url, data) {
        const payload = JSON.stringify(data);
        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, payload);
        } else {
            // Fallback: use fetch with keepalive
            fetch(url, {
                method: 'POST',
                body: payload,
                keepalive: true,
                headers: { 'Content-Type': 'application/json' }
            }).catch(() => {});
        }
    }

    // Send to custom endpoint
    function sendToCustom(cfg, data) {
        if (!cfg.endpoint) return;
        sendBeacon(cfg.endpoint, {
            ...data,
            site_id: cfg.siteId,
            t: Date.now()
        });
    }

    // Send to GoatCounter
    function sendToGoatCounter(cfg, data) {
        if (!cfg.endpoint) return;
        // GoatCounter uses its own count.js; this is a lightweight fallback
        const img = new Image();
        const params = new URLSearchParams({
            p: data.path,
            t: data.title,
            r: data.referrer || '',
            s: [data.screen, data.lang, data.tz].join('|')
        });
        img.src = `${cfg.endpoint}?${params.toString()}`;
    }

    // Send to Plausible
    function sendToPlausible(cfg, data) {
        if (!cfg.endpoint) return;
        fetch(cfg.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: data.event || 'pageview',
                url: location.href,
                domain: cfg.siteId || location.hostname,
                referrer: data.referrer || null
            })
        }).catch(() => {});
    }

    function send(data) {
        const cfg = getConfig();
        if (!cfg.enabled || isDNT()) return;

        const payload = {
            ...data,
            session: getSessionId(),
            t: Date.now()
        };

        switch (cfg.provider) {
            case 'goatcounter':
                sendToGoatCounter(cfg, payload);
                break;
            case 'plausible':
                sendToPlausible(cfg, payload);
                break;
            case 'custom':
            default:
                sendToCustom(cfg, payload);
                break;
        }
    }

    // Store local interaction metrics for potential "Your Journey" feature
    function storeLocal(event, data) {
        try {
            const key = 'dn-local-metrics';
            const raw = localStorage.getItem(key);
            const metrics = raw ? JSON.parse(raw) : { pages: [], events: [], since: Date.now() };
            metrics.events.push({ event, data, t: Date.now() });
            if (metrics.events.length > 200) metrics.events = metrics.events.slice(-150);
            localStorage.setItem(key, JSON.stringify(metrics));
        } catch (e) {}
    }

    const DNAnalytics = {
        config: DEFAULT_CONFIG,

        init(userConfig = {}) {
            this.config = { ...getConfig(), ...userConfig };
            saveConfig(this.config);
            this.trackPageview();
            this.bindEvents();
        },

        trackPageview() {
            const ctx = getPageContext();
            send({ event: 'pageview', ...ctx });
            storeLocal('pageview', ctx);
        },

        trackEvent(name, props = {}) {
            const data = { event: name, ...getPageContext(), ...props };
            send(data);
            storeLocal(name, props);
        },

        // Bind to interactive elements
        bindEvents() {
            const self = this;

            // Country card clicks
            document.addEventListener('click', function(e) {
                const card = e.target.closest('[data-country]');
                if (card) {
                    self.trackEvent('country_click', { country: card.dataset.country });
                }
            });

            // Compare button clicks
            document.addEventListener('click', function(e) {
                if (e.target.closest('[data-action="compare"]')) {
                    self.trackEvent('compare_open');
                }
            });

            // Search queries
            const searchInputs = document.querySelectorAll('input[type="search"], [data-search]');
            searchInputs.forEach(input => {
                let timeout;
                input.addEventListener('input', function() {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        if (input.value.trim().length >= 2) {
                            self.trackEvent('search', { query: input.value.trim() });
                        }
                    }, 500);
                });
            });

            // GitHub CTA clicks
            document.addEventListener('click', function(e) {
                const github = e.target.closest('a[href*="github.com/kfat77"]');
                if (github) {
                    self.trackEvent('github_cta', { href: github.href });
                }
            });

            // Route planner clicks
            document.addEventListener('click', function(e) {
                if (e.target.closest('[data-action="route"]')) {
                    self.trackEvent('route_plan');
                }
            });

            // Article read depth (scroll to 50%)
            let depthSent = false;
            window.addEventListener('scroll', function() {
                if (depthSent) return;
                const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
                if (scrollPercent >= 0.5) {
                    depthSent = true;
                    self.trackEvent('scroll_depth', { depth: '50%' });
                }
            }, { passive: true });
        },

        // Public API: get user's local browsing metrics
        getLocalMetrics() {
            try {
                const raw = localStorage.getItem('dn-local-metrics');
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        },

        // Public API: clear local metrics
        clearLocalMetrics() {
            localStorage.removeItem('dn-local-metrics');
        }
    };

    window.DNAnalytics = DNAnalytics;

    // Auto-init on DOM ready if not explicitly disabled
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DNAnalytics.init());
    } else {
        DNAnalytics.init();
    }
})();
