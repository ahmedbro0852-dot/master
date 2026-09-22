const categories=['الكل',...new Set(products.map(p=>p.category))];
let selected='الكل';
const grid=document.querySelector('#grid'),filters=document.querySelector('#filters'),search=document.querySelector('#search'),empty=document.querySelector('#empty'),dialog=document.querySelector('#productDialog'),dialogContent=document.querySelector('#dialogContent'),checkoutDialog=document.querySelector('#checkoutDialog'),checkoutContent=document.querySelector('#checkoutContent'),toast=document.querySelector('#toast');
function initials(n){return n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function productIcon(p){const url=p.logo?`logos/${p.logo}.svg`:p.domain?`https://www.google.com/s2/favicons?domain_url=https://${encodeURIComponent(p.domain)}&sz=256`:'';return `<span class="product-icon logo-${p.logo||'remote'} ${url?'':'logo-failed'}">${url?`<img src="${url}" alt="شعار ${p.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.classList.add('logo-failed')">`:''}<span class="fallback">${initials(p.name)}</span></span>`}
function drawFilters(){filters.innerHTML=categories.map(c=>`<button class="filter ${c===selected?'active':''}" data-c="${c}">${c}</button>`).join('');filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=b.dataset.c;drawFilters();draw()})}
function shortText(x,n=95){x=String(x||'');return x.length>n?x.slice(0,n).trim()+'…':x}
function draw(){
 const q=search.value.trim().toLowerCase();
 const list=products.filter(p=>(selected==='الكل'||p.category===selected)&&Object.values(p).join(' ').toLowerCase().includes(q)).sort((a,b)=>(a.status==='متاح'?0:1)-(b.status==='متاح'?0:1));
 grid.innerHTML=list.map(p=>{
   const highlight=p.deep?.features?.[0]||p.description;
   return `<article class="card">
    <div class="card-top">${productIcon(p)}<span class="badge ${p.status!=='متاح'?'soon':''}">${p.status}</span></div>
    <h3>${p.name}</h3>
    <span class="category">${p.category}</span>
    ${p.official?'<span class="researched-badge">✓ مواصفات رسمية محدثة</span>':''}
    <p class="card-desc">${shortText(highlight)}</p>
    <div class="card-bottom">
      <div><small>${p.plans.length>1?p.plans.length+' خطط':p.duration}</small><strong>${p.price}</strong></div>
      <a class="details" href="product.html?product=${encodeURIComponent(p.name)}">اختار واشترك</a>
    </div>
   </article>`;
 }).join('');
 empty.style.display=list.length?'none':'block';
}
function fact(label,value){return `<div class="fact"><small>${label}</small><b>${value}</b></div>`}
function resolvePlan(p,plan={}){return{name:plan.name||p.duration,duration:plan.duration||p.duration,price:plan.price||p.price,credits:plan.credits||'غير محدد',activation:plan.activation||p.activation,account:plan.account||p.account,warranty:plan.warranty||p.warranty}}
function yesNoFact(text,yesWords,noWords){
 const t=String(text||'').toLowerCase();
 if(noWords.some(x=>t.includes(x)))return 'لا — حسب تفاصيل العرض الحالي.';
 if(yesWords.some(x=>t.includes(x)))return 'نعم/قد يُطلب — راجع خطوة التفعيل قبل التنفيذ.';
 return 'غير محدد بشكل ثابت؛ يتم تأكيده قبل الدفع.';
}
function faqFor(p,plan){
 const all=[p.activation,p.account,plan.activation,plan.account,(p.deep?.notes||[]).join(' ')].join(' ');
 let password='في الحسابات الجاهزة يُفضّل عدم تغيير البيانات إلا إذا كان العرض يسمح بذلك صراحةً.';
 if(p.name==='Gamma Account')password='نعم — في عرض Gamma Account يتم تغيير كلمة المرور فور الاستلام، ثم الاحتفاظ بها لأن نسيانها غير مشمول.';
 else if(/حساب العميل|شخصي|البريد الشخصي/i.test(all))password='الحساب شخصي وتحت سيطرتك؛ أي تغيير أثناء التفعيل نفسه يُفضّل تأجيله حتى يكتمل الاشتراك.';
 const card=yesNoFact(all,['بطاقة'],['بدون بطاقة','لا يحتاج بطاقة']);
 const otp=yesNoFact(all,['otp','كود'],['بدون كود']);
 return [
  ['هل أحتاج بطاقة؟',card],
  ['هل قد أحتاج OTP أو كود؟',otp],
  ['هل أقدر أغيّر كلمة المرور؟',password],
  ['كيف أستلم الخدمة؟',plan.activation||p.activation||'يتم تأكيد طريقة التسليم قبل الدفع.'],
  ['ما الضمان؟',plan.warranty||p.warranty||'يتم تأكيد الضمان قبل الدفع.']
 ];
}

function openDetails(id){
 const p=products[id],plans=p.plans.length?p.plans:[resolvePlan(p)],first=resolvePlan(p,plans[0]);
 const deep=p.deep||{},features=(deep.features&&deep.features.length?deep.features:p.benefits),best=deep.best||[],notes=[...(deep.notes||[]),...(p.terms||[])];
 const options=p.plans.length>1?`<label class="plan-picker"><span>اختر الخطة</span><select id="planSelect">${p.plans.map((x,i)=>`<option value="${i}">${x.name} — ${x.price}</option>`).join('')}</select></label>`:'';
 function planTable(){
   if(!p.plans.length||p.plans.length<2)return '';
   return `<details class="detail-accordion"><summary>مقارنة كل الخطط</summary><div class="accordion-body"><div class="plan-table-wrap"><table class="plan-table"><thead><tr><th>الخطة</th><th>المدة</th><th>السعر</th><th>الرصيد</th></tr></thead><tbody>${p.plans.map(x=>{const q=resolvePlan(p,x);return `<tr><td>${x.name}</td><td>${q.duration}</td><td>${q.price}</td><td>${q.credits}</td></tr>`}).join('')}</tbody></table></div></div></details>`;
 }
 function dynamic(plan){
   return `
    <details class="detail-accordion"><summary>طريقة التفعيل والاستلام</summary><div class="accordion-body"><ol class="journey-list">${activationJourney(p,plan).map((x,i)=>`<li><span>${i+1}</span><p>${x}</p></li>`).join('')}</ol></div></details>
    <details class="detail-accordion"><summary>الحساب والضمان</summary><div class="accordion-body"><div class="deep-grid"><section class="deep-card"><h4>الحساب والأمان</h4><ul class="detail-list">${accountSafety(p,plan).map(x=>`<li>${x}</li>`).join('')}</ul></section><section class="deep-card"><h4>الضمان والدعم</h4><ul class="detail-list">${warrantyText(p,plan).map(x=>`<li>${x}</li>`).join('')}</ul></section></div></div></details>
    <details class="detail-accordion"><summary>أسئلة شائعة</summary><div class="accordion-body"><div class="faq-list" id="faqList">${faqFor(p,plan).map(x=>`<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('')}</div></div></details>`;
 }
 dialogContent.innerHTML=`<div class="detail-hero compact-detail"><div class="detail-heading">${productIcon(p)}<div><h2 id="dialogTitle">${p.name}</h2><p>${p.category}</p></div></div><div class="detail-price"><strong id="detailPrice">${first.price}</strong><span class="badge ${p.status!=='متاح'?'soon':''}">${p.status}</span></div></div>
 <div class="detail-body">
  <p class="detail-description">${p.description}</p>
  ${options}
  <div class="detail-facts compact-facts">
   <div class="fact"><small>المدة</small><b id="detailDuration">${first.duration}</b></div>
   <div class="fact"><small>الرصيد</small><b id="detailCredits">${first.credits}</b></div>
   <div class="fact"><small>التفعيل</small><b id="detailActivation">${first.activation}</b></div>
   <div class="fact"><small>الحساب</small><b id="detailAccount">${first.account}</b></div>
   <div class="fact"><small>الضمان</small><b id="detailWarranty">${first.warranty}</b></div>
  </div>
  <div class="simple-feature-box"><h3>يشمل</h3><ul class="feature-grid">${features.slice(0,4).map(x=>`<li>${x}</li>`).join('')}</ul>${best.length?`<div class="best-tags">${best.map(x=>`<span>${x}</span>`).join('')}</div>`:''}</div>
  ${planTable()}
  <div id="dynamicDeep">${dynamic(first)}</div>
  ${notes.length?`<details class="detail-accordion warning-accordion"><summary>ملاحظات مهمة قبل الدفع</summary><div class="accordion-body"><ul class="detail-list terms-list">${notes.map(x=>`<li>${x}</li>`).join('')}</ul></div></details>`:''}
  <button class="dialog-order" data-order-dialog="${p.id}" ${p.status!=='متاح'?'disabled':''}>${p.status==='متاح'?'اطلب هذه الخطة':'غير متاح حاليًا'}</button>
 </div>`;
 dialog.showModal();
 let chosen=first;
 const select=dialogContent.querySelector('#planSelect');
 if(select)select.onchange=()=>{
   chosen=resolvePlan(p,p.plans[+select.value]);
   dialogContent.querySelector('#detailPrice').textContent=chosen.price;
   dialogContent.querySelector('#detailDuration').textContent=chosen.duration;
   dialogContent.querySelector('#detailCredits').textContent=chosen.credits;
   dialogContent.querySelector('#detailActivation').textContent=chosen.activation;
   dialogContent.querySelector('#detailAccount').textContent=chosen.account;
   dialogContent.querySelector('#detailWarranty').textContent=chosen.warranty;
   dialogContent.querySelector('#dynamicDeep').innerHTML=dynamic(chosen);
 };
 dialogContent.querySelector('[data-order-dialog]')?.addEventListener('click',()=>orderProduct(p,chosen));
}
const paymentInfo={we1:['WE Pay','01500950624 — أحمد …م…م…'],we2:['WE Pay','01505896364 — منصور …ع…ج…'],binance:['Binance Pay','Pay ID: 1222200704']};
function paymentBox(key){const x=paymentInfo[key];return `<div class="payment-details"><b>${x[0]}</b><span>${x[1]}</span><small>يرجى تأكيد توفر الخدمة والسعر عبر واتساب قبل التحويل.</small></div>`}
function orderProduct(p,selectedPlan){
 if(p.status!=='متاح'){showToast('هذه الخدمة غير متاحة حاليًا');return}
 const plan=selectedPlan||resolvePlan(p);if(dialog.open)dialog.close();
 checkoutContent.innerHTML=`<div class="checkout-head"><h2 id="checkoutTitle">مراجعة الطلب</h2><p>هذه معاينة كاملة للطلب. لن يتم الخصم أو إرسال الطلب قبل تركيب نظام التحقق من الدفع.</p></div><div class="order-summary">${productIcon(p)}<div><b>${p.name}</b><small>${plan.name} — ${plan.duration}</small><small>${plan.activation} • ${plan.account}</small></div><strong id="orderTotal">${plan.price}</strong></div><div class="checkout-plan"><span>Credits: <b>${plan.credits}</b></span><span>الضمان: <b>${plan.warranty}</b></span></div><form id="checkoutForm"><div class="form-grid"><label class="field"><span>الاسم</span><input name="name" required placeholder="الاسم الكامل"></label><label class="field"><span>رقم واتساب</span><input name="phone" required inputmode="tel" placeholder="01xxxxxxxxx"></label><label class="field full"><span>البريد الإلكتروني</span><input name="email" type="email" required placeholder="name@example.com"></label><label class="field full"><span>الكمية — الحد الأقصى 5</span><select name="quantity" id="quantitySelect">${[1,2,3,4,5].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></label></div><h3>طريقة الدفع</h3><div class="payment-choices"><div class="payment-choice"><input id="pay1" type="radio" name="pay" value="we1" checked><label for="pay1"><b>WE Pay</b><small>01500950624</small></label></div><div class="payment-choice"><input id="pay2" type="radio" name="pay" value="we2"><label for="pay2"><b>WE Pay</b><small>01505896364</small></label></div><div class="payment-choice"><input id="pay3" type="radio" name="pay" value="binance"><label for="pay3"><b>Binance Pay</b><small>1222200704</small></label></div></div><div id="payDetails">${paymentBox('we1')}</div><div class="api-pending"><b>الدفع متوقف مؤقتًا</b><span>سيُفعّل الطلب بعد تركيب API التحقق من الدفع. عند نجاح التحقق سيُحفظ الطلب في الإدارة ويظهر للعميل نص واتساب جاهز لإرساله كتأكيد إضافي.</span></div><button class="checkout-submit" type="button" disabled>في انتظار ربط التحقق من الدفع</button><p class="checkout-safe">الأسعار المعروضة نهائية ولا توجد رسوم إضافية.</p></form>`;
 checkoutDialog.showModal();
 checkoutContent.querySelectorAll('[name="pay"]').forEach(r=>r.onchange=()=>checkoutContent.querySelector('#payDetails').innerHTML=paymentBox(r.value));
 const quantity=checkoutContent.querySelector('#quantitySelect'),total=checkoutContent.querySelector('#orderTotal'),numeric=Number(plan.price.replace(/[^0-9]/g,''));
 quantity.onchange=()=>{total.textContent=numeric?`${numeric*Number(quantity.value).toLocaleString('en-US')} ج`:plan.price};
}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}
document.querySelector('.dialog-close').onclick=()=>dialog.close();document.querySelector('.checkout-close').onclick=()=>checkoutDialog.close();[dialog,checkoutDialog].forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));document.querySelectorAll('.copy').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);showToast('تم النسخ')}catch{showToast('تعذر النسخ')}});search.addEventListener('input',draw);drawFilters();draw();

const mobileMenu=document.querySelector('.menu');
const mobileNav=document.createElement('nav');
mobileNav.className='mobile-nav';
mobileNav.setAttribute('aria-label','التنقل السريع');
mobileNav.innerHTML='<a href="#products">المنتجات</a><a href="#how">طريقة الطلب</a><a href="#payment">طرق الدفع</a><a href="#terms">الشروط</a>';
document.querySelector('.topbar').appendChild(mobileNav);
mobileMenu.setAttribute('aria-expanded','false');
mobileMenu.onclick=()=>{const open=mobileNav.classList.toggle('open');mobileMenu.setAttribute('aria-expanded',String(open))};
mobileNav.querySelectorAll('a').forEach(link=>link.onclick=()=>{mobileNav.classList.remove('open');mobileMenu.setAttribute('aria-expanded','false')});

const checkoutObserver=new MutationObserver(()=>{
 const submit=checkoutContent.querySelector('.checkout-submit');
 const form=checkoutContent.querySelector('#checkoutForm');
 if(!submit||!form||submit.dataset.ready)return;
 submit.disabled=false;
 submit.textContent='إرسال الطلب للمراجعة عبر واتساب';
 submit.dataset.ready='true';
 submit.onclick=()=>{
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const product=checkoutContent.querySelector('.order-summary b')?.textContent||'';
  const plan=checkoutContent.querySelector('.order-summary small')?.textContent||'';
  const total=checkoutContent.querySelector('#orderTotal')?.textContent||'';
  const message=['طلب جديد من MASTER STORE','المنتج: '+product,'الخطة: '+plan,'الكمية: '+data.get('quantity'),'الاسم: '+data.get('name'),'واتساب: '+data.get('phone'),'البريد: '+data.get('email'),'الإجمالي: '+total,'طريقة الدفع المفضلة: '+data.get('pay'),'أرغب بتأكيد التوفر وطريقة الدفع قبل التحويل.'].join('\n');
  window.open('https://wa.me/201500950624?text='+encodeURIComponent(message),'_blank','noopener');
  showToast('تم تجهيز رسالة الطلب في واتساب');
 };
});
checkoutObserver.observe(checkoutContent,{childList:true,subtree:true});
