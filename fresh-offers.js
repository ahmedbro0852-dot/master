(function(root){
'use strict';
const WEEK=7*24*60*60*1000;
function recent(value,now){const t=Date.parse(value);return Number.isFinite(t)&&t<=now&&now<t+WEEK;}
function entries(rows,catalog,now=Date.now()){
 return (rows||[]).flatMap(row=>{
  const product=catalog.getProduct(row.product_id),plan=product?.plans?.[row.plan_index];
  if(!row.available||!product||product.redirectTo||!plan||plan.hidden||plan.available===false||!Number.isFinite(Number(row.price_piasters))||Number(row.price_piasters)<=0)return [];
  if(plan.offerEndsAt&&now>=Date.parse(plan.offerEndsAt))return [];
  const discounted=recent(row.discounted_at,now)&&Number(row.previous_price_piasters)>Number(row.price_piasters);
  const added=recent(row.launched_at,now);
  if(!discounted&&!added)return [];
  return [{row,product,plan,discounted,added,stamp:Math.max(added?Date.parse(row.launched_at):0,discounted?Date.parse(row.discounted_at):0)}];
 }).sort((a,b)=>b.stamp-a.stamp||a.product.id.localeCompare(b.product.id)||a.row.plan_index-b.row.plan_index);
}
if(typeof module==='object'&&module.exports){module.exports={entries,recent,WEEK};return;}
const section=document.getElementById('freshOffers');if(!section)return;
const Store=root.MasterStore,Locale=root.MasterLocale,E=Store.escapeHtml;
const text=(ar,en)=>Locale?.getState().language==='en'?en:ar;
const logo=p=>p.logoUrl||(p.logo?'logos/'+encodeURIComponent(p.logo)+'.svg':'master-store-logo.png');
const key=x=>x.product.id+':'+x.row.plan_index;
const version=x=>key(x)+':'+x.stamp+':'+x.row.price_piasters;
const tr=(x,value,kind)=>Locale?.catalogText(value,kind,x.product.id)||value||'';
const shortNames={'chatgpt-plus':['شات بلس','ChatGPT Plus'],'elevenlabs':['إيلفن لابس','ElevenLabs'],'gemini-pro':['جيمناي','Gemini'],'autodesk-apps':['أوتوديسك','Autodesk'],'kling':['كلينج','Kling'],'grok-cursor-premium':['جروك + كيرسور','Grok + Cursor']};
let rows=null,busy=false,signature='',items=[],activeKey=null,opener=null,paused=true,elapsed=0,lastTick=performance.now(),touch=null;
let seen={};try{seen=JSON.parse(localStorage.getItem('masterStoreOfferStoriesSeenV1')||'{}');if(!seen||typeof seen!=='object'||Array.isArray(seen))seen={};}catch{seen={};}
const reduced=root.matchMedia('(prefers-reduced-motion: reduce)');
const dialog=document.createElement('dialog');dialog.className='offer-story-dialog';
dialog.innerHTML='<div class="offer-story-shell"><div class="offer-story-progress" aria-hidden="true"></div><header class="offer-story-header"><span class="offer-story-service"></span><div><button type="button" data-story-action="pause"></button><button type="button" data-story-action="close">×</button></div></header><div class="offer-story-body"></div><footer class="offer-story-footer"><div class="offer-story-nav"><button type="button" data-story-action="prev">‹</button><span class="offer-story-counter"></span><button type="button" data-story-action="next">›</button></div><a class="offer-story-link"></a></footer></div>';
document.body.append(dialog);
function amount(x,previous=false){const plan={...x.plan,price:Number(previous?x.row.previous_price_piasters:x.row.price_piasters)/100,manualPrice:true};delete plan.basePriceUSD;delete plan.currencyPrices;delete plan.marketPrices;return Store.planMoney(plan);}
function markSeen(x){seen[version(x)]=Date.now();const keys=Object.keys(seen).sort((a,b)=>seen[b]-seen[a]);seen=Object.fromEntries(keys.slice(0,300).map(k=>[k,seen[k]]));try{localStorage.setItem('masterStoreOfferStoriesSeenV1',JSON.stringify(seen));}catch{} }
function ringMarkup(x){const names=shortNames[x.product.id],name=names?names[Locale?.getState().language==='en'?1:0]:x.product.name;const all=items.filter(y=>y.product.id===x.product.id),unread=all.some(y=>!seen[version(y)]);return '<button class="offer-story-bubble '+(unread?'unseen':'seen')+'" type="button" data-story-product="'+E(x.product.id)+'" aria-label="'+E(text('افتح عروض ','Open offers for ')+x.product.name)+'"><span class="offer-story-ring"><img src="'+E(logo(x.product))+'" alt="" width="56" height="56"></span><span class="offer-story-caption" dir="auto">'+E(name)+'</span><small>'+E(all.some(y=>y.discounted)?text('تخفيض','Price drop'):text('جديد','New'))+'</small></button>';}
function drawRings(){const groups=[...new Map(items.map(x=>[x.product.id,x])).values()];section.querySelector('.fresh-offers-grid').innerHTML=groups.map(ringMarkup).join('');}
function render(){
 section.querySelector('h2').textContent=text('🆕 أحدث العروض | تخفيضات 🔥','🆕 Latest offers | Price drops 🔥');
 section.querySelector('.fresh-offers-note').textContent=text('اضغط على الخدمة وشوف الجديد. تظهر الإضافات والتخفيضات هنا لمدة 7 أيام.','Tap a service to explore. New plans and price drops appear here for 7 days.');
 const nextItems=entries(rows,root.MasterCatalog);const next=JSON.stringify([Locale?.getState(),nextItems.map(x=>x.row)]);
 items=nextItems;section.hidden=!items.length;
 if(next===signature)return;signature=next;drawRings();
 if(dialog.open){if(!items.some(x=>key(x)===activeKey)){if(items.length){activeKey=key(items[0]);elapsed=0;}else{dialog.close();return;}}drawStory();}
}
function drawStory(){
 const index=items.findIndex(x=>key(x)===activeKey),x=items[index];if(!x){dialog.close();return;}
 markSeen(x);drawRings();
 dialog.setAttribute('aria-label',text('عرض ','Offer: ')+x.product.name);
 dialog.querySelector('.offer-story-progress').innerHTML=items.map((_,i)=>'<span><i style="width:'+(i<index?100:0)+'%"></i></span>').join('');
 dialog.querySelector('.offer-story-service').innerHTML='<img src="'+E(logo(x.product))+'" alt="" width="32" height="32"><b dir="auto">'+E(x.product.name)+'</b>';
 const fields=[[text('المدة','Duration'),tr(x,x.plan.duration,'duration')],[text('الحساب','Account'),tr(x,x.plan.account,'account')],[text('الضمان','Warranty'),tr(x,x.plan.warranty,'warranty')]].filter(f=>f[1]);
 dialog.querySelector('.offer-story-body').innerHTML='<div class="offer-story-logo"><img src="'+E(logo(x.product))+'" alt="" width="108" height="108"></div><span class="offer-story-tag">'+text(x.discounted?'انخفض السعر':'وصل حديثًا',x.discounted?'Price drop':'New arrival')+'</span><h3 dir="auto">'+E(x.product.name)+'</h3><p class="offer-story-tier">'+E(tr(x,x.plan.name,'planName'))+'</p><div class="offer-story-price"><strong>'+E(amount(x))+'</strong>'+(x.discounted?'<span>'+text('بدلًا من','Previously')+' <del>'+E(amount(x,true))+'</del></span>':'')+'</div><dl>'+fields.map(([label,value])=>'<div><dt>'+E(label)+'</dt><dd>'+E(value)+'</dd></div>').join('')+'</dl>'+(x.plan.credits?'<p class="offer-story-credits">'+E(tr(x,x.plan.credits,'credits'))+'</p>':'')+'<small class="offer-story-disclaimer">'+text('راجع كل المميزات والشروط داخل الباقة. مدة الظهور لا تحدد انتهاء السعر.','See the plan for full features and terms. Story visibility does not set a price expiry.')+'</small>';
 const link=dialog.querySelector('.offer-story-link');link.textContent=text('شوف الباقة','View plan');link.href='products/'+encodeURIComponent(x.product.id)+'.html?plan='+x.row.plan_index;
 dialog.querySelector('.offer-story-counter').textContent=(index+1)+' / '+items.length;
 dialog.querySelector('[data-story-action="prev"]').disabled=index===0;
 dialog.querySelector('[data-story-action="prev"]').setAttribute('aria-label',text('العرض السابق','Previous offer'));
 dialog.querySelector('[data-story-action="next"]').setAttribute('aria-label',text(index===items.length-1?'إنهاء العرض':'العرض التالي',index===items.length-1?'Finish stories':'Next offer'));
 dialog.querySelector('[data-story-action="close"]').setAttribute('aria-label',text('إغلاق','Close'));drawPause();tickProgress();
}
function drawPause(){const b=dialog.querySelector('[data-story-action="pause"]');b.textContent=paused?'▶':'Ⅱ';b.setAttribute('aria-label',paused?text('تشغيل التنقل التلقائي','Play automatic advance'):text('إيقاف التنقل التلقائي','Pause automatic advance'));b.setAttribute('aria-pressed',String(paused));}
function tickProgress(){const i=items.findIndex(x=>key(x)===activeKey),bar=dialog.querySelectorAll('.offer-story-progress i')[i];if(bar)bar.style.width=Math.min(100,elapsed/8000*100)+'%';}
function move(delta){const i=items.findIndex(x=>key(x)===activeKey)+delta;if(i<0)return;if(i>=items.length){dialog.close();return;}activeKey=key(items[i]);elapsed=0;lastTick=performance.now();drawStory();}
section.addEventListener('click',event=>{const button=event.target.closest('[data-story-product]');if(!button)return;const group=items.filter(x=>x.product.id===button.dataset.storyProduct),x=group.find(x=>!seen[version(x)])||group[0];if(!x)return;opener=button.dataset.storyProduct;activeKey=key(x);elapsed=0;paused=reduced.matches;lastTick=performance.now();dialog.showModal();document.body.classList.add('offer-story-open');drawStory();dialog.querySelector('[data-story-action="close"]').focus();});
dialog.addEventListener('click',event=>{const action=event.target.closest('[data-story-action]')?.dataset.storyAction;if(action==='close'||event.target===dialog)dialog.close();if(action==='prev')move(-1);if(action==='next')move(1);if(action==='pause'){paused=!paused;drawPause();}});
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();move(1);}if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}});
dialog.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&!event.target.closest('button,a')){touch={x:event.clientX,y:event.clientY};}});
dialog.addEventListener('pointerup',event=>{if(!touch)return;const dx=event.clientX-touch.x,dy=event.clientY-touch.y;touch=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);});
dialog.addEventListener('pointercancel',()=>{touch=null;});
dialog.addEventListener('close',()=>{document.body.classList.remove('offer-story-open');activeKey=null;const target=Array.from(section.querySelectorAll('[data-story-product]')).find(b=>b.dataset.storyProduct===opener)||section.querySelector('[data-story-product]');target?.focus();});
setInterval(()=>{const now=performance.now(),delta=now-lastTick;lastTick=now;if(dialog.open&&!paused&&!document.hidden&&!touch){elapsed+=Math.min(delta,300);if(elapsed>=8000)move(1);else tickProgress();}},100);
async function refresh(){
 if(busy||document.hidden)return;busy=true;
 try{const response=await fetch('https://gmysuhoebcapigdidnnv.supabase.co/rest/v1/master_store_plans?select=product_id,plan_index,price_piasters,previous_price_piasters,available,launched_at,discounted_at',{headers:{apikey:'sb_publishable_zHcukZ2xWD8RqrYu3i-Wzw_Kd4c8x-h'},cache:'no-store',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('catalog');const data=await response.json();if(!Array.isArray(data))throw Error('catalog');rows=data;}
 catch{rows=null;}finally{busy=false;render();}
}
Promise.resolve(root.MasterCatalogReady).then(()=>{refresh();setInterval(refresh,60000);setInterval(render,1000);});
document.addEventListener('masterstore:localechange',()=>{if(rows){signature='';render();}});
document.addEventListener('visibilitychange',()=>{lastTick=performance.now();if(!document.hidden)refresh();});
})(typeof window==='undefined'?globalThis:window);
