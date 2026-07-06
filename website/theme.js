// Theme toggle: Dark mode support with localStorage persistence
(function() {
    const STORAGE_KEY = 'dn-theme';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    function getTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') return saved;
        return prefersDark.matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        updateToggleIcon(theme);
    }

    function updateToggleIcon(theme) {
        const btn = document.querySelector('.theme-toggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    // Initialize theme immediately to prevent flash
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);

    // Wait for DOM ready to bind toggle button
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToggle);
    } else {
        initToggle();
    }

    function initToggle() {
        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.addEventListener('click', toggleTheme);
            updateToggleIcon(theme);
        }
    }

    // Listen for system preference changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
})();

// Reading progress bar for article pages
(function() {
    function initProgressBar() {
        const article = document.querySelector('.article-content, .article-page');
        if (!article) return;

        // Check if already exists
        if (document.querySelector('.reading-progress')) return;

        const bar = document.createElement('div');
        bar.className = 'reading-progress';
        document.body.appendChild(bar);

        function updateProgress() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProgressBar);
    } else {
        initProgressBar();
    }
})();
