// Performance Monitoring & Error Tracking (RUM)
// Real User Monitoring for Core Web Vitals + Frontend Error Capture
// Zero-backend: stores in localStorage, exports to JSON, optional GA4 / custom endpoint
//
// Usage:
//   <script src="perf-monitor.js" defer></script>
//   // Data available via window.DNPerf.export() or /dashboard/perf/

(function() {
    'use strict';

    const STORAGE_KEY = 'dn-perf-rum-v1';
    const ERROR_KEY = 'dn-perf-errors-v1';
    const MAX_ENTRIES = 500;
    const SESSION_ID = (() => {
        let s = sessionStorage.getItem('dn-perf-session');
        if (!s) {
            s = Math.random().toString(36).slice(2) + Date.now().toString(36);
            sessionStorage.setItem('dn-perf-session', s);
        }
        return s;
    })();

    // ── Helpers ────────────────────────────────────────────
    function now() { return Math.round(performance.now()); }

    function getDeviceInfo() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const mem = navigator.deviceMemory;
        const cores = navigator.hardwareConcurrency;
        return {
            ua: navigator.userAgent,
            platform: navigator.platform,
            lang: navigator.language,
            memory: mem || 'unknown',
            cores: cores || 'unknown',
            connection: conn ? {
                type: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            } : null,
            screen: `${window.screen.width}x${window.screen.height}`,
            dpr: window.devicePixelRatio,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };
    }

    function read(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function append(key, entry) {
        try {
            const arr = read(key);
            arr.push(entry);
            if (arr.length > MAX_ENTRIES) arr.shift();
            localStorage.setItem(key, JSON.stringify(arr));
        } catch (e) {
            // Storage full — drop oldest half
            try {
                const half = arr.slice(arr.length / 2);
                half.push(entry);
                localStorage.setItem(key, JSON.stringify(half));
            } catch (e2) {}
        }
    }

    // ── Core Web Vitals Observer ───────────────────────────
    const CWV = {
        lcp: null,
        cls: 0,
        clsEntries: [],
        fid: null,
        inp: null,
        fcp: null,
        ttfb: null,
        tti: null  // estimated
    };

    function observeCWV() {
        if (!('PerformanceObserver' in window)) return;

        // LCP
        try {
            new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                    if (!CWV.lcp || e.startTime > CWV.lcp) {
                        CWV.lcp = Math.round(e.startTime);
                    }
                }
            }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {}

        // CLS
        try {
            new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                    if (!e.hadRecentInput) {
                        CWV.clsEntries.push(e);
                        CWV.cls += e.value;
                    }
                }
            }).observe({ type: 'layout-shift', buffered: true });
        } catch (e) {}

        // FID
        try {
            new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                    if (CWV.fid === null) {
                        CWV.fid = Math.round(e.processingStart - e.startTime);
                    }
                }
            }).observe({ type: 'first-input', buffered: true });
        } catch (e) {}

        // INP (Interaction to Next Paint)
        try {
            new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                    const duration = e.processingEnd - e.startTime;
                    if (!CWV.inp || duration > CWV.inp) {
                        CWV.inp = Math.round(duration);
                    }
                }
            }).observe({ type: 'event', buffered: true, durationThreshold: 0 });
        } catch (e) {}

        // FCP, TTFB from navigation timing
        try {
            const nav = performance.getEntriesByType('navigation')[0];
            if (nav) {
                CWV.ttfb = Math.round(nav.responseStart - nav.startTime);
                // FCP from paint entries
                const paints = performance.getEntriesByType('paint');
                for (const p of paints) {
                    if (p.name === 'first-contentful-paint') {
                        CWV.fcp = Math.round(p.startTime);
                    }
                }
            }
        } catch (e) {}

        // Long Tasks (blocking main thread)
        try {
            new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                    reportLongTask(e);
                }
            }).observe({ type: 'longtask', buffered: true });
        } catch (e) {}
    }

    function reportLongTask(entry) {
        append(ERROR_KEY, {
            type: 'longtask',
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
            name: entry.name,
            url: location.href,
            path: location.pathname,
            t: Date.now(),
            session: SESSION_ID
        });
    }

    // ── Error Capture ──────────────────────────────────────
    function captureErrors() {
        // JS runtime errors
        window.addEventListener('error', (e) => {
            const err = {
                type: 'js-error',
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error && e.error.stack ? e.error.stack.split('\n').slice(0, 6).join('\n') : null,
                url: location.href,
                path: location.pathname,
                t: Date.now(),
                session: SESSION_ID
            };
            append(ERROR_KEY, err);
            // Send to CWV pipeline for immediate visibility
            sendBeaconIfAvailable({ event: 'error', ...err });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            const reason = e.reason;
            const err = {
                type: 'unhandledrejection',
                message: reason && reason.message ? reason.message : String(reason),
                stack: reason && reason.stack ? reason.stack.split('\n').slice(0, 6).join('\n') : null,
                url: location.href,
                path: location.pathname,
                t: Date.now(),
                session: SESSION_ID
            };
            append(ERROR_KEY, err);
            sendBeaconIfAvailable({ event: 'error', ...err });
        });

        // Resource loading errors (404 images, failed scripts, etc)
        window.addEventListener('error', (e) => {
            if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                const err = {
                    type: 'resource-error',
                    tag: e.target.tagName,
                    src: e.target.src || e.target.href,
                    url: location.href,
                    path: location.pathname,
                    t: Date.now(),
                    session: SESSION_ID
                };
                append(ERROR_KEY, err);
            }
        }, true); // capture phase

        // Console errors (optional, catches console.error calls)
        const origError = console.error;
        console.error = function(...args) {
            origError.apply(console, args);
            // Debounced: only log non-primitive errors
            if (args.some(a => a instanceof Error)) {
                const err = {
                    type: 'console-error',
                    message: args.map(a => a instanceof Error ? a.message : String(a)).join(' '),
                    url: location.href,
                    path: location.pathname,
                    t: Date.now(),
                    session: SESSION_ID
                };
                append(ERROR_KEY, err);
            }
        };
    }

    // ── Navigation & Page Lifecycle ────────────────────────
    function reportNavigation() {
        try {
            const nav = performance.getEntriesByType('navigation')[0];
            if (!nav) return;

            const data = {
                type: 'navigation',
                path: location.pathname,
                dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
                tcp: Math.round(nav.connectEnd - nav.connectStart),
                ssl: nav.secureConnectionStart > 0 ? Math.round(nav.connectEnd - nav.secureConnectionStart) : 0,
                ttfb: Math.round(nav.responseStart - nav.startTime),
                download: Math.round(nav.responseEnd - nav.responseStart),
                domInteractive: Math.round(nav.domInteractive - nav.startTime),
                domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
                loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
                transferSize: nav.transferSize,
                encodedBodySize: nav.encodedBodySize,
                device: getDeviceInfo(),
                t: Date.now(),
                session: SESSION_ID
            };
            append(STORAGE_KEY, data);
            sendBeaconIfAvailable({ event: 'navigation', ...data });
        } catch (e) {}
    }

    // ── Resource Loading Stats ─────────────────────────────
    function reportResources() {
        try {
            const entries = performance.getEntriesByType('resource');
            const slow = entries
                .filter(e => e.duration > 1000)
                .map(e => ({
                    name: e.name.split('?')[0].split('/').pop(),
                    url: e.name,
                    duration: Math.round(e.duration),
                    size: e.transferSize
                }))
                .slice(0, 20);

            if (slow.length > 0) {
                append(STORAGE_KEY, {
                    type: 'slow-resources',
                    path: location.pathname,
                    resources: slow,
                    t: Date.now(),
                    session: SESSION_ID
                });
            }
        } catch (e) {}
    }

    // ── CWV Report (on page hide) ──────────────────────────
    function reportCWV() {
        try {
            const data = {
                type: 'cwv',
                path: location.pathname,
                lcp: CWV.lcp,
                cls: CWV.cls ? Math.round(CWV.cls * 1000) / 1000 : 0,
                fid: CWV.fid,
                inp: CWV.inp,
                fcp: CWV.fcp,
                ttfb: CWV.ttfb,
                device: getDeviceInfo(),
                t: Date.now(),
                session: SESSION_ID
            };
            append(STORAGE_KEY, data);
            sendBeaconIfAvailable({ event: 'cwv', ...data });
        } catch (e) {}
    }

    // ── Beacon Sender ──────────────────────────────────────
    function sendBeaconIfAvailable(data) {
        // If user has configured a custom endpoint via DNAnalytics, use it
        if (window.DNAnalytics && window.DNAnalytics.config && window.DNAnalytics.config.endpoint) {
            try {
                const url = window.DNAnalytics.config.endpoint;
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(url, JSON.stringify(data));
                }
            } catch (e) {}
        }
    }

    // ── Public API ─────────────────────────────────────────
    window.DNPerf = {
        version: '1.0.0',
        session: SESSION_ID,

        // Get all RUM data
        getRum() {
            return read(STORAGE_KEY);
        },

        // Get all errors
        getErrors() {
            return read(ERROR_KEY);
        },

        // Get current CWV snapshot
        getCWV() {
            return { ...CWV, path: location.pathname, t: Date.now(), session: SESSION_ID };
        },

        // Export all data as JSON
        export() {
            return {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                session: SESSION_ID,
                rum: this.getRum(),
                errors: this.getErrors(),
                currentCWV: this.getCWV(),
                device: getDeviceInfo()
            };
        },

        // Clear all stored data
        clear() {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(ERROR_KEY);
        },

        // Download as JSON file
        download(filename = 'dn-perf-report.json') {
            const blob = new Blob([JSON.stringify(this.export(), null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        },

        // Manual trigger for testing
        report() {
            reportCWV();
            return this.getCWV();
        }
    };

    // ── Initialize ─────────────────────────────────────────
    observeCWV();
    captureErrors();

    // Report navigation timing after load
    if (document.readyState === 'complete') {
        setTimeout(reportNavigation, 0);
        setTimeout(reportResources, 100);
    } else {
        window.addEventListener('load', () => {
            setTimeout(reportNavigation, 0);
            setTimeout(reportResources, 100);
        });
    }

    // Report CWV on page hide / unload
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            reportCWV();
        }
    });

    // Also try on beforeunload
    window.addEventListener('beforeunload', reportCWV);

    // Log init
    // console.log('[DNPerf] RUM + Error Tracking initialized');
})();
