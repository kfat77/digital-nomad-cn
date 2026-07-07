/**
 * Motion System — Global scroll-triggered animations & interactions
 * Inspired by Igloo, Linear, Apple-level motion design
 */

(function () {
  'use strict';

  // ============================================
  // 0. Prefers Reduced Motion
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // ============================================
  // 1. Reveal Engine (IntersectionObserver)
  // ============================================
  const revealElements = document.querySelectorAll(
    '.hero-content, .section-header, .country-card, .trending-card, ' +
    '.new-card, .tool-card, .module-card, .core-infra-card, ' +
    '.quicknav-item, .article-card, .stat-item, .info-card, ' +
    '.country-stat-card, .related-card, .visa-card, .footer-brand, .footer-col'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Stagger by sibling index for grid items
          const siblings = Array.from(el.parentElement?.children || []);
          const index = siblings.indexOf(el);
          const delay = Math.min(index * 60, 400);

          el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => {
    el.classList.add('will-reveal');
    revealObserver.observe(el);
  });

  // ============================================
  // 2. Parallax Layers
  // ============================================
  let ticking = false;
  const parallaxEls = document.querySelectorAll('.hero-content, .section-header');

  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = (centerY - viewportCenter) / window.innerHeight;
      const speed = el.classList.contains('hero-content') ? 0.08 : 0.04;
      el.style.transform = `translateY(${distance * speed * 100}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // ============================================
  // 3. Magnetic Buttons (cursor-responsive)
  // ============================================
  const magneticEls = document.querySelectorAll('.btn, .github-btn');

  magneticEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ============================================
  // 4. Smooth Scroll for Anchor Links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // 5. Reading Progress Bar
  // ============================================
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });

  // ============================================
  // 6. Header Scroll Behavior
  // ============================================
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      header?.classList.add('header--scrolled');
    } else {
      header?.classList.remove('header--scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ============================================
  // 7. Glow Cursor Trail (subtle ambient)
  // ============================================
  const glowEl = document.createElement('div');
  glowEl.className = 'cursor-glow';
  Object.assign(glowEl.style, {
    position: 'fixed',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,191,255,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: '0',
    transform: 'translate(-50%, -50%)',
    transition: 'opacity 0.3s ease',
    opacity: '0',
    left: '0',
    top: '0',
  });
  document.body.appendChild(glowEl);

  let glowVisible = false;
  document.addEventListener('mousemove', (e) => {
    glowEl.style.left = e.clientX + 'px';
    glowEl.style.top = e.clientY + 'px';
    if (!glowVisible) {
      glowEl.style.opacity = '1';
      glowVisible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    glowEl.style.opacity = '0';
    glowVisible = false;
  });

  // ============================================
  // 8. Number Counter Animation
  // ============================================
  const statNumbers = document.querySelectorAll('.stat-num[data-count]');

  const countUp = (element, target, duration = 2000) => {
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(target * easeProgress);
      element.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(update);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.count);
          countUp(entry.target, target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((num) => statsObserver.observe(num));

  // ============================================
  // 9. Image Reveal on Load
  // ============================================
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('is-loaded'));
    }
  });

  // ============================================
  // 10. Active Section Highlight in Nav
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  console.log('✨ Motion System initialized');
})();
