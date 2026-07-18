const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
menuButton?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
const notice = document.querySelector('[data-notice]');
if (localStorage.getItem('nomad-notice-dismissed') === 'true') notice?.remove();
document.querySelector('[data-notice-close]')?.addEventListener('click', () => {
  localStorage.setItem('nomad-notice-dismissed', 'true');
  notice?.remove();
});
