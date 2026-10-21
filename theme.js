(function () {
  'use strict';
  const key = 'masterStoreThemeV1';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { preference = localStorage.getItem(key); } catch (_) {}
  if (preference !== 'dark' && preference !== 'light') preference = null;

  function apply(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0b1220' : '#1f5eff';
    updateButton();
  }
  function updateButton() {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    const dark = root.dataset.theme === 'dark';
    const english = root.lang === 'en';
    const label = english ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : (dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('aria-pressed', String(dark));
    button.querySelector('[data-theme-icon]').textContent = dark ? '☀' : '☾';
  }
  apply(preference || (system.matches ? 'dark' : 'light'));
  function mount() {
    const header = document.querySelector('.topbar');
    if (!header || header.querySelector('[data-theme-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.setAttribute('data-theme-toggle', '');
    button.innerHTML = '<span data-theme-icon aria-hidden="true"></span>';
    button.addEventListener('click', function () {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch (_) {}
      apply(preference);
    });
    header.insertBefore(button, header.querySelector('.menu'));
    updateButton();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
  system.addEventListener('change', function (event) { if (!preference) apply(event.matches ? 'dark' : 'light'); });
  window.addEventListener('storage', function (event) {
    if (event.key !== key) return;
    preference = ['dark', 'light'].includes(event.newValue) ? event.newValue : null;
    apply(preference || (system.matches ? 'dark' : 'light'));
  });
  document.addEventListener('masterstore:localechange', updateButton);
})();
