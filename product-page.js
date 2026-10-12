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
  if(params.get('id')==='manus-pro'){location.replace('product.html?id=manus&plan=2');return;}
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
    const local=product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg?v=20261009-logo-review3':'';
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
    const description=tr(p.description||'','description')||p.name;
    document.title=p.name+' | MASTER STORE';
    setMeta('meta[name="description"]',description);
    setMeta('meta[property="og:title"]',p.name+' | MASTER STORE');
    setMeta('meta[property="og:description"]',description);
  }

  updateProductMetadata();

  const active=p.status==='available';
  const plans=p.plans||[];
  const requestedPlan=Number(params.get('plan'));
  const initialPlan=Number.isInteger(requestedPlan)&&requestedPlan>=0&&requestedPlan<plans.length&&plans[requestedPlan].available!==false?requestedPlan:Math.max(0,plans.findIndex(x=>x.available!==false));

  root.innerHTML=
    '<section class="product-hero '+(p.id==='gemini-coursera-bundle'?'bundle-hero':'')+'">'+
      '<a class="back-link" href="index.html#products">'+ui('← كل المنتجات','← All products')+'</a>'+
      '<div class="product-title">'+icon(p)+'<div><span class="eyebrow">'+MasterStore.escapeHtml(tr(p.category,'category'))+'</span><h1>'+MasterStore.escapeHtml(p.name)+'</h1><p>'+MasterStore.escapeHtml(tr(p.description||'','description'))+'</p></div></div>'+
      '<span class="status '+(p.status==='available'?'ok':p.status==='soon'?'soon':'out')+'">'+tr(statusLabel(p.status),'status')+'</span>'+
    '</section>'+
    '<section class="product-layout '+(p.id==='gemini-coursera-bundle'?'bundle-layout':'')+'">'+
      '<div class="plans-block"><h2>'+ui('اختار الباقة','Choose a plan')+'</h2>'+
        (plans.length?plans.map((plan,i)=>
          '<label class="plan-option">'+
            '<input type="radio" name="plan" value="'+i+'" '+(i===initialPlan?'checked':'')+' '+(!active||plan.available===false?'disabled':'')+'>'+
            '<span><b>'+MasterStore.escapeHtml(tr(plan.name||plan.duration,'planName'))+'</b><small>'+MasterStore.escapeHtml(tr(planTier(p,plan),'planName'))+' · '+MasterStore.escapeHtml(tr(plan.duration||'','duration'))+' · '+MasterStore.escapeHtml(tr(subscriptionType(plan),'accountType'))+'</small>'+planSavingMarkup(plan)+'</span>'+
            '<strong>'+(plan.available===false?ui('غير متاح','Unavailable'):MasterStore.planMoney(plan))+'</strong>'+
          '</label>'
        ).join(''):'<div class="notice">'+ui('الخدمة غير متاحة للطلب حاليًا.','This service is currently unavailable for ordering.')+'</div>')+
        '<div id="planFeatures"></div>'+
      '</div>'+
      '<aside class="summary-card">'+
        '<h2>'+ui('تفاصيل الباقة','Plan details')+'</h2>'+
        '<div id="planDetails"></div>'+
        (active?'<button id="buyBtn" class="primary full" type="button">'+ui('أضف للسلة','Add to cart')+'</button>':'<button class="primary full disabled" disabled>'+ui('غير متاح حاليًا','Currently unavailable')+'</button>')+
        '<p class="safe-note">'+ui('بعد إرسال الطلب، فريق الدعم هيتواصل معاك لتأكيد التوفر وبيانات الدفع.','After you send the order, support will confirm availability and payment details.')+'</p>'+
      '</aside>'+
    '</section>';

  function renderManusCards(){
    if(p.id!=='manus')return;
    root.classList.add('manus-page');
    const headings=[ui('رصيد 3,300 كرديت','3,300 credits'),ui('رصيد 4,000 كرديت','4,000 credits'),ui('Pro لمدة شهر','Monthly Pro'),ui('Pro لمدة سنة','Annual Pro')];
    const balances=['3,300','4,000','5,000','4,000'];
    const badges=[ui('رصيد جاهز','Ready credits'),ui('رصيد جاهز','Ready credits'),ui('1,000 كرديت هدية','1,000 bonus credits'),ui('على حسابك الشخصي','Your personal account')];
    root.querySelectorAll('.plan-option').forEach((label,i)=>{
      const plan=plans[i];label.classList.add('manus-plan');
      const input=label.querySelector('input');
      label.innerHTML='<div class="manus-card-top"><span class="manus-badge">'+badges[i]+'</span><span class="manus-check" aria-hidden="true">✓</span></div><h3>'+headings[i]+'</h3><div class="manus-balance"><strong>'+balances[i]+'</strong><span>'+ui(i===3?'كرديت كل شهر':'كرديت',i===3?'credits each month':'credits')+'</span></div><p class="manus-card-copy">'+(i===2?ui('4,000 أساسية + 1,000 مجانًا','4,000 included + 1,000 free'):i===3?ui('اشتراك 12 شهرًا · تفعيل شخصي','12 months · personal activation'):ui('بدون اشتراك Pro','Without Pro subscription'))+'</p><div class="manus-card-price">'+(i===3?'<strong>$80</strong><small>'+MasterStore.planMoney(plan)+'</small>':'<strong>'+MasterStore.planMoney(plan)+'</strong>')+'</div><div class="manus-card-bottom"><span>'+ui('ضمان ','Warranty: ')+tr(plan.warranty,'warranty')+'</span><span>'+ui(i===3?'تفعيل على حسابك':'بريد وباسورد',i===3?'Personal activation':'Email & password')+'</span></div>';
      label.prepend(input);
    });
    let intro=root.querySelector('.manus-plan-intro');if(!intro){intro=document.createElement('p');intro.className='manus-plan-intro';root.querySelector('.plans-block h2').after(intro);}intro.textContent=ui('اختار الرصيد أو الاشتراك المناسب لك. تفاصيل الضمان والتسليم موضحة لكل باقة.','Choose your credits or subscription. Warranty and delivery are shown for every plan.');
  }
  renderManusCards();

  if(active&&plans.length){
    const bar=document.createElement('div');
    bar.className='mobile-order-bar';
    bar.innerHTML='<div><small>'+ui('الباقة المختارة','Selected plan')+'</small><strong id="mobilePlanPrice"></strong></div><button class="primary" id="mobileBuyBtn" type="button">'+ui('أضف للسلة','Add to cart')+'</button>';
    root.appendChild(bar);
    document.getElementById('mobileBuyBtn').addEventListener('click',()=>document.getElementById('buyBtn')?.click());
  }

  bindProductLogoFallback();

  const planDetails=document.getElementById('planDetails');
  const planFeatures=document.getElementById('planFeatures');
  const radios=[...document.querySelectorAll('input[name="plan"]')];

  function planSavingMarkup(plan){
    if(!plan||(!plan.oldPrice&&!plan.officialPrice))return '';
    const saving=MasterStore.planAmount(plan,'oldPrice')-MasterStore.planAmount(plan);
    if(saving<=0)return '';
    return '<small class="plan-saving">'+(p.id==='gemini-coursera-bundle'?ui('إجمالي التوفير التقديري','Estimated total savings'):(plan.officialPrice?ui('توفير','Save'):ui('وفر','Save')))+' '+MasterStore.formatCurrency(saving,MasterStore.getMarket().currency)+'</small>';
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

  const serviceFeatures={
    "chatgpt-plus":["قدرات ChatGPT المتقدمة","تحليل الملفات والصور والمستندات","المساعدة في الكتابة والبرمجة والبحث","إنشاء وتلخيص المحتوى","حل المسائل وشرح الأفكار","المساعدة في الدراسة والعمل"],
    "gemini-pro":[
      "نماذج Gemini المتقدمة بحدود استخدام أعلى",
      "Gemini Live للمحادثة والتفاعل المباشر",
      "Deep Research للبحث المتعمق",
      "رفع وتحليل الملفات والمستندات والصور",
      "التعامل مع سياق طويل ومحتوى كبير",
      "إنشاء وتحرير الصور بالذكاء الاصطناعي",
      "إنشاء فيديو عبر أدوات Google AI المؤهلة",
      "تكامل Gemini مع Gmail",
      "تكامل Gemini مع Google Docs",
      "مساعدة ذكية داخل Google Drive",
      "استخدام Gemini داخل Google Sheets",
      "استخدام Gemini داخل Google Slides",
      "تكامل مع تطبيقات Google المتصلة حسب التوفر",
      "NotebookLM بحدود أعلى حسب الخطة",
      "المساعدة في البرمجة وشرح الأكواد",
      "تلخيص ومقارنة مصادر متعددة",
      "توليد أفكار وكتابة محتوى احترافي",
      "مزايا Google AI إضافية حسب الحساب والمنطقة",
      "5 تيرابايت مساحة Google One لـ Gmail وGoogle Drive وGoogle Photos"
    ],
    "claude-pro":["نماذج Claude المتقدمة","تحليل وكتابة النصوص الطويلة","رفع وتحليل الملفات","المساعدة في البرمجة","تلخيص المحتوى","إعادة الصياغة والتحرير"],
    "perplexity-pro":["بحث ذكي بالذكاء الاصطناعي","إجابات مدعومة بمصادر","بحث متعمق","رفع وتحليل الملفات","تلخيص النتائج","مقارنة مصادر متعددة"],
    "lovable-pro":["إنشاء مواقع وتطبيقات من وصف نصي","تعديل الواجهات بالذكاء الاصطناعي","إنشاء نماذج أولية بسرعة","المساعدة في بناء صفحات كاملة","تعديل التصميم والمنطق بالمحادثة","تسريع تطوير المشاريع"],
    "lovable-lite":["إنشاء مواقع وتطبيقات بالذكاء الاصطناعي","تعديل المشاريع بالمحادثة","إنشاء نماذج أولية","Credits للاستخدام داخل المنصة","تسريع تطوير الواجهات","مناسب للمشاريع الصغيرة"],
    "wink-ai":["تحرير الصور والفيديو بالذكاء الاصطناعي","تحسين جودة الصور","تحسين الفيديو","أدوات تجميل وتعديل","مؤثرات وقوالب","أدوات مناسبة لصناع المحتوى"],
    "grok":["محادثة بالذكاء الاصطناعي","البحث وجمع المعلومات","كتابة وصياغة المحتوى","تلخيص النصوص","المساعدة في البرمجة","توليد الأفكار"],
    "gamma-plus":["إنشاء عروض تقديمية بالذكاء الاصطناعي","إنشاء مستندات وصفحات","تحويل النص إلى عرض منظم","قوالب وتصميم تلقائي","إعادة تصميم المحتوى بسرعة","تصدير ومشاركة العروض"],
    "gamma-account":["إنشاء عروض ومستندات بالذكاء الاصطناعي","10 Workspaces","رصيد كبير موزع على المساحات","إنشاء عروض بسرعة","قوالب وتصميم تلقائي","مناسب لعدة مشاريع أو عملاء"],
    "elevenlabs":["تحويل النص إلى صوت","أصوات واقعية","دعم لغات متعددة حسب الخدمة","إنشاء تعليق صوتي","أدوات توليد صوت احترافية","مناسب للفيديو والبودكاست"],
    "heygen":["إنشاء فيديو بالذكاء الاصطناعي","أفاتار رقمي","تحويل النص إلى فيديو","أصوات وتعليق داخل الفيديو","مناسب للفيديوهات التسويقية","إنشاء محتوى مرئي بسرعة"],
    "canva-pro":["قوالب Pro احترافية","مكتبة عناصر وصور أكبر","إزالة الخلفية","أدوات AI للتصميم","تغيير مقاسات التصميم بسرعة","Brand Kit وأدوات العلامة التجارية"],
    "capcut-pro":["أدوات مونتاج Pro","مؤثرات وانتقالات إضافية","قوالب احترافية","أدوات AI للفيديو","تحسين وتعديل الصوت","أدوات مناسبة للسوشيال ميديا"],
    "figma":["تصميم واجهات UI/UX","التعاون على ملفات التصميم","Components وأنظمة تصميم","Prototype تفاعلي","إدارة ملفات المشاريع","مناسب للويب والتطبيقات"],
    "freepik":["مكتبة صور وVectors ضخمة","ملفات PSD وموارد تصميم","أصول Premium","أدوات AI للتصميم","موارد للسوشيال ميديا","مناسب للمصممين وصناع المحتوى"],
    "duolingo":["تعلم لغات بتمارين تفاعلية","ممارسة يومية","تدريب مفردات","تدريب قواعد","تدريب استماع ونطق","تتبع التقدم"],
    "elsa":["تدريب نطق الإنجليزية","تحليل النطق","ملاحظات على الأخطاء","تدريب محادثة","تمارين استماع","تحسين اللكنة والطلاقة"],
    "coursera":["دورات من جامعات وشركات","مجالات تقنية ومهنية متنوعة","تعلم ذاتي منظم","مشاريع وتمارين","مسارات تعليمية متعددة","تطوير مهارات مهنية"],
    "quizizz":["إنشاء اختبارات تفاعلية","أنشطة للطلاب","تقارير أداء","مشاركة الأنشطة بسهولة","قوالب تعليمية","مناسب للفصول الدراسية"],
    "wordwall":["إنشاء ألعاب وأنشطة تعليمية","قوالب جاهزة","تعديل الأنشطة بسهولة","مشاركة الأنشطة","استخدام داخل الفصل","مناسب للمراجعة والتدريب"],
    "turnitin":["فحص التشابه","تقرير نسبة التشابه","إظهار مصادر التشابه","مراجعة الملف قبل التسليم","المساعدة في اكتشاف الاقتباس المتشابه","تقرير واضح للمراجعة"],
    "microsoft-365":["Word","Excel","PowerPoint","تطبيقات Microsoft للإنتاجية","إنشاء وتحرير المستندات","إنشاء الجداول والعروض"],
    "notion":["إدارة الملاحظات","إدارة المشاريع","قواعد بيانات مرنة","تنظيم المهام","مساحات عمل","قوالب وتنظيم المحتوى"],
    "linkedin-premium":["مزايا Premium للحساب المهني","أدوات إضافية للوظائف","مزايا بحث متقدمة","رؤية أوسع لبعض بيانات الحسابات","أدوات للنمو المهني","مزايا إضافية للتواصل"],
    "zoom":["اجتماعات فيديو Pro","إدارة أفضل للاجتماعات","مزايا إضافية للمضيف","مناسب للدروس والاجتماعات","أدوات مشاركة وتعاون","استخدام مهني أكثر مرونة"],
    "stealth-writer":["Humanize للنصوص","إعادة صياغة","تحسين أسلوب الكتابة","التعامل مع نصوص طويلة","إنتاج نسخ بديلة للنص","أدوات تحرير محتوى"],
    "icloud":["مساحة تخزين سحابية كبيرة","نسخ احتياطي للصور","نسخ احتياطي للملفات","مزامنة بين أجهزة Apple","حفظ البيانات على السحابة","توسيع مساحة التخزين"],
    "surfshark":["اتصال VPN مشفر","تغيير الموقع الافتراضي","حماية على Wi-Fi العامة","خصوصية أثناء التصفح","خوادم متعددة","استخدام أكثر أمانًا أثناء السفر"],
    "nordvpn":["اتصال VPN مشفر","خوادم متعددة حول العالم","حماية على الشبكات العامة","تعزيز الخصوصية","تغيير الموقع الافتراضي","اتصال آمن أثناء السفر"],
    "proton-vpn":["اتصال VPN مشفر","تعزيز الخصوصية","خوادم متعددة","حماية على Wi-Fi العامة","تغيير الموقع الافتراضي","تصفح أكثر أمانًا"],
    "hma-vpn":["اتصال VPN","تغيير الموقع الافتراضي","تشفير الاتصال","خوادم متعددة","حماية على الشبكات العامة","تعزيز الخصوصية"],
    "expressvpn":["VPN سريع ومشفر","خوادم في دول متعددة","حماية الخصوصية","حماية على Wi-Fi العامة","تغيير الموقع الافتراضي","مناسب للاستخدام اليومي"],
    "spotify":["استماع بدون إعلانات","تنزيل الموسيقى","الاستماع دون إنترنت","تحكم كامل في التشغيل","جودة استماع أعلى حسب الخطة","تجربة Premium كاملة"],
    "youtube":["مشاهدة بدون إعلانات","تشغيل في الخلفية","تنزيل الفيديوهات","المشاهدة دون إنترنت","YouTube Music Premium حسب الخطة","تجربة مشاهدة أفضل"],
    "manus":["تنفيذ مهام متعددة الخطوات","البحث وجمع المعلومات","تنظيم النتائج","أتمتة أجزاء من سير العمل","مساعدة في المشاريع","تنفيذ مهام AI متقدمة"],
    "gumloop":["أتمتة سير العمل","ربط خطوات متعددة","دمج أدوات AI","تقليل المهام اليدوية","بناء Workflows","مناسب للعمليات الرقمية"],
    "magic-patterns":["إنشاء واجهات من وصف نصي","توليد UI بسرعة","نماذج أولية","استكشاف أفكار تصميم","تسريع بناء الواجهات","مناسب للمصممين والمطورين"],
    "factory-pro":["مساعدة AI لتطوير البرمجيات","كتابة وفهم الكود","تسريع التطوير","دعم سير العمل البرمجي","مناسب للفرق","مساعدة في المهام البرمجية"],
    "framer-pro":["تصميم مواقع تفاعلية","نشر المواقع","أدوات حركة وتصميم","إنشاء صفحات تسويقية","بناء بدون تعقيد برمجي كبير","مناسب للمصممين"],
    "supabase-pro":["قاعدة بيانات للمشاريع","Authentication","Backend جاهز","تخزين وإدارة البيانات","أدوات للمطورين","تسريع بناء التطبيقات"],
    "railway-hobby":["نشر التطبيقات","تشغيل الخدمات","إدارة المشاريع","بيئات نشر سهلة","مناسب للمطورين","تسهيل الاستضافة"],
    "pangram-pro":["تحليل النصوص","أدوات للعمل على المحتوى","مراجعة الكتابة","تحسين سير العمل النصي","تحليل محتوى","مناسب للمحررين"],
    "supercut-pro":["أدوات صناعة المحتوى","تحرير المقاطع","تسريع إعداد الفيديو","خصائص Pro","مناسب لصناع المحتوى","تحسين سير عمل التحرير"],
    "wispr-flow-pro":["تحويل الكلام إلى نص","إملاء صوتي سريع","الكتابة بالصوت","تقليل الكتابة اليدوية","مناسب للرسائل والمستندات","رفع الإنتاجية"],
    "mobbin-team":["مكتبة مراجع UI/UX","أمثلة تطبيقات حقيقية","بحث في أنماط التصميم","إلهام للواجهات","مفيد للفرق","تسريع أبحاث التصميم"],
    "granola-business":["ملاحظات اجتماعات بالذكاء الاصطناعي","تلخيص الاجتماعات","استخراج النقاط المهمة","تنظيم المتابعة","مناسب للفرق","توفير وقت تدوين الملاحظات"],
    "jam-team":["تسجيل مشاكل المواقع","مشاركة Bugs مع الفريق","توثيق بصري للمشكلة","تسهيل التعاون","تسريع التواصل بين الفرق","مناسب للمصممين والمطورين"],
    "readwise-reader":["حفظ المقالات","القراءة لاحقًا","تنظيم الملاحظات","حفظ الاقتباسات","مراجعة المعرفة","تجميع مصادر القراءة"],
    "waking-up":["جلسات تأمل","دروس ووعي ذهني","مكتبة صوتية","برامج منظمة","محتوى للتدريب الذهني","بناء روتين تأمل"],
    "linear-business":["إدارة المشاريع","إدارة المهام","تتبع Issues","تنظيم سير العمل","تعاون الفرق","تخطيط وتنفيذ المشاريع"],
    "posthog-scale":["تحليلات المنتجات","فهم سلوك المستخدم","تقارير استخدام","تحليل Funnels","دعم قرارات المنتج","مفيد لفرق النمو"],
    "customerio-essentials":["رسائل آلية للعملاء","حملات تسويقية","تدفقات تواصل","تقسيم الجمهور","رسائل مبنية على السلوك","Customer Engagement"]
  };

  const categoryFeatureBoosters={
    "AI Tools":["توفير وقت في المهام اليومية","توليد أفكار ومحتوى","تلخيص النصوص بسرعة","إعادة صياغة وتحسين المحتوى","المساعدة في البحث","دعم الدراسة والعمل","تحليل النصوص والمعلومات","رفع الإنتاجية"],
    "التصميم":["تسريع إنتاج المحتوى البصري","أدوات احترافية إضافية","إنشاء محتوى للسوشيال ميديا","دعم مشاريع التصميم والمونتاج","قوالب وموارد جاهزة","تحسين جودة العمل البصري","تسريع التعديلات","مناسب لصناع المحتوى"],
    "التعليم":["دعم التعلم الذاتي","أدوات تعليمية تفاعلية","تنظيم التعلم والمراجعة","محتوى وتمارين للتطبيق","مفيد للطلاب والمعلمين","متابعة التقدم","دعم الدراسة اليومية","تحسين تجربة التعلم"],
    "الإنتاجية":["تسريع إنجاز المهام","تنظيم العمل والمشاريع","تقليل المهام المتكررة","تحسين التعاون","مناسب للعمل الشخصي والمهني","تنظيم المحتوى والملفات","رفع كفاءة سير العمل","تسهيل المتابعة"],
    "VPN والحماية":["تشفير الاتصال","حماية على Wi-Fi العامة","تقليل كشف عنوان IP","تغيير الموقع الافتراضي","تعزيز الخصوصية","اتصال أكثر أمانًا أثناء السفر","خوادم متعددة","طبقة حماية إضافية"],
    "الترفيه":["تجربة أفضل من الخطة المجانية","مزايا Premium إضافية","تقليل القيود","سهولة الوصول للمحتوى","مناسب للهاتف والكمبيوتر","تجربة أكثر سلاسة","مزايا مشاهدة أو استماع إضافية","استخدام يومي أفضل"]
  };


  const englishCategoryFeatures={
    "AI Tools":["Premium AI tools and higher usage limits","Faster research, writing, and content creation","Analysis and productivity workflows","Useful for study, work, and digital projects","Premium features included with the selected plan"],
    "التصميم":["Professional design and content-creation tools","Premium templates, assets, or editing features","Useful for social media and creative projects","Faster visual production workflows","Premium features included with the selected plan"],
    "التعليم":["Structured learning and practice tools","Useful for students, teachers, and self-learning","Interactive study and review features","Progress-focused learning experience","Premium features included with the selected plan"],
    "الإنتاجية":["Tools for faster everyday workflows","Better organization for tasks and projects","Useful for personal and professional work","Reduced manual work and improved productivity","Premium features included with the selected plan"],
    "VPN والحماية":["Encrypted VPN connection","Safer use on public Wi-Fi","Multiple server locations depending on the service","Improved privacy while browsing","Premium features included with the selected plan"],
    "الترفيه":["Premium entertainment experience","Fewer restrictions than the free tier","Extra playback, viewing, or listening features","Suitable for supported devices","Premium features included with the selected plan"]
  };
  const englishServiceFeatures={
    "chatgpt-plus":["Advanced ChatGPT capabilities","File, image, and document analysis","Writing, coding, and research assistance","Content generation and summarization","Problem solving and explanations","Useful for study and professional work"],
    "gemini-pro":["Advanced Gemini models with higher limits","Gemini Live conversations","Deep Research","File, document, and image analysis","Long-context workflows","AI image creation and editing","Google app integrations where available","NotebookLM higher limits where included","Coding and research assistance","5 TB Google One storage where included by the plan"],
    "claude-pro":["Advanced Claude models","Long-form writing and analysis","File analysis","Coding assistance","Summarization","Editing and rewriting"],
    "perplexity-pro":["AI-powered search","Source-backed answers","Deep research","File analysis","Result summarization","Multi-source comparison"],
    "canva-pro":["Premium Canva templates","Larger media and asset library","Background remover","AI design tools","Quick resize tools","Brand Kit features"],
    "capcut-pro":["Pro video editing tools","Premium effects and transitions","Professional templates","AI video tools","Audio enhancement tools","Creator-focused editing features"],
    "elevenlabs":["Text-to-speech generation","Realistic AI voices","Multi-language support where available","Voice-over creation","Professional audio tools"],
    "heygen":["AI video creation","Digital avatars","Text-to-video workflows","Voice and narration tools","Useful for marketing videos"],
    "turnitin":["Similarity checking","Similarity percentage report","Matched-source references","Pre-submission review support","Clear similarity report"],
    "zoom":["Zoom Pro meetings","Improved meeting management","Additional host features","Useful for classes and meetings","Sharing and collaboration tools"],
    "grammarly":["Advanced spelling and grammar correction","Writing style and clarity improvements","Advanced word and sentence suggestions","AI writing tools available in the plan","Useful for study, work, and professional writing","Fast activation with support during the subscription"]
  };

  function subscriptionFeatures(product,plan){
    if(product.id==='manus')return [tr(plan.credits,'credits'),ui('الضمان: ','Warranty: ')+tr(plan.warranty,'warranty'),tr(plan.activation,'activation'),...(plan.notes||[]).map(n=>tr(n,'note'))];
    if(product.featuresEn&&product.features)return isEn()?product.featuresEn:product.features;
    if(isEn()){
      const base=englishServiceFeatures[product.id]||englishCategoryFeatures[product.category]||englishCategoryFeatures["AI Tools"];
      const extra=plan.credits?[tr(plan.credits,'credits')]:[];
      return [...new Set([product.name+' premium access',...base,...extra])].slice(0,product.id==="gemini-pro"?12:10);
    }
    const base=[...(serviceFeatures[product.id]||[]),...(product.features||[]),...(plan.features||[])];
    const extras=categoryFeatureBoosters[product.category]||[];
    const unique=[...new Set([...base,...extras])];
    return unique.slice(0,product.id==="gemini-pro"?20:12);
  }


  function renderDetails(){
    const plan=selectedPlan();
    if(!plan){planDetails.innerHTML='';return;}
    const buy=document.getElementById('buyBtn');if(buy)buy.disabled=plan.available===false;
    const mobilePrice=document.getElementById('mobilePlanPrice');
    if(mobilePrice)mobilePrice.textContent=MasterStore.planMoney(plan);
    const mobileBuy=document.getElementById('mobileBuyBtn');
    if(mobileBuy)mobileBuy.textContent=ui('أضف للسلة','Add to cart');
    const mobileLabel=root.querySelector('.mobile-order-bar small');
    if(mobileLabel)mobileLabel.textContent=ui('الباقة المختارة','Selected plan');
    const notes=[...(p.notes||[]),...(plan.notes||[])];
    const features=subscriptionFeatures(p,plan);
    const saving=Math.max(0,(plan.oldPrice||plan.officialPrice)?MasterStore.planAmount(plan,'oldPrice')-MasterStore.planAmount(plan):0);
    planDetails.innerHTML=
      '<dl class="details-list">'+
        '<div><dt>'+ui('السعر','Price')+'</dt><dd>'+MasterStore.planMoney(plan)+'</dd></div>'+
        ((plan.oldPrice||plan.officialPrice)?'<div><dt>'+(plan.officialPrice?ui('السعر الرسمي','Official price'):ui('السعر قبل العرض','Before discount'))+'</dt><dd>'+(saving?'<del>'+MasterStore.planMoney(plan,'oldPrice')+'</del>':MasterStore.planMoney(plan,'oldPrice'))+(saving?' <strong class="saving">'+(plan.officialPrice?ui('توفير','Save'):ui('وفر','Save'))+' '+MasterStore.formatCurrency(saving,MasterStore.getMarket().currency)+'</strong>':'')+'</dd></div>':'')+
        '<div><dt>'+ui('نوع الباقة','Plan tier')+'</dt><dd>'+MasterStore.escapeHtml(tr(planTier(p,plan),'planName'))+'</dd></div>'+
        '<div><dt>'+ui('المدة','Duration')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.duration||'غير محددة','duration'))+'</dd></div>'+
        '<div><dt>'+ui('نوع الاشتراك','Subscription type')+'</dt><dd>'+MasterStore.escapeHtml(tr(subscriptionType(plan),'accountType'))+'</dd></div>'+
        '<div><dt>'+ui('طريقة الحساب','Account method')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.account||'يُؤكد قبل الدفع','account'))+'</dd></div>'+
        '<div><dt>'+ui('التفعيل','Activation')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.activation||'يُؤكد قبل الدفع','activation'))+'</dd></div>'+
        '<div><dt>'+ui('الضمان','Warranty')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.warranty||'غير محدد','warranty'))+'</dd></div>'+
        (plan.credits?'<div><dt>'+ui('الرصيد','Credits')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.credits,'credits'))+'</dd></div>':'')+
      '</dl>'+
      (notes.length?'<div class="plan-notes"><b>'+ui('ملاحظات مهمة','Important notes')+'</b><ul>'+notes.map(n=>'<li>'+MasterStore.escapeHtml(tr(n,'note'))+'</li>').join('')+'</ul></div>':'');
    if(p.id==='gemini-coursera-bundle'){
      planDetails.insertAdjacentHTML('afterbegin',"<section class=\"bundle-inclusions\"><div class=\"bundle-primary-detail\"><span class=\"bundle-label\">الاشتراك الأساسي</span><h3>Coursera Plus</h3><p>١٢ شهرًا من الكورسات · حساب جاهز</p><span class=\"bundle-guarantee\">✓ ضمان كامل لكورسيرا</span></div><div class=\"bundle-gift-details\"><span class=\"bundle-label\">هدايا مشمولة مجانًا</span><div class=\"bundle-gift-row\"><img src=\"logos/gemini.svg\" alt=\"\"><div><strong>Gemini</strong><p>٣ شهور على إيميلك</p></div><span class=\"bundle-free-tag\">مجانًا</span></div><div class=\"bundle-gift-row\"><img src=\"logos/canva.svg\" alt=\"\"><div><strong>Canva Pro</strong><p>٣ سنين على إيميلك</p></div><span class=\"bundle-free-tag\">مجانًا</span></div></div><p class=\"bundle-total-note\">الاشتراك والهدايا معًا بـ٤٩٩ج · بدون تكلفة إضافية للهدايا</p></section>");
    }
    planFeatures.innerHTML=features.length?'<div class="plan-features"><b>'+ui('مميزات الاشتراك','Subscription features')+'</b><ul>'+features.map(n=>'<li>'+MasterStore.escapeHtml(n)+'</li>').join('')+'</ul></div>':'';
  }
  radios.forEach(r=>r.onchange=renderDetails);
  renderDetails();
  if(window.MasterLocale)window.MasterLocale.apply(); // re-translate dynamic product content

  function refreshLocalizedProductPrices(){
    const categoryEl=document.querySelector('.product-title .eyebrow');
    const descEl=document.querySelector('.product-title p');
    const statusEl=document.querySelector('.product-hero>.status');
    if(categoryEl)categoryEl.textContent=tr(p.category,'category');
    if(descEl)descEl.textContent=tr(p.description||'','description');
    if(statusEl)statusEl.textContent=tr(statusLabel(p.status),'status');
    document.querySelectorAll('.plan-option').forEach((label,i)=>{
      const plan=plans[i];
      if(!plan)return;
      const name=label.querySelector('span b');
      const meta=label.querySelector('span small');
      const price=label.querySelector('strong');
      if(name)name.textContent=tr(plan.name||plan.duration,'planName');
      if(meta)meta.textContent=tr(planTier(p,plan),'planName')+' · '+tr(plan.duration||'','duration')+' · '+tr(subscriptionType(plan),'accountType');
      const oldSaving=label.querySelector('.plan-saving');
      if(oldSaving)oldSaving.remove();
      const saving=(plan.oldPrice||plan.officialPrice)
        ? MasterStore.planAmount(plan,'oldPrice')-MasterStore.planAmount(plan)
        : 0;
      if(saving>0){
        const holder=label.querySelector('span');
        if(holder){
          const badge=document.createElement('small');
          badge.className='plan-saving';
          badge.textContent=(plan.officialPrice?ui('توفير','Save'):ui('وفر','Save'))+' '+MasterStore.formatCurrency(saving,MasterStore.getMarket().currency);
          holder.appendChild(badge);
        }
      }
      if(price)price.textContent=MasterStore.planMoney(plan);
    });
    renderManusCards();
    renderDetails();
    const back=root.querySelector('.back-link');
    if(back)back.textContent=ui('← كل المنتجات','← All products');
    const buy=document.getElementById('buyBtn');
    if(buy)buy.textContent=ui('أضف للسلة','Add to cart');
    updateProductMetadata();
    Locale?.apply();
  }
  document.addEventListener('masterstore:localechange',refreshLocalizedProductPrices);

  document.getElementById('buyBtn')?.addEventListener('click',()=>{
    try{if(selectedPlan()?.available===false)return;window.MasterCart.add(p.id,plans.indexOf(selectedPlan()));location.href='cart.html';}
    catch(error){showToast(error.message);}
  });
})();

(function geminiDeadline(){
 const deadline=Date.parse('2026-10-27T00:00:00+03:00');
 const productView=new URLSearchParams(location.search).get('id')==='gemini-pro';
 let clock;
 const mount=()=>{
  const target=productView?document.getElementById('productPage'):document.querySelector('[data-product-id="gemini-pro"]');
  if(!target||target.querySelector('[data-gemini-countdown]'))return;
  if(productView&&!target.querySelector('.product-hero'))return;
  if(clock)clearInterval(clock);
  const box=document.createElement('div');
  box.dataset.geminiCountdown='';box.className='gemini-deadline'+(productView?' gemini-deadline-detail':'');
  box.setAttribute('role','timer');box.setAttribute('aria-live','off');
  box.innerHTML='<span class="deadline-caption">ينتهي العرض قريبًا</span><span class="deadline-digits" dir="ltr"></span>';
  const digits=box.querySelector('.deadline-digits');
  const update=()=>{
   const ms=deadline-Date.now();
   if(ms<=0){box.textContent='انتهت مدة العرض · ٢٦ أكتوبر ٢٠٢٦';clearInterval(clock);return;}
   let seconds=Math.floor(ms/1000);const days=Math.floor(seconds/86400);seconds%=86400;
   const hours=Math.floor(seconds/3600);seconds%=3600;const minutes=Math.floor(seconds/60);seconds%=60;
   const values=[days,hours,minutes,seconds],labels=['يوم','ساعة','دقيقة','ثانية'];
   digits.innerHTML=values.map((value,i)=>'<span class="deadline-unit"><b>'+String(value).padStart(2,'0')+'</b><small>'+labels[i]+'</small></span>').join('<span class="deadline-separator">:</span>');
   box.setAttribute('aria-label','ينتهي العرض بعد '+days+' يوم و'+hours+' ساعة و'+minutes+' دقيقة و'+seconds+' ثانية');
  };
  if(productView){
   const panel=document.createElement('aside');panel.className='gemini-offer-notice';
   panel.innerHTML='<div><strong>قبل فوات الأوان</strong><p>آخر فرصة لعرض جيمناي ١٨ شهر: <b>٢٦ أكتوبر ٢٠٢٦</b>، حتى نهاية اليوم بتوقيت مصر.</p></div>';
   panel.append(box);target.querySelector('.product-hero').after(panel);
  }else{
   const bottom=target.querySelector('.card-bottom');if(bottom)bottom.before(box);else target.append(box);
  }
  update();clock=setInterval(update,1000);
 };
 mount();
 const root=document.getElementById(productView?'productPage':'grid');
 if(root)new MutationObserver(mount).observe(root,{childList:true});
})();

(function cursorOfferTimer(){
 const end=Date.parse('2026-10-13T11:32:00Z');
 const mount=()=>{
  const page=new URLSearchParams(location.search).get('id')==='cursor-pro';
  const root=page?document.querySelector('#productPage .product-hero'):document.querySelector('[data-product-id="cursor-pro"]');
  if(!root||root.querySelector('[data-cursor-offer]'))return;
  const box=document.createElement('div');box.dataset.cursorOffer='';box.setAttribute('role','timer');box.setAttribute('aria-live','off');box.style.cssText='color:#c62828;font-size:11px;line-height:1.8;margin:10px 0;text-align:center';
  const update=()=>{let s=Math.max(0,Math.floor((end-Date.now())/1000));const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);s%=60;box.textContent=end>Date.now()?'عرض الشهر 300ج · متبقي '+h+' ساعة : '+m+' دقيقة : '+s+' ثانية':'انتهى عرض الشهر بـ300ج';};
  root.append(box);update();setInterval(update,1000);
 };
 mount();const root=document.getElementById('productPage')||document.getElementById('grid');if(root)new MutationObserver(mount).observe(root,{childList:true});
})();
