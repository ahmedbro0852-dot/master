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
  const travelDuration = 10500, dwell = 1100;
  const duration = travelDuration + dwell * 3;
  const slots = [.22, .5, .78];
  let width = 0, elapsed = 0, previous = null, frame = 0, cycle = -1, inView = true;
  const clamp = n => Math.max(0, Math.min(1, n));
  function setServices(round) {
    parcels.forEach((parcel, i) => {
      const product = services[(round * parcels.length + i) % services.length];
      parcel.querySelector('img').src = '/' + product.logoUrl;
      parcel.dataset.service = product.logo;
      cargo[i].querySelector('img').src = '/' + product.logoUrl;
    });
  }
  const smooth = t => t * t * (3 - 2 * t);
  function draw(progress) {
    const time = progress * duration, distance = width + 440;
    const stops = slots.map((slot, i) => {
      const x = width * slot - 100;
      return {x, arrival: (x + 220) / distance * travelDuration + i * dwell};
    });
    const points = [{time:0,x:-220}];
    stops.forEach(stop => points.push({time:stop.arrival,x:stop.x},{time:stop.arrival+dwell,x:stop.x}));
    points.push({time:duration,x:width+220});
    let x = -220, moving = false;
    for(let i=1;i<points.length;i++) {
      const from=points[i-1],to=points[i];
      if(time<=to.time) { const t=clamp((time-from.time)/(to.time-from.time)); x=from.x+(to.x-from.x)*smooth(t); moving=from.x!==to.x; break; }
    }
    vehicle.style.transform = `translate3d(${x}px,0,0)`;
    const bounce = moving ? Math.sin(time / 90) * .45 : 0;
    scene.querySelector('.header-art-van').style.transform = `translateY(${bounce}px)`;
    scene.querySelectorAll('.header-art-wheel').forEach(wheel => {wheel.style.transform=`rotate(${(x+220)*6.7}deg)`;});
    scene.classList.toggle('is-driving',moving);
    let glow = 0;
    parcels.forEach((parcel, i) => {
      const target = width * slots[i];
      const t = clamp((time - stops[i].arrival - 80) / 850);
      const eased = smooth(t);
      const destination = x + 74 + i * 21;
      const offset = (destination - (target - 17)) * eased;
      const bob = t === 0 ? Math.sin(time / 450 + i) * 1.1 : 0;
      const lift = -23 * eased - 17 * Math.sin(t * Math.PI) + bob;
      parcel.style.transform = `translate3d(${target - 17 + offset}px,${lift}px,0) scale(${1 - .47 * eased}) rotate(${-13 * Math.sin(t * Math.PI)}deg)`;
      parcel.style.opacity = String(1 - clamp((t - .88) / .12));
      cargo[i].style.opacity = t > .88 ? '1' : '0';
      cargo[i].style.transform = `translateY(${-2 * Math.sin(clamp((t-.88)/.12)*Math.PI)}px)`;
      if (t > .7 && t < 1) {glow = Math.max(glow, Math.sin(clamp((t-.7)/.3)*Math.PI));flash.style.left = `${70+i*21}px`;}
    });
    flash.style.opacity = String(glow);
    flash.style.transform = `scale(${.7+glow*.4})`;
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
      scene.classList.remove("is-driving");
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
