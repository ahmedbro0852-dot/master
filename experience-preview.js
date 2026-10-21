(async function(){
  'use strict';
  const KEY='master-experience-demo-v1';
  const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return {};}}
  function write(data){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
  const banner=document.createElement('div');banner.className='xp-banner';banner.innerHTML='<span>نسخة تجريبية · الطلبات هنا محاكاة محلية</span><a href="/experience-lab.html">الإدارة والقياس التجريبي ←</a>';document.body.prepend(banner);
  function count(event){const s=read();s.metrics||={};s.metrics[event]=(s.metrics[event]||0)+1;write(s);}
  count('visits');
  // Capture before the live checkout handler: preview orders must never reach production.
  document.addEventListener('submit',event=>{
    if(event.target.id!=='cartCheckout')return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!event.target.reportValidity())return;
    const items=window.MasterCart?.read()||[];if(!items.length)return;
    const s=read();s.orders||=[];
    const order={id:'DEMO-'+Date.now().toString(36).toUpperCase(),created:new Date().toISOString(),status:'pending',customer:'عميل تجربة',items:items.map(x=>({...x})),starts:'',ends:''};
    s.orders.push(...items.map((item,i)=>({...order,id:order.id+'-'+(i+1),reference:order.id,items:[{...item}]})));if(!write(s)){alert('التخزين المحلي غير متاح؛ لم يتم حفظ الطلب.');return;}
    count('demoOrders');window.MasterCart.write([]);
    document.getElementById('cartContent').innerHTML='<section class="account-panel"><h2>تم حفظ الطلب التجريبي ✓</h2><p>رقم الطلب: <b>'+E(order.id)+'</b></p><p>لم يتم إرسال طلب حقيقي أو خصم أي رصيد. بيانات التواصل المدخلة لم تُحفظ.</p><a class="primary" href="/experience-lab.html">متابعة الطلب في الإدارة التجريبية</a><a class="ghost" href="/index.html#products">كمل تصفح</a></section>';
  },true);
  await window.MasterCatalogReady;
  const C=window.MasterCatalog,S=window.MasterStore;if(!C||!S)return;
  const money=plan=>S.planMoney(plan);
  function plans(p){return (p.plans||[]).map((plan,index)=>({plan,index})).filter(x=>!x.plan.hidden);}
  function cheapest(p){return plans(p).filter(x=>x.plan.available!==false&&(!x.plan.offerEndsAt||Date.now()<Date.parse(x.plan.offerEndsAt))).sort((a,b)=>S.planAmount(a.plan)-S.planAmount(b.plan))[0];}
  function logo(p){return p.id==='gemini-coursera-bundle'?'logos/coursera.svg':p.logoUrl||(p.logo?'logos/'+encodeURIComponent(p.logo)+'.svg':'master-store-logo.png');}
  let selected=[];try{selected=JSON.parse(sessionStorage.getItem('master-compare-demo')||'[]').filter(x=>C.getProduct(x.id)).slice(0,3);}catch{}
  const status=document.createElement('p');status.className='xp-status';status.setAttribute('role','status');document.body.append(status);
  function notify(text){status.textContent=text;setTimeout(()=>status.textContent='',3500);}
  function persist(){try{sessionStorage.setItem('master-compare-demo',JSON.stringify(selected));}catch{}drawTray();}
  function facts(p,plan){return [['المدة',plan.duration],['نوع الحساب',plan.account||plan.planType||'راجع تفاصيل الباقة'],['التفعيل',plan.activation||'يُؤكد قبل الدفع'],['الضمان',plan.warranty||'راجع تفاصيل الباقة']].map(([label,value])=>'<div><dt>'+E(label)+'</dt><dd>'+E(value)+'</dd></div>').join('');}
  const tray=document.createElement('div');tray.className='xp-tray';tray.hidden=true;document.body.append(tray);
  const dialog=document.createElement('dialog');dialog.className='xp-compare';dialog.setAttribute('aria-label','مقارنة الباقات');document.body.append(dialog);
  function drawTray(){tray.hidden=!selected.length;tray.innerHTML='<span>مقارنة '+selected.length+' من ٣</span><button type="button" data-open-compare>قارن الباقات</button><button type="button" data-clear-compare aria-label="مسح المقارنة">مسح</button>';tray.querySelector('[data-open-compare]').onclick=openCompare;tray.querySelector('[data-clear-compare]').onclick=()=>{selected=[];persist();};document.querySelectorAll('[data-xp-compare]').forEach(b=>{const active=selected.some(x=>x.id===b.dataset.xpCompare);b.setAttribute('aria-pressed',String(active));b.textContent=active?'✓ في المقارنة':'＋ قارن الباقات';});}
  function toggle(id,index){if(selected.some(x=>x.id===id))selected=selected.filter(x=>x.id!==id);else{if(selected.length>=3){notify('اختار لحد ٣ خدمات في المقارنة.');return;}selected.push({id,index});count('compareSelections');}persist();}
  function openCompare(){if(!selected.length)return;count('comparisons');
    const rows=selected.map(x=>({p:C.getProduct(x.id),index:x.index}));
    const fields=[['السعر',p=>money(p)],['المدة',p=>p.duration],['الحساب',p=>p.account||p.planType||'راجع تفاصيل الباقة'],['التفعيل',p=>p.activation||'يُؤكد قبل الدفع'],['الضمان',p=>p.warranty||'راجع تفاصيل الباقة'],['التوفر',p=>p.available===false?'غير متاح':'راجع التوفر عند الطلب']];
    dialog.innerHTML='<div class="xp-dialog-head"><h2>اختار الباقة وقارن بوضوح</h2><button type="button" data-close>إغلاق ×</button></div><p>تقدر تختار باقة مختلفة لكل خدمة. الأسعار حسب العملة الحالية.</p><div class="xp-table-wrap"><table><thead><tr><th scope="col">التفاصيل</th>'+rows.map(({p,index})=>'<th scope="col"><img src="'+E(logo(p))+'" alt="" width="40" height="40"><span>'+E(p.name)+'</span><label>الباقة<select data-compare-plan="'+E(p.id)+'">'+plans(p).map(x=>'<option value="'+x.index+'" '+(x.index===index?'selected':'')+'>'+E(x.plan.name||x.plan.duration)+'</option>').join('')+'</select></label></th>').join('')+'</tr></thead><tbody>'+fields.map(([label,value])=>'<tr><th scope="row">'+label+'</th>'+rows.map(({p,index})=>'<td>'+E(value(p.plans[index]||{}))+'</td>').join('')+'</tr>').join('')+'<tr><th scope="row">الطلب</th>'+rows.map(({p,index})=>'<td><a class="primary" href="/products/'+encodeURIComponent(p.id)+'.html?plan='+index+'">تفاصيل الباقة</a><button type="button" data-remove-compare="'+E(p.id)+'">إزالة</button></td>').join('')+'</tr></tbody></table></div>';
    dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.querySelectorAll('[data-compare-plan]').forEach(input=>input.onchange=()=>{selected.find(x=>x.id===input.dataset.comparePlan).index=Number(input.value);persist();openCompare();});dialog.querySelectorAll('[data-remove-compare]').forEach(b=>b.onclick=()=>{selected=selected.filter(x=>x.id!==b.dataset.removeCompare);persist();if(selected.length)openCompare();else dialog.close();});if(!dialog.open)dialog.showModal();
  }
  function enhanceCards(){document.querySelectorAll('#grid>.product-card').forEach(card=>{if(card.querySelector('.xp-facts'))return;const p=C.getProduct(card.dataset.productId),best=p&&cheapest(p);if(!best)return;const list=document.createElement('dl');list.className='xp-facts';list.innerHTML=facts(p,best.plan);const price=card.querySelector('.light-meta');if(price){price.insertAdjacentHTML('beforeend','<small class="xp-price-label">يبدأ من · '+E(best.plan.duration)+'</small>');price.after(list);}const button=document.createElement('button');button.type='button';button.className='xp-compare-button';button.dataset.xpCompare=p.id;button.onclick=()=>toggle(p.id,best.index);card.querySelector('.card-bottom')?.append(button);});drawTray();}
  const grid=document.getElementById('grid');if(grid){enhanceCards();let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhanceCards();});}).observe(grid,{childList:true});}
  if(window.MasterCart?.add){const add=window.MasterCart.add;window.MasterCart.add=function(...args){const result=add.apply(this,args);count('cartAdds');return result;};}
  if(document.getElementById('productPage'))count('productViews');
  let searchTimer;document.getElementById('search')?.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{if(document.getElementById('search').value.trim()){count('searches');if(document.getElementById('empty')?.getClientRects().length)count('emptySearches');}},1200);});
  const cart=document.getElementById('cartContent');if(cart){count('cartViews');cart.addEventListener('click',e=>{if(e.target.closest('.cart-remove'))count('cartRemoves');});function checkoutHints(){const form=cart.querySelector('#cartCheckout');if(!form||form.querySelector('.xp-checkout-note'))return;form.insertAdjacentHTML('afterbegin','<p class="xp-checkout-note">تجربة فقط: راجع الباقة والعدد والإجمالي. التأكيد يحفظ طلبًا محليًا ولن يرسل طلبًا حقيقيًا.</p>');form.querySelectorAll('input').forEach(input=>{if(input.name==='phone'){input.inputMode='tel';input.autocomplete='tel';}if(input.name==='email')input.autocomplete='email';if(input.name==='name')input.autocomplete='name';});}checkoutHints();new MutationObserver(checkoutHints).observe(cart,{childList:true,subtree:true});}
  document.addEventListener('masterstore:localechange',()=>{document.querySelectorAll('.xp-facts').forEach(x=>x.remove());document.querySelectorAll('.xp-price-label,.xp-compare-button').forEach(x=>x.remove());enhanceCards();});
})();
