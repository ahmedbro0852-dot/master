const page=document.querySelector('#productPage');
const toast=document.querySelector('#toast');
const purchaseDialog=document.querySelector('#purchaseDialog');
const purchaseContent=document.querySelector('#purchaseContent');

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
function showToast(message){
 toast.textContent=message;toast.classList.add('show');
 setTimeout(()=>toast.classList.remove('show'),1800);
}
function uniq(items){return [...new Set(items.filter(Boolean))]}

function longDescription(p,plan){
 if(p.status!=='متاح') return p.description+' سيتم عرض السعر وطريقة التسليم والضمان عند عودة الخدمة للمخزون.';
 const deep=p.deep||{};
 const f=(deep.features||[]).slice(0,2);
 const parts=[
  `${p.name} متاح حاليًا في MASTER STORE ضمن عرض مدته ${plan.duration} بسعر ${plan.price}.`,
  f.length?`الخدمة مناسبة لمن يحتاج ${f.join('، ')}.`:'',
  `طريقة الاستلام: ${plan.activation}.`,
  `نوع الحساب: ${plan.account}، والضمان: ${plan.warranty}.`,
  plan.credits&&plan.credits!=='غير محدد'?`الرصيد أو حدود العرض المذكورة: ${plan.credits}.`:'',
  'أي ميزة أو رصيد غير مذكور صراحةً في هذه الصفحة لا يُعتبر جزءًا مضمونًا من العرض.'
 ];
 return parts.filter(Boolean).join(' ');
}

function packageGuide(p,plan){
 const deep=p.deep||{};
 const text=[p.name,p.description,p.activation,p.account,plan.activation,plan.account,plan.credits,...(deep.notes||[])].join(' ').toLowerCase();
 const included=uniq([
  `مدة الاشتراك: ${plan.duration}`,
  `طريقة التسليم/التفعيل: ${plan.activation}`,
  `نوع الحساب: ${plan.account}`,
  plan.credits&&plan.credits!=='غير محدد'?`الرصيد أو الـ Credits المذكورة في الخطة: ${plan.credits}`:'',
  `الضمان: ${plan.warranty}`,
  ...(deep.features||[]).slice(0,4)
 ]);

 const excluded=[
  'أي Credits أو مساحة أو أجهزة أو Seats إضافية غير مذكورة صراحةً في العرض.',
  'التجديد بعد انتهاء المدة؛ أي تجديد يُعد طلبًا جديدًا بسعره وقتها.',
  'المشكلات الناتجة عن مخالفة تعليمات الحساب أو سياسات مقدم الخدمة.'
 ];
 if(text.includes('حساب جاهز')||text.includes('جاهز')) excluded.push('تغيير بيانات الحساب الجاهز أو نقله لطرف آخر ما لم تسمح تفاصيل العرض بذلك صراحةً.');
 if(text.includes('مشترك')) excluded.push('الملكية الحصرية للحساب أو ضمان عدم استخدامه من مستخدمين آخرين.');
 if(p.name==='Freepik') excluded.push('تسليم حساب Freepik نفسه؛ العرض عبارة عن خدمة تحميل ملفات فقط.');
 if(p.name==='Turnitin') excluded.push('تعديل الملف أو ضمان نسبة تشابه/نتيجة أكاديمية محددة.');
 if(p.name==='CapCut Pro' && String(plan.name).includes('7 أيام')) excluded.push('Credits غير مضمونة في خطة 7 أيام.');
 if(p.name==='Coursera Plus' && String(plan.name).includes('مشتركة')) excluded.push('ضمان شهادة باسم العميل في كل دورة داخل الحساب المشترك.');
 if(p.name==='Stealth Writer') excluded.push('ضمان تجاوز جميع أدوات كشف المحتوى أو الوصول إلى نتيجة 100%.');

 const instructions=uniq([
  'راجع اسم الخطة والمدة والسعر قبل الدفع.',
  text.includes('شخصي')||text.includes('حساب العميل')?'استخدم البريد أو الحساب الشخصي الصحيح الذي تريد التفعيل عليه.':'',
  text.includes('otp')||text.includes('كود')?'قد تحتاج كود OTP/دخول أثناء التفعيل؛ استخدمه فقط في خطوة التفعيل المطلوبة.':'',
  text.includes('بطاقة')?'الخطة قد تتطلب وجود بطاقة أثناء التفعيل كما هو موضح في العرض.':'',
  text.includes('جاهز')?'افحص الحساب فور الاستلام وتأكد من المدة والرصيد قبل إجراء أي تعديل على البيانات.':'',
  p.name==='Gamma Account'?'في هذا العرض تحديدًا: غيّر كلمة المرور فور الاستلام، ولا تترك أي Workspace بدون إذن.':'',
  p.name==='LinkedIn Premium'?'رابط التفعيل يستخدم مرة واحدة؛ لا تفتحه أو تبدأ التفعيل قبل أن يكون الحساب جاهزًا.':'',
  p.name==='Freepik'?'أرسل روابط الملفات المطلوبة بوضوح؛ الخدمة لا تشمل تسليم حساب.':'',
  p.name==='Turnitin'?'أرسل الملف المطلوب فحصه بالصيغة المتفق عليها، ثم انتظر التقرير.':'',
  'احتفظ بصورة من تفاصيل العرض والطلب للرجوع إليها عند الحاجة.'
 ]);

 const policies=[
  'السعر والتوفر الظاهرين يتم تأكيدهما عند بدء الطلب.',
  'يبدأ تنفيذ الاشتراك بعد تأكيد الدفع، ومدة التنفيذ حسب نوع الخدمة.',
  `الضمان المطبق على هذه الخطة هو: ${plan.warranty}.`,
  'الضمان يغطي مشكلة من جهة التفعيل/الحساب حسب شروط العرض، ولا يغطي عادةً سوء الاستخدام أو تغييرات غير مصرح بها.',
  'إذا تعذر إصلاح مشكلة مشمولة بالضمان أو توفير بديل مناسب، تتم معالجة الاسترداد وفق سياسة المتجر.',
  'المزايا والحدود الرسمية للمنصة قد تتغير من مقدم الخدمة؛ MASTER STORE يضمن ما هو مكتوب صراحةً في العرض وقت الشراء.'
 ];

 return {included,excluded:uniq(excluded),instructions,policies};
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

const paymentInfo={
 we1:{name:'WE Pay',value:'01500950624',detail:'01500950624 — أحمد …م…م…'},
 we2:{name:'WE Pay',value:'01505896364',detail:'01505896364 — منصور …ع…ج…'},
 binance:{name:'Binance Pay',value:'1222200704',detail:'Pay ID: 1222200704'}
};

function openPurchaseFlow(p,plan){
 const guide=packageGuide(p,plan);
 purchaseContent.innerHTML=`
  <button class="purchase-close" type="button" aria-label="إغلاق">×</button>
  <div class="purchase-step" id="termsStep">
   <span class="purchase-kicker">تأكيد الطلب</span>
   <h2>أكد طلبك قبل الدفع</h2>
   <div class="purchase-summary"><b>${p.name}</b><span>${plan.name} • ${plan.duration}</span><strong>${plan.price}</strong></div>
   <div class="purchase-policy-list">
    ${guide.policies.map(x=>`<p>• ${x}</p>`).join('')}
   </div>
   <label class="accept-row"><input type="checkbox" class="terms-check"><span>قرأت تفاصيل الخطة وفهمت ما يشمله العرض وما لا يشمله.</span></label>
   <label class="accept-row"><input type="checkbox" class="terms-check"><span>أوافق على سياسة الضمان والاسترداد والتعليمات الخاصة بالحساب.</span></label>
   <label class="accept-row"><input type="checkbox" class="terms-check"><span>أؤكد أن بيانات التفعيل التي سأرسلها صحيحة.</span></label>
   <button class="continue-payment" id="continuePayment" disabled>موافق — متابعة للدفع</button>
  </div>
  <div class="purchase-step hidden" id="paymentStep">
   <span class="purchase-kicker">الدفع</span>
   <h2>اختار طريقة الدفع المناسبة</h2>
   <div class="purchase-summary"><b>${p.name}</b><span>${plan.name} • ${plan.duration}</span><strong>${plan.price}</strong></div>
   <div class="payment-choice-grid">
    ${Object.entries(paymentInfo).map(([key,x],i)=>`<label class="payment-choice-card"><input type="radio" name="purchasePay" value="${key}" ${i===0?'checked':''}><span><b>${x.name}</b><small>${x.detail}</small></span><button type="button" class="copy-pay" data-copy="${x.value}">نسخ</button></label>`).join('')}
   </div>
   <div class="payment-review-note">بعد التحويل، ابعت الطلب للمراجعة. بيتم تأكيد الدفع قبل بدء تنفيذ الاشتراك.</div>
   <button class="payment-finish" id="paymentFinish">تم التحويل — تأكيد طلبي</button>
   <button class="back-terms" id="backTerms" type="button">رجوع للشروط</button>
  </div>`;
 purchaseDialog.showModal();

 const checks=[...purchaseContent.querySelectorAll('.terms-check')];
 const cont=purchaseContent.querySelector('#continuePayment');
 checks.forEach(c=>c.addEventListener('change',()=>{cont.disabled=!checks.every(x=>x.checked)}));
 cont.addEventListener('click',()=>{
   purchaseContent.querySelector('#termsStep').classList.add('hidden');
   purchaseContent.querySelector('#paymentStep').classList.remove('hidden');
 });
 purchaseContent.querySelector('#backTerms').addEventListener('click',()=>{
   purchaseContent.querySelector('#paymentStep').classList.add('hidden');
   purchaseContent.querySelector('#termsStep').classList.remove('hidden');
 });
 purchaseContent.querySelector('.purchase-close').addEventListener('click',()=>purchaseDialog.close());
 purchaseContent.querySelectorAll('.copy-pay').forEach(b=>b.addEventListener('click',async e=>{
   e.preventDefault();
   try{await navigator.clipboard.writeText(b.dataset.copy);showToast('تم نسخ بيانات الدفع')}catch{showToast('تعذر النسخ')}
 }));
 purchaseContent.querySelector('#paymentFinish').addEventListener('click',()=>{
   const method=purchaseContent.querySelector('[name="purchasePay"]:checked')?.value||'we1';
   const pay=paymentInfo[method];
   const message=[
    'طلب جديد من MASTER STORE',
    'الخدمة: '+p.name,
    'الخطة: '+plan.name,
    'المدة: '+plan.duration,
    'السعر: '+plan.price,
    'طريقة الدفع: '+pay.name+' — '+pay.value,
    'أؤكد أنني قرأت ووافقت على شروط العرض.',
    'تم التحويل وأرغب في مراجعة الدفع وبدء التنفيذ.'
   ].join('\n');
   window.open('https://wa.me/201500950624?text='+encodeURIComponent(message),'_blank','noopener');
   purchaseDialog.close();
 });
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
   const guide=packageGuide(p,plan);
   return `
    <div class="product-facts">
      <div><small>المدة</small><b>${plan.duration}</b></div>
      <div><small>السعر</small><b class="blue-text">${plan.price}</b></div>
      <div><small>الرصيد / Credits</small><b>${plan.credits}</b></div>
      <div><small>طريقة التفعيل</small><b>${plan.activation}</b></div>
      <div><small>نوع الحساب</small><b>${plan.account}</b></div>
      <div><small>الضمان</small><b>${plan.warranty}</b></div>
    </div>

    <div class="include-exclude-grid">
      <section class="product-section package-box include-box">
        <h2>يشمل العرض</h2>
        <ul class="package-list">${guide.included.map(x=>`<li>${x}</li>`).join('')}</ul>
      </section>
      <section class="product-section package-box exclude-box">
        <h2>لا يشمل العرض</h2>
        <ul class="package-list exclude-list">${guide.excluded.map(x=>`<li>${x}</li>`).join('')}</ul>
      </section>
    </div>

    <section class="product-section">
      <h2>طريقة الاستلام خطوة بخطوة</h2>
      <ol class="journey-list">${activationJourney(p,plan).map((x,i)=>`<li><span>${i+1}</span><p>${x}</p></li>`).join('')}</ol>
    </section>

    <section class="product-section instruction-box">
      <h2>تعليمات مهمة قبل وبعد التفعيل</h2>
      <ul class="package-list">${guide.instructions.map(x=>`<li>${x}</li>`).join('')}</ul>
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

    <section class="product-section policy-box">
      <h2>سياسات هذا الطلب</h2>
      <ul class="package-list">${guide.policies.map(x=>`<li>${x}</li>`).join('')}</ul>
    </section>

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
    <p class="product-lead" id="productLead">${longDescription(p,chosen)}</p>
    ${planOptions}
   </div>
   <aside class="product-buy-box">
    <small>السعر الحالي</small>
    <strong id="sidePrice">${chosen.price}</strong>
    <span id="sideDuration">${chosen.duration}</span>
    <button id="orderNow" ${p.status!=='متاح'?'disabled':''}>${p.status==='متاح'?'اشترك الآن':'غير متاح حاليًا'}</button>
    <a href="index.html#products">غيّر الاشتراك</a>
   </aside>
  </section>

  <section class="product-section">
   <h2>نبذة عن الباقة</h2>
   <ul class="feature-grid product-feature-grid">${features.map(x=>`<li>${x}</li>`).join('')}</ul>
   ${best.length?`<div class="best-for"><b>مناسبة لـ</b><div class="best-tags">${best.map(x=>`<span>${x}</span>`).join('')}</div></div>`:''}
  </section>

  ${p.official?`
  <section class="product-section official-specs">
    <div class="official-head">
      <div class="official-brand">${productLogo(p)}<div><span class="official-kicker">معلومات من المصدر الرسمي</span><h2>${p.official.officialPlan}</h2><small>آخر مراجعة: ${p.official.verified}</small></div></div>
      <a class="official-source" href="${p.official.source}" target="_blank" rel="noopener">المصدر الرسمي ↗</a>
    </div>
    <div class="official-fact-grid">${p.official.facts.map(x=>`<div><span>✓</span><p>${x}</p></div>`).join('')}</div>
    <p class="official-note"><b>مهم:</b> ${p.official.note}</p>
  </section>`:''}

  <div id="planDetails">${renderPlanDetails(chosen)}</div>
  ${comparison}

  ${notes.length?`<section class="product-section important-box"><h2>ملاحظات خاصة بالخدمة</h2><ul class="detail-list terms-list">${notes.map(x=>`<li>${x}</li>`).join('')}</ul></section>`:''}

  <section class="final-cta">
   <div><small>جاهز تشترك؟</small><h2>${p.name}</h2><p>راجع الباقة، وافق على الشروط، وبعدها كمل الدفع وأرسل طلبك للتنفيذ.</p></div>
   <button id="bottomOrder" ${p.status!=='متاح'?'disabled':''}>${p.status==='متاح'?'اشترك الآن':'غير متاح'}</button>
  </section>
 `;

 const select=document.querySelector('#productPlanSelect');
 const planDetails=document.querySelector('#planDetails');
 const sidePrice=document.querySelector('#sidePrice');
 const sideDuration=document.querySelector('#sideDuration');
 const lead=document.querySelector('#productLead');
 function updatePlan(){
   if(select)chosen=resolveProductPlan(p,p.plans[+select.value]);
   sidePrice.textContent=chosen.price;
   sideDuration.textContent=chosen.duration;
   lead.textContent=longDescription(p,chosen);
   planDetails.innerHTML=renderPlanDetails(chosen);
 }
 if(select)select.addEventListener('change',updatePlan);
 document.querySelector('#orderNow')?.addEventListener('click',()=>openPurchaseFlow(p,chosen));
 document.querySelector('#bottomOrder')?.addEventListener('click',()=>openPurchaseFlow(p,chosen));
}

purchaseDialog?.addEventListener('click',e=>{if(e.target===purchaseDialog)purchaseDialog.close()});
