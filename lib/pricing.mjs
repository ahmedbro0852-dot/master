// Use the provider's explicit integer-cent quote. Missing quotes must never
// silently fall back to a different duration or a zero-cost generation.
export function quoteCents(model,duration){
 if(!model||!Number.isInteger(Number(duration))||!model.duration_options?.includes(Number(duration)))return null;
 const row=model.prices?.find(p=>p.duration_sec===Number(duration));
 return Number.isInteger(row?.cost_usd_cents)&&row.cost_usd_cents>0?row.cost_usd_cents:null;
}
export function videoCapacity(balance,cost){return Number.isInteger(balance)&&balance>=0&&Number.isInteger(cost)&&cost>0?Math.floor(balance/cost):null;}
export function money(cents){return Number.isInteger(cents)?'$'+(cents/100).toFixed(2):'—';}
