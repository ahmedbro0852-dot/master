/* Decorative route only: no orders, analytics or storage. */
(() => {
  'use strict';
  const scene = document.querySelector('.header-delivery-art');
  if (!scene) return;
  const vehicle = scene.querySelector('.header-vehicle');
  const parcels = [...scene.querySelectorAll('.header-route-parcel')];
  const cargo = [...scene.querySelectorAll('.header-cargo i')];
  const flash = scene.querySelector('.header-pickup-flash');
  const soundButton = scene.querySelector('.header-delivery-sound');
  const desktop = matchMedia('(min-width:1180px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const seen = new Set();
  const services = (window.MasterCatalog?.products || []).filter(product => {
    if (!/^logos\/[a-z0-9_./-]+\.(svg|png|webp|ico)(\?[^\s]*)?$/i.test(product.logoUrl || '')) return false;
    const key = product.logoUrl.split('?')[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!services.length) return;
  const preferred = ['chatgpt', 'canva', 'coursera'];
  services.sort((a, b) => {
    const rank = p => { const i = preferred.indexOf(p.logo); return i < 0 ? 10 : i; };
    return rank(a) - rank(b);
  });
  const duration = 12000;
  const slots = [.22, .5, .78];
  let width = 0, elapsed = 0, previous = null, frame = 0, cycle = -1, inView = true;
  const clamp = n => Math.max(0, Math.min(1, n));
  let audio = null, soundEnabled = false, userMuted = false;
  const sounded = new Set();
  function soundState() {
    const english = document.documentElement.lang === 'en';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', english
      ? (soundEnabled ? 'Mute parcel pickup sound' : 'Enable parcel pickup sound')
      : (soundEnabled ? 'كتم صوت استلام الطرود' : 'تشغيل صوت استلام الطرود'));
  }
  function enableSound() {
    if (!desktop.matches || reduced.matches || document.hidden) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) { soundButton.hidden = true; return; }
      audio ||= new Audio();
      soundEnabled = true;
      audio.resume().catch(() => { soundEnabled = false; soundState(); });
      soundState();
    } catch (_) { soundEnabled = false; soundState(); }
  }
  function chime() {
    if (!soundEnabled || audio?.state !== 'running' || !running()) return;
    // A very quiet, short sine note; no engine noise or background music.
    const note = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
    note.type = 'sine';
    note.frequency.setValueAtTime(1046.5, now);
    note.frequency.exponentialRampToValueAtTime(1396.9, now + .09);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.009, now + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .15);
    note.connect(gain); gain.connect(audio.destination);
    note.onended = () => { note.disconnect(); gain.disconnect(); };
    note.start(now); note.stop(now + .16);
  }
  function armSound(event) {
    if (soundButton.contains(event.target) || userMuted || soundEnabled) return;
    enableSound();
  }
  document.addEventListener('pointerdown', armSound, { passive: true });
  document.addEventListener('keydown', event => {
    if (['Enter', ' '].includes(event.key)) armSound(event);
  });
  soundButton.addEventListener('click', () => {
    if (soundEnabled) { userMuted = true; soundEnabled = false; soundState(); }
    else { userMuted = false; enableSound(); }
  });
  function setServices(round) {
    sounded.clear();
    parcels.forEach((parcel, i) => {
      const product = services[(round * parcels.length + i) % services.length];
      parcel.querySelector('img').src = '/' + product.logoUrl;
      parcel.dataset.service = product.logo;
    });
  }
  function draw(progress) {
    const x = -220 + (width + 440) * progress;
    vehicle.style.transform = `translate3d(${x}px,0,0)`;
    let glow = 0;
    parcels.forEach((parcel, i) => {
      const target = width * slots[i];
      // Align each parcel with the roof before lifting it into the moving van.
      const pickup = (target + 120) / (width + 440);
      const t = clamp((progress - pickup) * duration / 900);
      const eased = t * t * (3 - 2 * t);
      const travel = Math.max(0, (width + 440) * (progress - pickup));
      const destination = travel - 17 + i * 13;
      const offset = t > 0 && t < 1 ? destination * eased : 0;
      const lift = -21 * eased - 15 * Math.sin(t * Math.PI);
      const shrink = .85 * clamp((t - .35) / .65);
      parcel.style.transform = `translate3d(${target - 17 + offset}px,${lift}px,0) scale(${1 - shrink}) rotate(${-10 * Math.sin(t * Math.PI)}deg)`;
      parcel.style.opacity = String(1 - clamp((t - .78) / .22));
      cargo[i].style.opacity = t > .82 ? '1' : '0';
      cargo[i].style.transform = `scale(${1 + .25 * Math.sin(clamp((t - .82) / .18) * Math.PI)})`;
      if (t >= .82 && !sounded.has(i)) { sounded.add(i); chime(); }
      if (t > 0 && t < 1) glow = Math.max(glow, Math.sin(t * Math.PI));
    });
    flash.style.opacity = String(glow);
    flash.style.transform = `scale(${.6 + glow * .65})`;
  }
  function running() { return desktop.matches && !reduced.matches && !document.hidden && inView && width > 0; }
  function tick(now) {
    frame = 0;
    if (!running()) { previous = null; return; }
    if (previous !== null) elapsed += Math.min(now - previous, 100);
    previous = now;
    const round = Math.floor(elapsed / duration);
    if (round !== cycle) { cycle = round; setServices(round); }
    draw((elapsed % duration) / duration);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    width = scene.clientWidth;
    if (!running()) {
      cancelAnimationFrame(frame); frame = 0; previous = null;
      if (reduced.matches) {
        setServices(Math.max(0, cycle));
        vehicle.style.transform = `translate3d(${Math.max(0, width - 220)}px,0,0)`;
        parcels.forEach((parcel, i) => {
          parcel.style.transform = `translateX(${Math.max(0, width - 235) * (i + .5) / 3}px)`;
          parcel.style.opacity = '1';
        });
      }
      return;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(sync).observe(scene);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }).observe(scene);
  desktop.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  setServices(0);
  sync();
})();
