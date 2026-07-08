/* ============================================
   Digital Nomad CN — Motion System (Light Theme)
   Premium animations: scroll reveals, parallax, magnetic effects
   ============================================ */

(function() {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    // ============================================
    // Scroll Reveal (IntersectionObserver)
    // ============================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        const staggerContainers = document.querySelectorAll('.stagger-children');

        if (revealElements.length === 0 && staggerContainers.length === 0) return;
        if (prefersReducedMotion) {
            revealElements.forEach(el => el.classList.add('visible'));
            staggerContainers.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.1
        });

        revealElements.forEach(el => observer.observe(el));
        staggerContainers.forEach(el => observer.observe(el));
    }

    // ============================================
    // Parallax Effects
    // ============================================
    function initParallax() {
        if (prefersReducedMotion || isTouchDevice) return;

        const parallaxElements = document.querySelectorAll('[data-parallax]');
        if (parallaxElements.length === 0) return;

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.15;
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.style.transform = `translateY(${scrollY * speed}px)`;
                }
            });
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // Magnetic Buttons
    // ============================================
    function initMagneticButtons() {
        if (isTouchDevice) return;

        const buttons = document.querySelectorAll('.magnetic-btn');
        if (buttons.length === 0) return;

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ============================================
    // Reading Progress Bar
    // ============================================
    function initReadingProgress() {
        let progressBar = document.querySelector('.reading-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'reading-progress';
            document.body.appendChild(progressBar);
        }

        let ticking = false;

        function updateProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // Number Counter Animation
    // ============================================
    function initCounters() {
        const counters = document.querySelectorAll('.count-up');
        if (counters.length === 0) return;
        if (prefersReducedMotion) {
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.count, 10);
                const suffix = counter.dataset.suffix || '';
                counter.textContent = target + suffix;
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.count, 10);
                    const suffix = counter.dataset.suffix || '';
                    const duration = 1200;
                    const start = performance.now();

                    function animate(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(eased * target);
                        counter.textContent = current + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            counter.textContent = target + suffix;
                        }
                    }

                    requestAnimationFrame(animate);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // ============================================
    // Header Scroll Effect
    // ============================================
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let ticking = false;
        let lastScrollY = 0;

        function updateHeader() {
            const scrollY = window.scrollY;
            if (scrollY > 10) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            lastScrollY = scrollY;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offset = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    function initMobileMenu() {
        const btn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.main-nav');
        if (!btn || !nav) return;

        btn.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('mobile-open');
            btn.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on nav link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-open');
                btn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // ============================================
    // Section Navigation Highlight
    // ============================================
    function initSectionNavHighlight() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
        if (sections.length === 0 || navLinks.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -60% 0px', threshold: 0 });

        sections.forEach(section => observer.observe(section));
    }

    // ============================================
    // Toast Notifications
    // ============================================
    function initToast() {
        window.showToast = function(message, duration = 3000) {
            let toast = document.querySelector('.toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.className = 'toast';
                document.body.appendChild(toast);
            }

            toast.textContent = message;
            toast.classList.add('visible');

            setTimeout(() => {
                toast.classList.remove('visible');
            }, duration);
        };
    }

    // ============================================
    // Initialize All
    // ============================================
    function init() {
        initScrollReveal();
        initParallax();
        initMagneticButtons();
        initReadingProgress();
        initCounters();
        initHeaderScroll();
        initSmoothScroll();
        initMobileMenu();
        initSectionNavHighlight();
        initToast();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
