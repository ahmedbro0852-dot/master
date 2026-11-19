(function(){
'use strict';
// UI is mounted after the existing protected administrator snapshot succeeds.
// Updates reuse the existing admin-only RPC and its optimistic concurrency guard.
const C=window.MasterCloud;
const validPercent=n=>Number.isFinite(n)&&n>=-50&&n<=100;
function priceAfter(base,percent){
 if(!Number.isSafeInteger(base)||base<100||!validPercent(percent))return null;
 const next=Math.round(base*(1+percent/100));
 return Number.isSafeInteger(next)&&next>=100&&next<=100000000?next:null;
}
function mount(box,context){
 if(!box||!context?.plans||!context.selection||!context.refresh)return;
 const placeholder=box.querySelector('.power-warning');
 if(!placeholder)return;
 const card=document.createElement('section');card.className='power-pricing';card.setAttribute('aria-label','إدارة أسعار الباقات جماعيًا');
 card.innerHTML='<h4>💰 تعديل أسعار مجموعة باقات</h4>'+
 '<p>اختر الباقات من الجدول، وحدد نسبة زيادة أو تخفيض. هتشوف الأسعار الجديدة قبل ما تعتمدها. مفيش سعر بيتغيّر قبل التأكيد.</p>'+
 '<div class="power-pricing-controls"><label>نسبة التعديل (%) <input data-price-percent type="number" inputmode="decimal" min="-50" max="100" step="0.5" value="5"></label>'+
 '<button data-price-preview type="button" class="ghost-btn">معاينة الأسعار</button>'+
 '<button data-price-apply type="button" class="primary" disabled>اعتماد الأسعار الجديدة</button></div>'+
 '<p class="power-pricing-preview" data-price-result role="status">حدد باقات من الجدول ثم اضغط معاينة.</p>';
 placeholder.before(card);
 const percent=card.querySelector('[data-price-percent]');
 const preview=card.querySelector('[data-price-preview]');
 const apply=card.querySelector('[data-price-apply]');
 const result=card.querySelector('[data-price-result]');
 let ready=null,running=false;
 const fingerprint=()=>[...context.selection()].sort().join('|');
 const rows=()=>context.plans.filter(p=>context.selection().has(String(p.product_id)+'::'+String(p.plan_index)));
 const money=n=>(Number(n)/100).toFixed(2)+' ج';
 const reset=()=>{ready=null;apply.disabled=true;result.textContent='معاينة الأسعار غير جاهزة. اختار الباقات واضغط معاينة.';};
 box.querySelector('#powerPlans')?.addEventListener('change',()=>{reset();});
 percent.addEventListener('input',reset);
 preview.addEventListener('click',()=>{
  if(running||context.busy?.())return;
  const raw=percent.value.trim(),rate=Number(raw),selected=rows();
  if(!raw||!validPercent(rate)){reset();result.textContent='نسبة التعديل المسموحة من تخفيض 50% إلى زيادة 100%.';return;}
  if(!selected.length||selected.length>25){reset();result.textContent='حدد من 1 إلى 25 باقة في الصفحة الحالية.';return;}
  const proposals=selected.map(p=>({p,next:priceAfter(Number(p.price_piasters),rate)}));
  if(proposals.some(x=>x.next===null)){reset();result.textContent='يوجد سعر بعد التعديل خارج الحدود المتاحة. جرّب نسبة مختلفة.';return;}
  const changes=proposals.filter(x=>x.next!==Number(x.p.price_piasters));
  if(!changes.length){reset();result.textContent='لا يوجد تغيير بعد تقريب السعر. اختر نسبة مختلفة.';return;}
  ready={rate,signature:fingerprint(),changes};
  result.textContent='معاينة '+changes.length+' باقة: '+changes.slice(0,5).map(x=>x.p.product_name+' / '+x.p.plan_name+': '+money(x.p.price_piasters)+' ← '+money(x.next)).join(' | ')+(changes.length>5?' · توجد باقات أخرى':'');
  apply.disabled=false;
 });
 apply.addEventListener('click',async()=>{
  if(running||context.busy?.()||!ready||ready.signature!==fingerprint())return reset();
  const {rate,changes}=ready;
  if(!confirm('تأكيد تغيير أسعار '+changes.length+' باقة بنسبة '+rate+'%؟\nلن يتم تعديل المدفوعات أو الطلبات السابقة. قد يتوقف التنفيذ عند أول تعارض.'))return;
  running=true;apply.disabled=true;preview.disabled=true;
  let completed=0,issue=null;
  for(const {p,next} of changes){
   try{
    await C.unwrap(C.client.rpc('master_store_admin_plan',{
     product_key:p.product_id,plan_number:p.plan_index,price:next,
     is_available:p.available,quantity_limit:p.max_quantity,expected_version:p.updated_at
    }));
    completed++;
   }catch(error){issue=error;break;}
  }
  ready=null;
  try{await context.refresh();}catch(error){issue=issue||error;}
  const details=issue?'تم تعديل '+completed+' باقة ثم توقفت العملية: '+String(issue.message||issue):'تم تحديث أسعار '+completed+' باقة بنجاح.';
  context.notify?.(details,!!issue);
  running=false;preview.disabled=false;reset();
 });
}
window.MasterBulkPricing={mount,priceAfter,validPercent};
})();
