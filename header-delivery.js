/* Decorative route only: no orders, analytics or storage. */
(() => {
  'use strict';
  const scene = document.querySelector('.header-delivery-art');
  if (!scene) return;
  const vehicle = scene.querySelector('.header-vehicle');
  const parcels = [...scene.querySelectorAll('.header-route-parcel')];
  const cargo = [...scene.querySelectorAll('.header-cargo i')];
  const flash = scene.querySelector('.header-pickup-flash');
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
  function setServices(round) {
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
      const t = clamp((progress - pickup) * duration / 650);
      const eased = 1 - (1 - t) ** 3;
      const lift = -30 * Math.sin(t * Math.PI / 2);
      const travel = (width + 440) * (progress - pickup);
      const offset = t > 0 && t < 1 ? travel : 0;
      parcel.style.transform = `translate3d(${target - 17 + offset}px,${lift}px,0) scale(${1 - eased * .85}) rotate(${eased * 12}deg)`;
      parcel.style.opacity = String(1 - eased);
      cargo[i].style.opacity = t > .65 ? '1' : '0';
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
