(async function(){
  'use strict';
  await window.MasterCatalogReady;
  const Catalog=window.MasterCatalog;
  const MasterStore=window.MasterStore;
  if(!Catalog||!MasterStore)return;
  const getProduct=Catalog.getProduct;
  const statusLabel=Catalog.statusLabel;
  const root=document.getElementById('productPage');
  const dialog=document.getElementById('checkoutDialog');
  const checkoutContent=document.getElementById('checkoutContent');
  const toast=document.getElementById('toast');
  const params=new URLSearchParams(location.search);
  if(!params.has('id')&&document.body.dataset.productId)params.set('id',document.body.dataset.productId);
  if(params.get('id')==='manus-pro'){location.replace('product.html?id=manus&plan=2');return;}
  const redirectProduct=getProduct(params.get('id'));
  const redirect=redirectProduct?.redirectByPlan?.[params.get('plan')||'0']||redirectProduct?.redirectTo;
  if(redirect){params.set('id',redirect.id);params.set('plan',String(redirect.plan));location.replace('product.html?'+params.toString());return;}
  const p=getProduct(params.get('id'));
  const Locale=window.MasterLocale;
  const isEn=()=>Locale?.getState().language==='en';
  const ui=(ar,en)=>isEn()?en:ar;
  const tr=(value,kind)=>Locale?.catalogText(value,kind,p?.id) ?? String(value??'');

  function showToast(text){
    toast.textContent=text;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),1800);
  }

  function icon(product){
    if(product.id==='gemini-coursera-bundle')return '<span class="bundle-brand-group"><span class="product-logo big bundle-main-logo"><img src="logos/coursera.svg" alt="Coursera Plus"></span><span class="bundle-gift-logos">'+['gemini','canva'].map(name=>'<span class="bundle-gift-logo"><img src="logos/'+name+'.svg" alt="'+(name==='gemini'?'Gemini':'Canva Pro')+'"><small>'+ui('مجانًا','FREE')+'</small></span>').join('')+'</span></span>';
    const fallback=(product.name||'M').split(/\s+/).map(x=>x[0]).join('').slice(0,2);
    const local=product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg?v=20261027-hq1':'';
    const src=product.logoUrl||local;
    const fallbackAttr=local?' data-fallback="'+MasterStore.escapeHtml(local)+'"':'';
    return '<span class="product-logo big">'+(src?'<img src="'+MasterStore.escapeHtml(src)+'"'+fallbackAttr+' alt="'+MasterStore.escapeHtml(product.name)+'" decoding="async">':'')+'<span class="logo-fallback">'+MasterStore.escapeHtml(fallback)+'</span></span>';
  }

  function bindProductLogoFallback(){
    const img=root.querySelector('.product-logo.big img');
    if(!img)return;
    const recoverLogo=()=>{
      const fallback=img.dataset.fallback;
      if(fallback&&!img.dataset.usedFallback&&img.src!==new URL(fallback,location.href).href){
        img.dataset.usedFallback='1';
        img.src=fallback;
        return;
      }
      img.hidden=true;
      img.nextElementSibling?.classList.add('visible');
    };
    img.addEventListener('error',recoverLogo);
    if(img.complete&&img.naturalWidth===0)recoverLogo();
  }

  if(!p){
    root.innerHTML='<section class="not-found"><h1>'+ui('المنتج غير موجود','Product not found')+'</h1><p>'+ui('ارجع للمتجر واختار خدمة متاحة.','Return to the store and choose an available service.')+'</p><a class="primary" href="index.html#products">'+ui('العودة للمنتجات','Back to products')+'</a></section>';
    return;
  }

  function setMeta(selector,value){
    const el=document.querySelector(selector);
    if(el&&value)el.setAttribute('content',value);
  }

  function updateProductMetadata(){
    const description=window.MasterSEO?.productDescription(p,isEn())||tr(p.description||'','description')||p.name;
    document.title=isEn()?(Locale?.text(p.name)||p.name)+' plans | MASTER STORE':(window.MasterSEO?.productTitle(p)||p.name+' | MASTER STORE');
    setMeta('meta[name="description"]',description);
    setMeta('meta[property="og:title"]',document.title);
    setMeta('meta[property="og:description"]',description);
  }

  updateProductMetadata();
  window.MasterShopping?.view(p.id);

  const active=p.status==='available';
  const plans=p.plans||[];
  const requestedPlan=Number(params.get('plan'));
  const initialPlan=Number.isInteger(requestedPlan)&&requestedPlan>=0&&requestedPlan<plans.length&&plans[requestedPlan].available!==false&&!plans[requestedPlan].hidden?requestedPlan:Math.max(0,plans.findIndex(x=>x.available!==false&&!x.hidden));

  root.innerHTML=
    '<section class="product-hero '+(p.id==='gemini-coursera-bundle'?'bundle-hero':'')+'">'+
      '<a class="back-link" href="index.html#products">'+ui('← كل المنتجات','← All products')+'</a>'+
      '<div class="product-title">'+icon(p)+'<div><span class="eyebrow">'+MasterStore.escapeHtml(tr(p.category,'category'))+'</span><h1 dir="auto">'+MasterStore.escapeHtml(p.name)+'</h1><p>'+MasterStore.escapeHtml(tr(p.description||'','description'))+'</p></div></div>'+
      '<span class="status '+(p.status==='available'?'ok':p.status==='soon'?'soon':'out')+'">'+tr(statusLabel(p.status),'status')+'</span>'+
    '</section>'+
    '<section class="product-layout '+(p.id==='gemini-coursera-bundle'?'bundle-layout':'')+'">'+
      '<div class="plans-block"><h2>'+ui('اختار الباقة','Choose a plan')+'</h2>'+
        (plans.length?plans.map((plan,i)=>plan.hidden?'':
          '<label class="plan-option">'+
            '<input type="radio" name="plan" value="'+i+'" '+(i===initialPlan?'checked':'')+' '+(!active||plan.available===false?'disabled':'')+'>'+
            '<span><b>'+MasterStore.escapeHtml(tr(plan.name||plan.duration,'planName'))+'</b><small>'+MasterStore.escapeHtml(tr(planTier(p,plan),'planName'))+' · '+MasterStore.escapeHtml(tr(plan.duration||'','duration'))+' · '+MasterStore.escapeHtml(tr(subscriptionType(plan),'accountType'))+'</small>'+planSavingMarkup(plan)+'</span>'+
            planPriceMarkup(plan)+
          '</label>'
        ).join(''):'<div class="notice">'+ui('الخدمة غير متاحة للطلب حاليًا.','This service is currently unavailable for ordering.')+'</div>')+
        '<div id="planFeatures"></div>'+
      '</div>'+
      '<aside class="summary-card">'+
        '<h2>'+ui('تفاصيل الباقة','Plan details')+'</h2>'+
        '<div id="planDetails"></div>'+
        (active?'<button id="buyBtn" class="primary full" type="button">'+ui('شراء الآن','Buy now')+'</button>':'<button class="primary full disabled" disabled>'+ui('غير متاح حاليًا','Currently unavailable')+'</button>')+
        '<p class="safe-note">'+ui('بعد إرسال الطلب، فريق الدعم هيتواصل معاك لتأكيد التوفر وبيانات الدفع.','After you send the order, support will confirm availability and payment details.')+'</p>'+
      '</aside>'+
    '</section>';

  root.querySelector('.product-hero').insertAdjacentHTML('beforeend',window.MasterShopping?.button(p)||'');
  const selectedLink=document.createElement('button');selectedLink.type='button';selectedLink.className='selected-plan-link';root.querySelector('.summary-card').prepend(selectedLink);
  selectedLink.addEventListener('click',()=>{const radio=root.querySelector('input[name=plan]:checked');if(radio){radio.closest('.plan-option').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});radio.focus({preventScroll:true});}});

  const planActions=document.createElement('div');planActions.className='plan-tools';
  planActions.innerHTML='<div class="plan-tool-buttons"><button type="button" data-copy-plan></button><button type="button" data-ask-plan></button></div><p class="plan-tool-status" role="status" aria-live="polite"></p><input class="plan-share-url" type="text" readonly hidden>';
  selectedLink.insertAdjacentElement('afterend',planActions);
  const copyPlan=planActions.querySelector('[data-copy-plan]'),askPlan=planActions.querySelector('[data-ask-plan]'),shareStatus=planActions.querySelector('.plan-tool-status'),shareInput=planActions.querySelector('input');
  const planUrl=()=>{const url=new URL('/products/'+encodeURIComponent(p.id)+'.html',location.origin);url.searchParams.set('plan',String(plans.indexOf(selectedPlan())));return url.href;};
  copyPlan.addEventListener('click',async()=>{const url=planUrl();try{if(!navigator.clipboard?.writeText)throw Error('clipboard');await navigator.clipboard.writeText(url);shareInput.hidden=true;shareStatus.textContent=ui('تم نسخ رابط الباقة المختارة ✓','Selected plan link copied ✓');}catch{shareInput.value=url;shareInput.hidden=false;shareInput.focus();shareInput.select();shareStatus.textContent=ui('انسخ الرابط من الخانة دي.','Copy the link from this field.');}});
  askPlan.addEventListener('click',()=>{const plan=selectedPlan();if(!plan)return;document.dispatchEvent(new CustomEvent('masterstore:ask-plan',{detail:{question:ui('اشرح لي مميزات وطريقة تفعيل وضمان باقة ','Explain the features, activation and warranty of ')+tr(plan.name||plan.duration,'planName')+ui(' من ',' from ')+p.name,trigger:askPlan}}));});

  function refreshWindowsGuide(){
    const guide=window.MasterWindowsGuide;
    if(!guide?.match(p))return;
    const block=root.querySelector('.plans-block');if(block)block.id='windows-plans';
    const previous=root.querySelector('#windows-guide-root');
    const opened=previous?[...previous.querySelectorAll('details[open]')].map(x=>x.id):[];
    const oldNav=root.querySelector('#windows-guide-nav');
    if(oldNav)oldNav.outerHTML=guide.nav(isEn());
    else root.querySelector('.product-hero').insertAdjacentHTML('afterend',guide.nav(isEn()));
    if(previous)previous.innerHTML=guide.render(isEn());
    else root.insertAdjacentHTML('beforeend','<div id="windows-guide-root">'+guide.render(isEn())+'</div>');
    for(const id of opened){const detail=document.getElementById(id);if(detail)detail.open=true;}
  }
  refreshWindowsGuide();

  if(active&&plans.length){
    const bar=document.createElement('div');
    bar.className='mobile-order-bar';
    bar.innerHTML='<div><button type="button" class="mobile-plan-jump"><small>'+ui('الباقة المختارة','Selected plan')+'</small></button><strong id="mobilePlanPrice"></strong></div><button class="primary" id="mobileBuyBtn" type="button">'+ui('شراء الآن','Buy now')+'</button>';
    root.appendChild(bar);
    bar.querySelector('.mobile-plan-jump').addEventListener('click',()=>selectedLink.click());
    document.getElementById('mobileBuyBtn').addEventListener('click',()=>document.getElementById('buyBtn')?.click());
  }

  bindProductLogoFallback();

  const planDetails=document.getElementById('planDetails');
  const planFeatures=document.getElementById('planFeatures');
  const radios=[...document.querySelectorAll('input[name="plan"]')];

  function previousStorePriceMarkup(plan){return MasterStore.previousPriceMarkup(plan);}
  function planPriceMarkup(plan){return plan.available===false?'<strong>'+ui('غير متاح','Unavailable')+'</strong>':MasterStore.priceMarkup(plan);}

  function planSavingMarkup(plan){
    if(MasterStore.previousPrice(plan)){
      const {saving}=MasterStore.previousPrice(plan);
      if(saving>0)return '<small class="plan-saving">'+ui('توفير ','Save ')+MasterStore.formatCurrency(saving,MasterStore.getMarket().currency)+ui(' مقارنة بسعر المتجر السابق',' vs previous store price')+'</small>';
    }
    const discount=MasterStore.officialDiscount(plan);
    if(discount&&discount.percent>0)return '<small class="plan-saving">'+ui(discount.estimated?'توفير تقديري ':'توفير ',discount.estimated?'Estimated saving ':'Save ')+discount.percent+'% · '+MasterStore.formatCurrency(discount.saving,MasterStore.getMarket().currency)+'</small>';
    if(!plan?.oldPrice)return '';
    const saving=MasterStore.planAmount(plan,'oldPrice')-MasterStore.planAmount(plan);
    return saving>0?'<small class="plan-saving">'+ui('توفير ','Save ')+Math.round(saving/MasterStore.planAmount(plan,'oldPrice')*100)+'% · '+MasterStore.formatCurrency(saving,MasterStore.getMarket().currency)+ui(' مقارنة بسعر المتجر السابق',' vs previous store price')+'</small>':'';
  }

  function discountDetail(plan){
    if(!plan.officialPrice&&Number(plan.oldPrice)>Number(plan.price)){
      const previous=MasterStore.planAmount(plan,'oldPrice'),current=MasterStore.planAmount(plan),saved=previous-current;
      return '<div><dt>'+ui('التوفير مقارنة بسعر المتجر السابق','Saving vs previous store price')+'</dt><dd><strong class="saving">'+Math.round(saved/previous*100)+'% · '+MasterStore.formatCurrency(saved,MasterStore.getMarket().currency)+'</strong></dd></div>';
    }
    const discount=MasterStore.officialDiscount(plan);
    const label=plan.priceComparison?.savingLabel?MasterStore.escapeHtml(ui(plan.priceComparison.savingLabel,plan.priceComparison.savingLabelEn||plan.priceComparison.savingLabel)):plan.priceComparison?.referenceLabel?ui('التوفير مقارنة بـPlus المستقل','Saving vs standalone Plus'):ui(discount?.estimated?'نسبة التوفير التقديرية':'نسبة التوفير عن الرسمي',discount?.estimated?'Estimated saving':'Saving vs official price');
    const value=discount?(discount.percent>0?'<strong class="saving">'+discount.percent+'%</strong>':ui('لا يوجد توفير بالسعر الحالي','No saving at the current price')):ui('غير متاحة — لا يوجد سعر رسمي مطابق موثق','Unavailable — no verified matching official price');
    const ref=plan.officialPrice;
    const source=ref?.source||plan.priceComparison?.source;
    const sourceLink=source&&/^https:\/\//.test(source)?'<a class="official-price-source" href="'+MasterStore.escapeHtml(source)+'" target="_blank" rel="noopener noreferrer">'+ui('مرجع السعر الرسمي','Official price reference')+'</a>':'';
    const referenceNote=plan.priceComparison?.noteEn&&isEn()?plan.priceComparison.noteEn:plan.priceComparison?.note;
    const note=(plan.hideOfficialPrice||plan.priceComparison?.showReferenceNote)&&referenceNote?'<small>'+MasterStore.escapeHtml(referenceNote)+'</small>':ref?.estimated?'<small>'+ui('تقدير محسوب من السعر الشهري وخصم الفوترة السنوية المعلن.','Calculated from the monthly rate and advertised annual discount.')+'</small>':'';
    return '<div><dt>'+label+'</dt><dd>'+value+note+sourceLink+'</dd></div>';
  }

  function selectedPlan(){
    const r=radios.find(x=>x.checked);
    return plans[Number(r?.value||0)]||null;
  }

  function planTier(product,plan){
    const explicit=(plan.planType||'').trim();
    if(explicit)return explicit;
    const source=((plan.name||'')+' '+(product.name||'')).trim();
    const tiers=['Pro Lite','Premium','Professional','Business','Essentials','Enterprise','Team','Scale','Hobby','Starter','Plus','Pro','Basic'];
    const found=tiers.find(t=>source.toLowerCase().includes(t.toLowerCase()));
    if(found)return found;
    if(/عائلي|family/i.test(source))return 'Family';
    if(/مشترك|shared/i.test(source))return 'Shared';
    if(/خاص|private/i.test(source))return 'Private';
    const cleaned=(plan.name||'')
      .replace(/\d+\s*(?:أيام?|يوم|شهور?|شهر|سنوات?|سنة)/g,'')
      .replace(/[—-]+/g,' ')
      .trim();
    return cleaned || 'Standard';
  }

  function subscriptionType(plan){
    const explicit=(plan.accountType||'').trim();
    if(explicit)return explicit;
    const account=(plan.account||'').trim();
    const activation=(plan.activation||'').trim();
    const source=account+' '+activation;
    if(/مشترك/i.test(source))return 'مشترك';
    if(/عائلي|مشاركة عائلية|دعوات عائلية/i.test(source))return 'عائلي';
    if(/بدون حساب|خدمة ملف|ملف واحد/i.test(source))return 'خدمة بدون حساب';
    if(/حساب العميل|الشخصي|حساب شخصي|بريد العميل|بريدك|البريد الشخصي/i.test(source))return 'على حسابك الشخصي';
    if(/حساب خاص/i.test(source))return 'حساب خاص';
    if(/حساب جاهز|بيانات دخول|إيميل وكلمة مرور|احتفظ بالبيانات|احتفظ بإعدادات/i.test(source))return 'حساب جاهز';
    if(/دعوة/i.test(source))return 'دعوة للحساب/الفريق';
    if(/حسب المتوفر|حسب العرض/i.test(source))return 'يُحدد حسب المتوفر';
    return account || 'يُحدد قبل الدفع';
  }

  function subscriptionFeatures(product,plan){
    return window.MasterProductFeatures.list(product,plan,isEn(),tr);
  }


  const openedGifts=new Map();
  let giftAudio=null;
  function playGiftChime(){
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      giftAudio=giftAudio||new Audio();
      if(giftAudio.state==='suspended')giftAudio.resume().catch(()=>{});
      const now=giftAudio.currentTime;
      [523.25,659.25,783.99,1046.5].forEach((frequency,i)=>{
        const oscillator=giftAudio.createOscillator(),volume=giftAudio.createGain(),start=now+i*.085;
        oscillator.type='sine';oscillator.frequency.value=frequency;
        volume.gain.setValueAtTime(0,start);volume.gain.linearRampToValueAtTime(.055,start+.02);volume.gain.exponentialRampToValueAtTime(.001,start+.45);
        oscillator.connect(volume);volume.connect(giftAudio.destination);oscillator.start(start);oscillator.stop(start+.48);oscillator.onended=()=>{oscillator.disconnect();volume.disconnect();};
      });
    }catch{/* The gift still opens if sound is unavailable. */}
  }
  function premiumGifts(plan){
    if(p.status!=='available'||plan.available===false||(!plan.gifts?.length&&!(Number(plan.price)>=2000)))return '';
    const state=openedGifts.get(plans.indexOf(plan))||new Set();
    const gifts=plan.gifts?.length?plan.gifts.map(gift=>({...gift,duration:ui(gift.duration,gift.durationEn||gift.duration)})):[{id:'google',logo:'gemini',name:'Google AI Pro',duration:ui('١٨ شهر','18 months')},{id:'canva',logo:'canva',name:'Canva Pro',duration:ui('٣ سنين','3 years')}];
    return '<section class="premium-gifts gift-duo" aria-label="'+ui('هدايا الباقة','Plan gifts')+'"><div class="gift-duo-heading"><div><small>'+ui('مجانًا مع اشتراكك','Included free')+'</small><h3>'+ui('هدايا خاصة مع الباقة','Gifts included with your plan')+'</h3></div></div><p class="gift-duo-intro">'+ui('افتح الصندوقين واكتشف هدايا اشتراكك.','Unwrap both boxes to discover your gifts.')+'</p><div class="gift-duo-grid">'+gifts.map((gift,i)=>{
      const open=state.has(gift.id);
      return '<div class="gift-present '+(open?'is-unwrapped':'')+'"><button type="button" class="present-trigger" data-gift="'+gift.id+'" aria-expanded="'+open+'" aria-controls="gift-'+gift.id+'" aria-label="'+ui((open?'إغلاق':'فتح')+' الهدية '+(i+1),(open?'Close':'Open')+' gift '+(i+1))+'"><span class="present-number" aria-hidden="true">'+(i+1)+'</span><span class="present-stage" aria-hidden="true"><span class="present-halo"></span><span class="present-body"></span><span class="present-lid"><span class="present-bow left"></span><span class="present-bow right"></span></span><span class="present-prize"><img src="logos/'+gift.logo+'.svg" alt="" width="44" height="44"></span><span class="present-star star-a">✦</span><span class="present-star star-b">✧</span><span class="present-star star-c">✦</span></span><span class="present-caption">'+ui('الهدية '+(i+1),'Gift '+(i+1))+'</span><span class="present-action">'+ui(open?'هديتك جاهزة':'افتح هديتك',open?'Your gift is ready':'Unwrap your gift')+'</span></button><div class="present-reveal" id="gift-'+gift.id+'" '+(open?'':'inert')+'><div class="present-reveal-inner"><strong>'+gift.name+'</strong><span>'+gift.duration+'</span><small>'+ui('مجانًا','FREE')+'</small></div></div></div>';
    }).join('')+'</div><p class="gift-duo-note">'+ui('الهديتان مشمولتان بدون تكلفة إضافية.','Both gifts included at no extra charge.')+'</p></section>';
  }

  function renderDetails(){
    const plan=selectedPlan();
    shareStatus.textContent='';shareInput.hidden=true;
    planActions.hidden=!plan;copyPlan.textContent=ui('نسخ رابط الباقة','Copy plan link');askPlan.textContent=ui('اسأل المساعد عن الباقة','Ask about this plan');shareInput.setAttribute('aria-label',ui('رابط الباقة المختارة','Selected plan link'));
    selectedLink.hidden=!plan;if(plan)selectedLink.textContent=ui('عرض الباقة المختارة: ','View selected plan: ')+tr(plan.name||plan.duration,'planName');
    if(!plan){planDetails.innerHTML='';planFeatures.innerHTML=window.MasterProductGuides?MasterProductGuides.render(p.id,isEn(),location.pathname+location.search,{product:p,catalog:MasterCatalog.products,translate:tr,featuresFor:plan=>subscriptionFeatures(p,plan)}):'';return;}
    const buy=document.getElementById('buyBtn');if(buy)buy.disabled=plan.available===false;
    const mobilePrice=document.getElementById('mobilePlanPrice');
    if(mobilePrice)mobilePrice.textContent=MasterStore.planMoney(plan);
    const mobileBuy=document.getElementById('mobileBuyBtn');
    if(mobileBuy)mobileBuy.textContent=ui('شراء الآن','Buy now');
    const mobileLabel=root.querySelector('.mobile-order-bar small');
    if(mobileLabel)mobileLabel.textContent=ui('عرض الباقة المختارة ↗','View selected plan ↗');
    const notes=[...(p.notes||[]),...(plan.notes||[])];
    const features=subscriptionFeatures(p,plan);
    const comparableOfficial=!!plan.officialPrice&&plan.priceComparison?.status!=='unavailable';
    const showBefore=(!plan.officialPrice&&plan.oldPrice)||comparableOfficial;
    const saving=Math.max(0,showBefore?MasterStore.planAmount(plan,'oldPrice')-MasterStore.planAmount(plan):0);
    planDetails.innerHTML=
      (plan.promotionEndsAt&&Date.now()<Date.parse(plan.promotionEndsAt)?'<div class="notice" role="note">'+ui('⏳ عرض 48 ساعة: 430ج بدل 450ج · حتى 28 أكتوبر 2026، الساعة 8:15 صباحًا بتوقيت مصر. الاشتراك سنة كاملة: 300 كريدت إجماليًا + 5 يوميًا.','⏳ 48-hour offer: EGP 430 instead of 450 · Ends 28 October 2026 at 8:15 AM Egypt time. One-year subscription: 300 total credits plus 5 daily.')+'</div>':'')+
      (p.id==='elevenlabs'&&plan.offerEndsAt?'<div class="notice" role="note">'+ui('⏰ عرض مؤقت: مهلة الحجز 24 ساعة فقط. مدة الاشتراك شهر كامل.','⏰ Limited-time offer: book within 24 hours. Subscription lasts one full month.')+'</div>':'')+
      '<dl class="details-list">'+
        '<div><dt>'+ui('السعر','Price')+'</dt><dd>'+MasterStore.planMoney(plan)+previousStorePriceMarkup(plan)+'</dd></div>'+
        ((!plan.hideOfficialPrice&&showBefore)?'<div><dt>'+(comparableOfficial?(plan.priceComparison?.priceLabel?MasterStore.escapeHtml(ui(plan.priceComparison.priceLabel,plan.priceComparison.priceLabelEn||plan.priceComparison.priceLabel)):(plan.priceComparison?.referenceLabel?ui('سعر Plus المستقل للمقارنة','Standalone Plus reference price'):ui('السعر الرسمي','Official price'))):ui('السعر قبل العرض','Before discount'))+'</dt><dd>'+(saving?'<del>'+MasterStore.planMoney(plan,'oldPrice')+'</del>':MasterStore.planMoney(plan,'oldPrice'))+(saving?' <strong class="saving">'+(plan.officialPrice?ui('توفير','Save'):ui('وفر','Save'))+' '+MasterStore.formatCurrency(saving,MasterStore.getMarket().currency)+'</strong>':'')+'</dd></div>':'')+
        discountDetail(plan)+
        '<div><dt>'+ui('نوع الباقة','Plan tier')+'</dt><dd>'+MasterStore.escapeHtml(tr(planTier(p,plan),'planName'))+'</dd></div>'+
        '<div><dt>'+ui('المدة','Duration')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.duration||'غير محددة','duration'))+'</dd></div>'+
        '<div><dt>'+ui('نوع الاشتراك','Subscription type')+'</dt><dd>'+MasterStore.escapeHtml(tr(subscriptionType(plan),'accountType'))+'</dd></div>'+
        '<div><dt>'+ui('طريقة الحساب','Account method')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.account||'يُؤكد قبل الدفع','account'))+'</dd></div>'+
        '<div><dt>'+ui('التفعيل','Activation')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.activation||'يُؤكد قبل الدفع','activation'))+'</dd></div>'+
        '<div><dt>'+ui('الضمان','Warranty')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.warranty||'غير محدد','warranty'))+'</dd></div>'+
        (plan.credits?'<div><dt>'+ui('الرصيد','Credits')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.credits,'credits'))+'</dd></div>':'')+
      '</dl>'+
      (notes.length?'<div class="plan-notes"><b>'+ui('ملاحظات مهمة','Important notes')+'</b><ul>'+notes.map(n=>'<li>'+MasterStore.escapeHtml(tr(n,'note'))+'</li>').join('')+'</ul></div>':'');
    planDetails.insertAdjacentHTML('beforeend',premiumGifts(plan));
    planDetails.querySelectorAll('.present-trigger').forEach(button=>button.addEventListener('click',()=>{
      const present=button.closest('.gift-present'),open=present.classList.toggle('is-unwrapped'),id=button.dataset.gift;
      button.setAttribute('aria-expanded',String(open));
      button.setAttribute('aria-label',ui((open?'إغلاق':'فتح')+' الهدية '+(id==='google'?1:2),(open?'Close':'Open')+' gift '+(id==='google'?1:2)));
      present.querySelector('.present-reveal').inert=!open;
      button.querySelector('.present-action').textContent=ui(open?'هديتك جاهزة':'افتح هديتك',open?'Your gift is ready':'Unwrap your gift');
      const index=plans.indexOf(plan),state=openedGifts.get(index)||new Set();if(open){state.add(id);playGiftChime();}else state.delete(id);openedGifts.set(index,state);
    }));
    if(p.id==='gemini-coursera-bundle'){
      planDetails.insertAdjacentHTML('afterbegin',"<section class=\"bundle-inclusions\"><div class=\"bundle-primary-detail\"><span class=\"bundle-label\">الاشتراك الأساسي</span><h3>Coursera Plus</h3><p>١٢ شهرًا من الكورسات · حساب جاهز</p><span class=\"bundle-guarantee\">✓ ضمان كامل لكورسيرا</span></div><div class=\"bundle-gift-details\"><span class=\"bundle-label\">هدايا مشمولة مجانًا</span><div class=\"bundle-gift-row\"><img src=\"logos/gemini.svg?v=20261027-hq1\" alt=\"\"><div><strong>Gemini</strong><p>٣ شهور على إيميلك</p></div><span class=\"bundle-free-tag\">مجانًا</span></div><div class=\"bundle-gift-row\"><img src=\"logos/canva.svg\" alt=\"\"><div><strong>Canva Pro</strong><p>٣ سنين على إيميلك</p></div><span class=\"bundle-free-tag\">مجانًا</span></div></div><p class=\"bundle-total-note\">الاشتراك والهدايا معًا بـ٤٩٩ج · بدون تكلفة إضافية للهدايا</p></section>");
    }
    planFeatures.innerHTML=features.length?'<div class="plan-features"><b>'+ui('مميزات الاشتراك','Subscription features')+'</b><ul>'+features.map(n=>'<li>'+MasterStore.escapeHtml(n)+'</li>').join('')+'</ul></div>':'';
    if(window.MasterProductGuides)planFeatures.insertAdjacentHTML('beforeend',MasterProductGuides.render(p.id,isEn(),location.pathname+location.search,{product:p,catalog:MasterCatalog.products,translate:tr,featuresFor:plan=>subscriptionFeatures(p,plan)}));
  }
  radios.forEach(r=>r.onchange=()=>{shareStatus.textContent='';shareInput.hidden=true;const url=new URL(location.href);url.searchParams.set('plan',r.value);history.replaceState(history.state,'',url);renderDetails();});
  renderDetails();
  window.MasterPlanComparison?.mount({root,product:p});
  if(window.MasterLocale)window.MasterLocale.apply(); // re-translate dynamic product content

  function refreshLocalizedProductPrices(){
    const categoryEl=document.querySelector('.product-title .eyebrow');
    const descEl=document.querySelector('.product-title p');
    const statusEl=document.querySelector('.product-hero>.status');
    if(categoryEl)categoryEl.textContent=tr(p.category,'category');
    if(descEl)descEl.textContent=tr(p.description||'','description');
    if(statusEl)statusEl.textContent=tr(statusLabel(p.status),'status');
    document.querySelectorAll('.plan-option').forEach(label=>{
      const plan=plans[Number(label.querySelector('input[name=plan]')?.value)];
      if(!plan)return;
      const name=label.querySelector('span b');
      const meta=label.querySelector('span small');
      const price=label.querySelector('strong');
      if(name)name.textContent=tr(plan.name||plan.duration,'planName');
      if(meta)meta.textContent=tr(planTier(p,plan),'planName')+' · '+tr(plan.duration||'','duration')+' · '+tr(subscriptionType(plan),'accountType');
      const oldSaving=label.querySelector('.plan-saving');
      if(oldSaving)oldSaving.remove();
      const holder=label.querySelector('span');
      if(holder)holder.insertAdjacentHTML('beforeend',planSavingMarkup(plan));
      if(price)(label.querySelector('.plan-price-tag')||price).outerHTML=planPriceMarkup(plan);
    });
    renderDetails();
    const back=root.querySelector('.back-link');
    if(back)back.textContent=ui('← كل المنتجات','← All products');
    const buy=document.getElementById('buyBtn');
    if(buy)buy.textContent=ui('شراء الآن','Buy now');
    updateProductMetadata();
    refreshWindowsGuide();
    Locale?.apply();
  }
  document.addEventListener('masterstore:localechange',refreshLocalizedProductPrices);

  document.getElementById('buyBtn')?.addEventListener('click',()=>{
    const plan=selectedPlan();
    if(!plan||plan.available===false||dialog.open)return;
    const planIndex=plans.indexOf(plan);
    checkoutContent.innerHTML='<button type="button" class="dialog-close" aria-label="'+ui('إغلاق','Close')+'">×</button><div class="checkout-head"><h2 id="checkoutTitle">'+ui('نكمل الطلب؟','Ready to check out?')+'</h2><p>'+ui('أكد الطلب دلوقتي، أو ضيف الاشتراك للسلة وكمل اختيار باقي منتجاتك.','Check out now, or add this subscription to your cart and keep shopping.')+'</p></div><div class="checkout-summary"><b>'+MasterStore.escapeHtml(p.name)+'</b><span>'+MasterStore.escapeHtml(tr(plan.name||plan.duration,'planName'))+'</span><strong>'+MasterStore.planMoney(plan)+'</strong></div><div class="purchase-choice-actions"><button class="primary full" type="button" data-purchase="checkout">'+ui('تأكيد الطلب دلوقتي','Check out now')+'</button><button class="ghost-btn full" type="button" data-purchase="continue">'+ui('هكمل تسوّق — ضيف ده للسلة','Keep shopping — add to cart')+'</button></div><p class="purchase-choice-note" role="status" hidden></p>';
    checkoutContent.querySelector('.dialog-close').onclick=()=>dialog.close();
    let added=false;
    checkoutContent.querySelectorAll('[data-purchase]').forEach(button=>button.onclick=()=>{
      if(added)return;
      try{
        window.MasterCart.add(p.id,planIndex);
        added=true;
        checkoutContent.querySelectorAll('[data-purchase]').forEach(b=>b.disabled=true);
        dialog.close();
        if(button.dataset.purchase==='checkout')location.href='cart.html#cartCheckout';
        else location.href='/index.html#products';
      }catch(error){
        const note=checkoutContent.querySelector('.purchase-choice-note');
        note.textContent=error.message;note.hidden=false;
      }
    });
    dialog.showModal();
  });
})();

(function cursorOfferTimer(){
 const end=Date.parse('2026-10-13T11:32:00Z');
 const mount=()=>{
  const page=new URLSearchParams(location.search).get('id')==='cursor-pro';
  const root=page?document.querySelector('#productPage .product-hero'):document.querySelector('[data-product-id="cursor-pro"]');
  if(!root||root.querySelector('[data-cursor-offer]'))return;
  const box=document.createElement('div');box.dataset.cursorOffer='';box.setAttribute('role','timer');box.setAttribute('aria-live','off');box.style.cssText='color:#c62828;font-size:11px;line-height:1.8;margin:10px 0;text-align:center';
  const update=()=>{const en=document.documentElement.lang==='en';let s=Math.max(0,Math.floor((end-Date.now())/1000));const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);s%=60;box.textContent=end>Date.now()?(en?'Monthly offer EGP 300 · '+h+' hours : '+m+' minutes : '+s+' seconds left':'عرض الشهر 300ج · متبقي '+h+' ساعة : '+m+' دقيقة : '+s+' ثانية'):(en?'The EGP 300 monthly offer has ended':'انتهى عرض الشهر بـ300ج');};
  root.append(box);update();setInterval(update,1000);
 };
 mount();const root=document.getElementById('productPage')||document.getElementById('grid');if(root)new MutationObserver(mount).observe(root,{childList:true});
})();
