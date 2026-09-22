const page=document.querySelector('#productPage');
const toast=document.querySelector('#toast');

function productInitials(n){return n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function productLogo(p){
  const url=p.logo?`logos/${p.logo}.svg`:p.domain?`https://www.google.com/s2/favicons?domain_url=https://${encodeURIComponent(p.domain)}&sz=256`:'';
  return `<span class="service-logo ${url?'':'logo-failed'}">${url?`<img src="${url}" alt="شعار ${p.name}" onerror="this.parentElement.classList.add('logo-failed')">`:''}<span class="fallback">${productInitials(p.name)}</span></span>`;
}
function resolveProductPlan(p,plan={}){
 return {
  name:plan.name||p.duration,
  duration:plan.duration||p.duration,
  price:plan.price||p.price,
  credits:plan.credits||'غير محدد',
  activation:plan.activation||p.activation,
  account:plan.account||p.account,
  warranty:plan.warranty||p.warranty
 };
}
function yesNoFact(text,yesWords,noWords){
 const t=String(text||'').toLowerCase();
 if(noWords.some(x=>t.includes(x)))return 'لا — حسب تفاصيل العرض الحالي.';
 if(yesWords.some(x=>t.includes(x)))return 'نعم/قد يُطلب — راجع طريقة التفعيل قبل التنفيذ.';
 return 'غير محدد بشكل ثابت؛ يتم تأكيده قبل الدفع.';
}
function faqForProduct(p,plan){
 const all=[p.activation,p.account,plan.activation,plan.account,(p.deep?.notes||[]).join(' ')].join(' ');
 let password='في الحسابات الجاهزة يُفضّل عدم تغيير البيانات إلا إذا كان العرض يسمح بذلك صراحةً.';
 if(p.name==='Gamma Account')password='نعم — في هذا العرض يتم تغيير كلمة المرور فور الاستلام، مع الاحتفاظ بها لأن نسيانها غير مشمول.';
 else if(/حساب العميل|شخصي|البريد الشخصي/i.test(all))password='الحساب شخصي وتحت سيطرتك؛ يُفضّل عدم تغيير البيانات أثناء تنفيذ التفعيل نفسه.';
 return [
  ['هل أحتاج بطاقة؟',yesNoFact(all,['بطاقة'],['بدون بطاقة','لا يحتاج بطاقة'])],
  ['هل قد أحتاج OTP أو كود؟',yesNoFact(all,['otp','كود'],['بدون كود'])],
  ['هل أقدر أغيّر كلمة المرور؟',password],
  ['كيف أستلم الخدمة؟',plan.activation||p.activation||'يتم تأكيد طريقة التسليم قبل الدفع.'],
  ['ما الضمان؟',plan.warranty||p.warranty||'يتم تأكيد الضمان قبل الدفع.']
 ];
}
function showToast(message){
 toast.textContent=message;toast.classList.add('show');
 setTimeout(()=>toast.classList.remove('show'),1800);
}
function whatsappOrder(p,plan){
 const message=[
  'طلب جديد من MASTER STORE',
  'الخدمة: '+p.name,
  'الخطة: '+plan.name,
  'المدة: '+plan.duration,
  'السعر: '+plan.price,
  'طريقة التفعيل: '+plan.activation,
  'أرغب بتأكيد التوفر وبدء الطلب.'
 ].join('\n');
 window.open('https://wa.me/201500950624?text='+encodeURIComponent(message),'_blank','noopener');
}

const params=new URLSearchParams(location.search);
const requested=params.get('product');
const p=products.find(x=>x.name===requested);

if(!p){
 document.title='الخدمة غير موجودة | MASTER STORE';
 page.innerHTML=`<section class="product-not-found"><h1>الخدمة غير موجودة</h1><p>الرابط غير صحيح أو تم تغيير اسم الخدمة.</p><a class="primary" href="index.html#products">العودة لكل الخدمات</a></section>`;
}else{
 document.title=p.name+' | MASTER STORE';
 const deep=p.deep||{};
 const features=(deep.features&&deep.features.length?deep.features:p.benefits)||[];
 const best=deep.best||[];
 const notes=[...(deep.notes||[]),...(p.terms||[])];
 const plans=p.plans.length?p.plans:[resolveProductPlan(p)];
 let chosen=resolveProductPlan(p,plans[0]);

 function renderPlanDetails(plan){
   return `
    <div class="product-facts">
      <div><small>المدة</small><b>${plan.duration}</b></div>
      <div><small>السعر</small><b class="blue-text">${plan.price}</b></div>
      <div><small>الرصيد / Credits</small><b>${plan.credits}</b></div>
      <div><small>طريقة التفعيل</small><b>${plan.activation}</b></div>
      <div><small>نوع الحساب</small><b>${plan.account}</b></div>
      <div><small>الضمان</small><b>${plan.warranty}</b></div>
    </div>
    <section class="product-section">
      <h2>طريقة الاستلام خطوة بخطوة</h2>
      <ol class="journey-list">${activationJourney(p,plan).map((x,i)=>`<li><span>${i+1}</span><p>${x}</p></li>`).join('')}</ol>
    </section>
    <div class="product-two-col">
      <section class="product-section compact-section">
        <h2>الحساب والأمان</h2>
        <ul class="detail-list">${accountSafety(p,plan).map(x=>`<li>${x}</li>`).join('')}</ul>
      </section>
      <section class="product-section compact-section">
        <h2>الضمان والدعم</h2>
        <ul class="detail-list">${warrantyText(p,plan).map(x=>`<li>${x}</li>`).join('')}</ul>
      </section>
    </div>
    <section class="product-section">
      <h2>أسئلة شائعة عن الاشتراك</h2>
      <div class="faq-list">${faqForProduct(p,plan).map(x=>`<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('')}</div>
    </section>
   `;
 }

 const planOptions=p.plans.length>1?`
   <label class="product-plan-select"><span>اختر الخطة</span>
    <select id="productPlanSelect">${p.plans.map((x,i)=>`<option value="${i}">${x.name} — ${x.price}</option>`).join('')}</select>
   </label>`: '';

 const comparison=p.plans.length>1?`
   <section class="product-section">
    <h2>مقارنة الخطط</h2>
    <div class="plan-table-wrap"><table class="plan-table"><thead><tr><th>الخطة</th><th>المدة</th><th>السعر</th><th>الرصيد</th></tr></thead><tbody>
     ${p.plans.map(x=>{const q=resolveProductPlan(p,x);return `<tr><td>${x.name}</td><td>${q.duration}</td><td>${q.price}</td><td>${q.credits}</td></tr>`}).join('')}
    </tbody></table></div>
   </section>`: '';

 page.innerHTML=`
  <nav class="breadcrumbs"><a href="index.html">الرئيسية</a><span>‹</span><a href="index.html#products">الخدمات</a><span>‹</span><b>${p.name}</b></nav>

  <section class="product-hero-page">
   <div class="product-main-info">
    <div class="product-title-row">${productLogo(p)}<div><span class="eyebrow">${p.category}</span><h1>${p.name}</h1><span class="badge ${p.status!=='متاح'?'soon':''}">${p.status}</span></div></div>
    <p class="product-lead">${p.description}</p>
    ${planOptions}
   </div>
   <aside class="product-buy-box">
    <small>السعر الحالي</small>
    <strong id="sidePrice">${chosen.price}</strong>
    <span id="sideDuration">${chosen.duration}</span>
    <button id="orderNow" ${p.status!=='متاح'?'disabled':''}>${p.status==='متاح'?'اطلب الآن':'غير متاح حاليًا'}</button>
    <a href="index.html#products">شوف خدمات تانية</a>
   </aside>
  </section>

  <section class="product-section">
   <h2>ماذا ستحصل عليه؟</h2>
   <ul class="feature-grid product-feature-grid">${features.map(x=>`<li>${x}</li>`).join('')}</ul>
   ${best.length?`<div class="best-for"><b>مناسب لـ</b><div class="best-tags">${best.map(x=>`<span>${x}</span>`).join('')}</div></div>`:''}
  </section>

  <div id="planDetails">${renderPlanDetails(chosen)}</div>
  ${comparison}

  ${notes.length?`<section class="product-section important-box"><h2>ملاحظات مهمة قبل الدفع</h2><ul class="detail-list terms-list">${notes.map(x=>`<li>${x}</li>`).join('')}</ul></section>`:''}

  <section class="final-cta">
   <div><small>جاهز تطلب؟</small><h2>${p.name}</h2><p>راجع الخطة المختارة والسعر ثم ابعت الطلب للمتجر.</p></div>
   <button id="bottomOrder" ${p.status!=='متاح'?'disabled':''}>${p.status==='متاح'?'اطلب الآن':'غير متاح'}</button>
  </section>
 `;

 const select=document.querySelector('#productPlanSelect');
 const planDetails=document.querySelector('#planDetails');
 const sidePrice=document.querySelector('#sidePrice');
 const sideDuration=document.querySelector('#sideDuration');
 function updatePlan(){
   if(select)chosen=resolveProductPlan(p,p.plans[+select.value]);
   sidePrice.textContent=chosen.price;
   sideDuration.textContent=chosen.duration;
   planDetails.innerHTML=renderPlanDetails(chosen);
 }
 if(select)select.addEventListener('change',updatePlan);
 document.querySelector('#orderNow')?.addEventListener('click',()=>whatsappOrder(p,chosen));
 document.querySelector('#bottomOrder')?.addEventListener('click',()=>whatsappOrder(p,chosen));
}
