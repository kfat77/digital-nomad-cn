// 随机古诗词
const quoteTarget = document.querySelector('#random-quote');

if (quoteTarget) {
  fetch('./data/quotes.json')
    .then(response => response.json())
    .then(quotes => {
      quoteTarget.textContent =
        quotes[Math.floor(Math.random() * quotes.length)];
    })
    .catch(error => {
      console.warn('诗词加载失败:', error);
    });
}
const categoryIds = ['banking', 'phone', 'securities'];
document.querySelectorAll('.tool-category').forEach((category, index) => {
  if (!category.id) category.id = categoryIds[index] ?? category.id;
});

const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
menuButton?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-dropdown-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const dropdown = button.closest('.nav-dropdown');
    const isOpen = dropdown.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.nav-dropdown.is-open').forEach((dropdown) => {
    dropdown.classList.remove('is-open');
    dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });
});
const notice = document.querySelector('[data-notice]');
if (localStorage.getItem('nomad-notice-dismissed') === 'true') notice?.remove();
document.querySelector('[data-notice-close]')?.addEventListener('click', () => {
  localStorage.setItem('nomad-notice-dismissed', 'true');
  notice?.remove();
});

if (window.gsap && window.ScrollTrigger) {
gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add({
  reduceMotion: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 701px)',
}, ({ conditions }) => {
  const { reduceMotion, desktop } = conditions;

  if (reduceMotion) return;

  gsap.timeline({ defaults: { duration: 0.72, ease: 'power3.out' } })
    .from('.hero .eyebrow', { autoAlpha: 0, y: 18 })
    .from('.hero h1', { autoAlpha: 0, y: 34 }, '-=0.42')
    .from('.hero-copy', { autoAlpha: 0, y: 22 }, '-=0.42')
    .from('.hero-quote-container', { autoAlpha: 0, y: 16 }, '-=0.36');

  gsap.from('.section-heading', {
    autoAlpha: 0,
    y: 30,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#modules',
      start: 'top 78%',
      toggleActions: 'play none none reverse',
    },
  });

  ScrollTrigger.batch('.module-card', {
    start: 'top 82%',
    once: true,
    interval: 0.12,
    batchMax: 3,
    onEnter: (cards) => gsap.from(cards, {
      autoAlpha: 0,
      y: 44,
      scale: 0.97,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
      overwrite: 'auto',
    }),
  });

  gsap.utils.toArray('.module-visual').forEach((visual) => {
    gsap.fromTo(visual, { yPercent: desktop ? -5 : 0 }, {
      yPercent: desktop ? 5 : 0,
      ease: 'none',
      scrollTrigger: {
        trigger: visual.closest('.module-card'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  });

  gsap.from('.principle p', {
    autoAlpha: 0,
    y: 24,
    duration: 0.65,
    ease: 'power3.out',
    stagger: 0.14,
    scrollTrigger: {
      trigger: '.principle',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  if (desktop && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(card, {
          rotationX: -y * 4,
          rotationY: x * 4,
          transformPerspective: 900,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
      card.addEventListener('pointerleave', () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.45, ease: 'power3.out' });
      });
    });
  }

  document.fonts?.ready?.then(() => ScrollTrigger.refresh());
});
}
