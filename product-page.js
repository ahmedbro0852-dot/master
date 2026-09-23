(function(){
  'use strict';
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
    const fallback=(product.name||'M').split(/\s+/).map(x=>x[0]).join('').slice(0,2);
    const local=product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg?v=20260924-site12':'';
    const src=product.logoUrl||local;
    const fallbackAttr=product.logoUrl&&local?' data-fallback="'+MasterStore.escapeHtml(local)+'"':'';
    const onerror=product.logoUrl&&local
      ? "if(this.dataset.fallback&&!this.dataset.usedFallback){this.dataset.usedFallback='1';this.src=this.dataset.fallback;return;}this.style.display='none';this.nextElementSibling.style.display='grid'"
      : "this.style.display='none';this.nextElementSibling.style.display='grid'";
    return '<span class="product-logo big">'+(src?'<img src="'+MasterStore.escapeHtml(src)+'"'+fallbackAttr+' alt="'+MasterStore.escapeHtml(product.name)+'" onerror="'+onerror+'">':'')+'<span class="logo-fallback">'+fallback+'</span></span>';
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

  root.innerHTML=
    '<section class="product-hero">'+
      '<a class="back-link" href="index.html#products">'+ui('← كل المنتجات','← All products')+'</a>'+
      '<div class="product-title">'+icon(p)+'<div><span class="eyebrow">'+MasterStore.escapeHtml(tr(p.category,'category'))+'</span><h1>'+MasterStore.escapeHtml(p.name)+'</h1><p>'+MasterStore.escapeHtml(tr(p.description||'','description'))+'</p></div></div>'+
      '<span class="status '+(p.status==='available'?'ok':p.status==='soon'?'soon':'out')+'">'+tr(statusLabel(p.status),'status')+'</span>'+
    '</section>'+
    '<section class="product-layout">'+
      '<div class="plans-block"><h2>'+ui('اختار الباقة','Choose a plan')+'</h2>'+
        (plans.length?plans.map((plan,i)=>
          '<label class="plan-option">'+
            '<input type="radio" name="plan" value="'+i+'" '+(i===0?'checked':'')+' '+(!active?'disabled':'')+'>'+
            '<span><b>'+MasterStore.escapeHtml(tr(plan.name||plan.duration,'planName'))+'</b><small>'+MasterStore.escapeHtml(tr(planTier(p,plan),'planName'))+' · '+MasterStore.escapeHtml(tr(plan.duration||'','duration'))+' · '+MasterStore.escapeHtml(tr(subscriptionType(plan),'accountType'))+'</small></span>'+
            '<strong>'+MasterStore.planMoney(plan)+'</strong>'+
          '</label>'
        ).join(''):'<div class="notice">'+ui('الخدمة غير متاحة للطلب حاليًا.','This service is currently unavailable for ordering.')+'</div>')+
        '<div id="planFeatures"></div>'+
      '</div>'+
      '<aside class="summary-card">'+
        '<h2>'+ui('تفاصيل الباقة','Plan details')+'</h2>'+
        '<div id="planDetails"></div>'+
        (active?'<button id="buyBtn" class="primary full" type="button">'+ui('اطلب الباقة','Order this plan')+'</button>':'<button class="primary full disabled" disabled>'+ui('غير متاح حاليًا','Currently unavailable')+'</button>')+
        '<p class="safe-note">'+ui('بعد إرسال الطلب، فريق الدعم هيتواصل معاك لتأكيد التوفر وبيانات الدفع.','After you send the order, support will confirm availability and payment details.')+'</p>'+
      '</aside>'+
    '</section>';

  const planDetails=document.getElementById('planDetails');
  const planFeatures=document.getElementById('planFeatures');
  const radios=[...document.querySelectorAll('input[name="plan"]')];

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
    const notes=[...(p.notes||[]),...(plan.notes||[])];
    const features=subscriptionFeatures(p,plan);
    const saving=plan.oldPrice&&Number(plan.oldPrice)>Number(plan.price)?MasterStore.planAmount(plan,'oldPrice')-MasterStore.planAmount(plan):0;
    planDetails.innerHTML=
      '<dl class="details-list">'+
        '<div><dt>'+ui('السعر','Price')+'</dt><dd>'+MasterStore.planMoney(plan)+'</dd></div>'+
        (plan.oldPrice?'<div><dt>'+ui('السعر قبل العرض','Before discount')+'</dt><dd><del>'+MasterStore.planMoney(plan,'oldPrice')+'</del>'+(saving?' <strong class="saving">'+ui('وفر','Save')+' '+MasterStore.formatCurrency(saving,MasterStore.getMarket().currency)+'</strong>':'')+'</dd></div>':'')+
        '<div><dt>'+ui('نوع الباقة','Plan tier')+'</dt><dd>'+MasterStore.escapeHtml(tr(planTier(p,plan),'planName'))+'</dd></div>'+
        '<div><dt>'+ui('المدة','Duration')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.duration||'غير محددة','duration'))+'</dd></div>'+
        '<div><dt>'+ui('نوع الاشتراك','Subscription type')+'</dt><dd>'+MasterStore.escapeHtml(tr(subscriptionType(plan),'accountType'))+'</dd></div>'+
        '<div><dt>'+ui('طريقة الحساب','Account method')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.account||'يُؤكد قبل الدفع','account'))+'</dd></div>'+
        '<div><dt>'+ui('التفعيل','Activation')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.activation||'يُؤكد قبل الدفع','activation'))+'</dd></div>'+
        '<div><dt>'+ui('الضمان','Warranty')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.warranty||'غير محدد','warranty'))+'</dd></div>'+
        (plan.credits?'<div><dt>'+ui('الرصيد','Credits')+'</dt><dd>'+MasterStore.escapeHtml(tr(plan.credits,'credits'))+'</dd></div>':'')+
      '</dl>'+
      (notes.length?'<div class="plan-notes"><b>'+ui('ملاحظات مهمة','Important notes')+'</b><ul>'+notes.map(n=>'<li>'+MasterStore.escapeHtml(tr(n,'note'))+'</li>').join('')+'</ul></div>':'');
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
      if(price)price.textContent=MasterStore.planMoney(plan);
    });
    renderDetails();
    updateProductMetadata();
    Locale?.apply();
  }
  document.addEventListener('masterstore:localechange',refreshLocalizedProductPrices);

  document.getElementById('buyBtn')?.addEventListener('click',()=>{
    const plan=selectedPlan();
    if(!plan)return;
    const profile=MasterStore.getProfile()||{};
    const maxQty=p.id==='gamma-account'?1:5;

    checkoutContent.innerHTML=
      '<button class="dialog-close" type="button" aria-label="'+ui('إغلاق','Close')+'">×</button>'+
      '<div class="checkout-head"><span class="eyebrow">'+ui('إتمام الطلب','Checkout')+'</span><h2 id="checkoutTitle">'+ui('بيانات التواصل','Contact details')+'</h2><p>'+ui('أدخل بياناتك لإرسال الطلب، وفريق الدعم هيتابع معاك لتأكيد التوفر والدفع.','Enter your details to send the order. Support will follow up to confirm availability and payment.')+'</p></div>'+
      '<div class="checkout-summary"><b>'+MasterStore.escapeHtml(p.name)+'</b><span>'+MasterStore.escapeHtml(tr(plan.name,'planName'))+' — '+MasterStore.escapeHtml(tr(plan.duration,'duration'))+'</span><strong>'+MasterStore.planMoney(plan)+'</strong></div>'+
      '<form id="checkoutForm" class="checkout-form">'+
        '<label><span>'+ui('الاسم','Name')+'</span><input name="name" maxlength="80" required value="'+MasterStore.escapeHtml(profile.name||'')+'" placeholder="'+ui('اسمك الكامل','Full name')+'" autocomplete="name"></label>'+
        '<label><span>'+ui('رقم واتساب','WhatsApp number')+'</span><input name="phone" maxlength="30" inputmode="tel" required value="'+MasterStore.escapeHtml(profile.phone||'')+'" placeholder="'+ui('01xxxxxxxxx','Your WhatsApp number')+'" autocomplete="tel"></label>'+
        '<label><span>'+ui('البريد الإلكتروني','Email')+'</span><input name="email" maxlength="120" type="email" required value="'+MasterStore.escapeHtml(profile.email||'')+'" placeholder="name@example.com" autocomplete="email"></label>'+
        '<label><span>'+ui('الكمية','Quantity')+'</span><select name="quantity">'+Array.from({length:maxQty},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join('')+'</select></label>'+
        '<label><span>'+ui('طريقة الدفع المفضلة','Preferred payment method')+'</span><select name="payment">'+MasterStore.paymentOptions().map(x=>'<option>'+MasterStore.escapeHtml(x)+'</option>').join('')+'</select></label>'+
        '<label class="terms-check"><input name="agree" type="checkbox" required><span>'+ui('راجعت السعر والمدة وطريقة التفعيل والضمان وأوافق على تفاصيل الباقة.','I reviewed the price, duration, activation method, and warranty and agree to the plan details.')+'</span></label>'+
        '<button class="primary full" type="submit">'+ui('إرسال الطلب على واتساب','Send order on WhatsApp')+'</button>'+
        '<small class="form-note">'+ui('بياناتك تستخدم لإتمام الطلب والتواصل معك فقط.','Your details are used only to complete the order and contact you.')+'</small>'+
      '</form>';

    Locale?.apply();
    dialog.showModal();
    checkoutContent.querySelector('.dialog-close').onclick=()=>dialog.close();

    checkoutContent.querySelector('#checkoutForm').onsubmit=(e)=>{
      e.preventDefault();
      const form=new FormData(e.currentTarget);
      const customer=MasterStore.saveProfile({
        name:form.get('name'),phone:form.get('phone'),email:form.get('email')
      });
      const qty=Number(form.get('quantity')||1);
      const total=Number(plan.price)*qty;
      const market=MasterStore.getMarket();
      const displayUnitPrice=MasterStore.planAmount(plan);
      const displayTotal=displayUnitPrice*qty;
      const order={
        id:MasterStore.createOrderId(),
        createdAt:new Date().toISOString(),
        productId:p.id,
        product:p.name,
        plan:plan.name,
        duration:plan.duration,
        quantity:qty,
        unitPrice:Number(plan.price),
        total,
        market:market.code,
        displayCurrency:market.currency,
        displayUnitPrice,
        displayTotal,
        payment:String(form.get('payment')||''),
        status:'بانتظار التأكيد',
        customer
      };
      MasterStore.saveOrder(order);

      const msg=[
        'طلب جديد من MASTER STORE',
        'رقم الطلب: '+order.id,
        'المنتج: '+order.product,
        'الباقة: '+order.plan,
        'المدة: '+order.duration,
        'الكمية: '+order.quantity,
        'الإجمالي: '+MasterStore.formatCurrency(order.displayTotal,order.displayCurrency),
        'الاسم: '+customer.name,
        'واتساب: '+customer.phone,
        'البريد: '+customer.email,
        'طريقة الدفع المفضلة: '+order.payment,
        '',
        'أرغب في تأكيد الطلب واستكمال الدفع.'
      ].join('\n');

      dialog.close();
      showToast(ui('تم تجهيز طلبك بنجاح','Your order is ready'));
      window.open('https://wa.me/201500950624?text='+encodeURIComponent(msg),'_blank','noopener');
    };
  });

  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();