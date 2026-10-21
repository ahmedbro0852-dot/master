(function () {
  'use strict';
  const key = 'masterStoreThemeV1';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const themes = [
    {id:'light', ar:'فاتح', en:'Light', icon:'☀', color:'#f3f7fe', dark:false},
    {id:'dark', ar:'داكن', en:'Dark', icon:'☾', color:'#0b1220', dark:true},
    {id:'midnight', ar:'ليلي', en:'Midnight', icon:'✦', color:'#070912', dark:true},
    {id:'forest', ar:'أخضر', en:'Forest', icon:'❧', color:'#071b15', dark:true},
    {id:'warm', ar:'دافئ', en:'Warm', icon:'◐', color:'#f5efe3', dark:false}
  ];
  const valid = value => themes.some(theme => theme.id === value);
  let preference = null;
  try { preference = localStorage.getItem(key); } catch (_) {}
  if (!valid(preference)) preference = null;
  let trigger, panel;
  function updateLabels() {
    if (!trigger) return;
    const en = root.lang === 'en';
    const active = themes.find(theme => theme.id === root.dataset.theme);
    const label = en ? 'Appearance: ' + active.en : 'المظهر: ' + active.ar;
    trigger.setAttribute('aria-label', label);
    trigger.title = label;
    trigger.querySelector('[data-theme-icon]').textContent = active.icon;
    panel.setAttribute('aria-label', en ? 'Choose appearance' : 'اختيار المظهر');
    panel.querySelectorAll('[data-theme-choice]').forEach(button => {
      const theme = themes.find(theme => theme.id === button.dataset.themeChoice);
      button.querySelector('.theme-option-label').textContent = en ? theme.en : theme.ar;
      button.setAttribute('aria-pressed', String(theme.id === active.id));
    });
  }
  function apply(id) {
    const theme = themes.find(item => item.id === id) || themes[0];
    root.dataset.theme = theme.id;
    root.toggleAttribute('data-custom-theme', theme.id !== 'light');
    root.style.colorScheme = theme.dark ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme.id === 'light' ? '#1f5eff' : theme.color;
    updateLabels();
  }
  function close(focus) {
    if (!panel) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus();
  }
  apply(preference || (system.matches ? 'dark' : 'light'));
  function mount() {
    const header = document.querySelector('.topbar');
    if (!header || header.querySelector('[data-theme-toggle]')) return;
    const picker = document.createElement('div');
    picker.className = 'theme-picker';
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'theme-toggle';
    trigger.setAttribute('data-theme-toggle', '');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'theme-options');
    trigger.innerHTML = '<span data-theme-icon aria-hidden="true"></span>';
    panel = document.createElement('div');
    panel.id = 'theme-options';
    panel.className = 'theme-options';
    panel.setAttribute('role', 'group');
    panel.hidden = true;
    themes.forEach(theme => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-option';
      button.dataset.themeChoice = theme.id;
      button.innerHTML = '<span class="theme-swatch" aria-hidden="true" style="background:' + theme.color + '"></span><span class="theme-option-label"></span><span class="theme-option-check" aria-hidden="true">✓</span>';
      button.addEventListener('click', function () {
        preference = theme.id;
        try { localStorage.setItem(key, preference); } catch (_) {}
        apply(preference);
        close(true);
      });
      panel.appendChild(button);
    });
    trigger.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      trigger.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) panel.querySelector('[aria-pressed="true"]').focus();
    });
    picker.append(trigger, panel);
    header.insertBefore(picker, header.querySelector('.menu'));
    document.addEventListener('click', function (event) { if (!picker.contains(event.target)) close(false); });
    picker.addEventListener('keydown', function (event) { if (event.key === 'Escape') { close(true); event.preventDefault(); } });
    picker.addEventListener('focusout', function (event) { if (!picker.contains(event.relatedTarget)) close(false); });
    updateLabels();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
  system.addEventListener('change', function (event) { if (!preference) apply(event.matches ? 'dark' : 'light'); });
  window.addEventListener('storage', function (event) {
    if (event.key !== key) return;
    preference = valid(event.newValue) ? event.newValue : null;
    apply(preference || (system.matches ? 'dark' : 'light'));
  });
  document.addEventListener('masterstore:localechange', updateLabels);
})();
