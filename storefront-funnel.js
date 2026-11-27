(() => {
  'use strict';

  const stages = new Set(['product_view', 'plan_choice', 'cart_ready', 'order_submit', 'order_recorded']);
  const pending = new Set();
  const storageKey = 'masterStoreFunnelV1';
  const cairo = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit'
  });

  async function mark(stage) {
    if (!stages.has(stage) || pending.has(stage) || !window.MasterCloud?.ready ||
        navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
    const day = cairo.format(new Date());
    let stored;
    try {
      stored = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      if (stored[stage] === day) return;
    } catch { return; }
    pending.add(stage);
    try {
      const result = await window.MasterCloud.client.rpc('master_store_record_funnel', { event_stage: stage });
      if (!result.error) {
        const latest = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
        sessionStorage.setItem(storageKey, JSON.stringify({ ...latest, [stage]: day }));
      }
    } catch { /* Checkout is independent of measurement. */ }
    finally { pending.delete(stage); }
  }

  window.MasterFunnel = { mark };
})();
