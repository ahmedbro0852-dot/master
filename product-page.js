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

  function showToast(text){
    toast.textContent=text;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),1800);
  }

  function icon(product){
    const fallback=(product.name||'M').split(/\s+/).map(x=>x[0]).join('').slice(0,2);
    const local=product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg?v=20260923-brand4':'';
    const src=product.logoUrl||local;
    const fallbackAttr=product.logoUrl&&local?' data-fallback="'+MasterStore.escapeHtml(local)+'"':'';
    const onerror=product.logoUrl&&local
      ? "if(this.dataset.fallback&&!this.dataset.usedFallback){this.dataset.usedFallback='1';this.src=this.dataset.fallback;return;}this.style.display='none';this.nextElementSibling.style.display='grid'"
      : "this.style.display='none';this.nextElementSibling.style.display='grid'";
    return '<span class="product-logo big">'+(src?'<img src="'+MasterStore.escapeHtml(src)+'"'+fallbackAttr+' alt="'+MasterStore.escapeHtml(product.name)+'" onerror="'+onerror+'">':'')+'<span class="logo-fallback">'+fallback+'</span></span>';
  }

  if(!p){
    root.innerHTML='<section class="not-found"><h1>المنتج غير موجود</h1><p>ارجع للمتجر واختار خدمة متاحة.</p><a class="primary" href="index.html#products">العودة للمنتجات</a></section>';
    return;
  }

  document.title=p.name+' | MASTER STORE';

  const active=p.status==='available';
  const plans=p.plans||[];

  root.innerHTML=
    '<section class="product-hero">'+
      '<a class="back-link" href="index.html#products">← كل المنتجات</a>'+
      '<div class="product-title">'+icon(p)+'<div><span class="eyebrow">'+MasterStore.escapeHtml(p.category)+'</span><h1>'+MasterStore.escapeHtml(p.name)+'</h1><p>'+MasterStore.escapeHtml(p.description||'')+'</p></div></div>'+
      '<span class="status '+(p.status==='available'?'ok':p.status==='soon'?'soon':'out')+'">'+statusLabel(p.status)+'</span>'+
    '</section>'+
    '<section class="product-layout">'+
      '<div class="plans-block"><h2>اختار الباقة</h2>'+
        (plans.length?plans.map((plan,i)=>
          '<label class="plan-option">'+
            '<input type="radio" name="plan" value="'+i+'" '+(i===0?'checked':'')+' '+(!active?'disabled':'')+'>'+
            '<span><b>'+MasterStore.escapeHtml(plan.name||plan.duration)+'</b><small>'+MasterStore.escapeHtml(plan.duration||'')+'</small></span>'+
            '<strong>'+MasterStore.planMoney(plan)+'</strong>'+
          '</label>'
        ).join(''):'<div class="notice">الخدمة غير متاحة للطلب حاليًا.</div>')+
        '<div id="planFeatures"></div>'+
      '</div>'+
      '<aside class="summary-card">'+
        '<h2>تفاصيل الباقة</h2>'+
        '<div id="planDetails"></div>'+
        (active?'<button id="buyBtn" class="primary full" type="button">اطلب الباقة</button>':'<button class="primary full disabled" disabled>غير متاح حاليًا</button>')+
        '<p class="safe-note">بعد إرسال الطلب، فريق الدعم هيتواصل معاك لتأكيد التوفر وبيانات الدفع.</p>'+
      '</aside>'+
    '</section>';

  const planDetails=document.getElementById('planDetails');
  const planFeatures=document.getElementById('planFeatures');
  const radios=[...document.querySelectorAll('input[name="plan"]')];

  function selectedPlan(){
    const r=radios.find(x=>x.checked);
    return plans[Number(r?.value||0)]||null;
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

  function subscriptionFeatures(product,plan){
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
        '<div><dt>السعر</dt><dd>'+MasterStore.planMoney(plan)+'</dd></div>'+
        (plan.oldPrice?'<div><dt>السعر قبل العرض</dt><dd><del>'+MasterStore.planMoney(plan,'oldPrice')+'</del>'+(saving?' <strong class="saving">وفر '+MasterStore.formatCurrency(saving,MasterStore.getMarket().currency)+'</strong>':'')+'</dd></div>':'')+
        '<div><dt>المدة</dt><dd>'+MasterStore.escapeHtml(plan.duration||'غير محددة')+'</dd></div>'+
        '<div><dt>نوع الحساب</dt><dd>'+MasterStore.escapeHtml(plan.account||'يُؤكد قبل الدفع')+'</dd></div>'+
        '<div><dt>التفعيل</dt><dd>'+MasterStore.escapeHtml(plan.activation||'يُؤكد قبل الدفع')+'</dd></div>'+
        '<div><dt>الضمان</dt><dd>'+MasterStore.escapeHtml(plan.warranty||'غير محدد')+'</dd></div>'+
        (plan.credits?'<div><dt>الرصيد</dt><dd>'+MasterStore.escapeHtml(plan.credits)+'</dd></div>':'')+
      '</dl>'+
      (notes.length?'<div class="plan-notes"><b>ملاحظات مهمة</b><ul>'+notes.map(n=>'<li>'+MasterStore.escapeHtml(n)+'</li>').join('')+'</ul></div>':'');
    planFeatures.innerHTML=features.length?'<div class="plan-features"><b>مميزات الاشتراك</b><ul>'+features.map(n=>'<li>'+MasterStore.escapeHtml(n)+'</li>').join('')+'</ul></div>':'';
  }
  radios.forEach(r=>r.onchange=renderDetails);
  renderDetails();

  document.getElementById('buyBtn')?.addEventListener('click',()=>{
    const plan=selectedPlan();
    if(!plan)return;
    const profile=MasterStore.getProfile()||{};
    const maxQty=p.id==='gamma-account'?1:5;

    checkoutContent.innerHTML=
      '<button class="dialog-close" type="button" aria-label="إغلاق">×</button>'+
      '<div class="checkout-head"><span class="eyebrow">إتمام الطلب</span><h2>بيانات التواصل</h2><p>أدخل بياناتك لإرسال الطلب، وفريق الدعم هيتابع معاك لتأكيد التوفر والدفع.</p></div>'+
      '<div class="checkout-summary"><b>'+MasterStore.escapeHtml(p.name)+'</b><span>'+MasterStore.escapeHtml(plan.name)+' — '+MasterStore.escapeHtml(plan.duration)+'</span><strong>'+MasterStore.planMoney(plan)+'</strong></div>'+
      '<form id="checkoutForm" class="checkout-form">'+
        '<label><span>الاسم</span><input name="name" maxlength="80" required value="'+MasterStore.escapeHtml(profile.name||'')+'" placeholder="اسمك الكامل" autocomplete="name"></label>'+
        '<label><span>رقم واتساب</span><input name="phone" maxlength="30" inputmode="tel" required value="'+MasterStore.escapeHtml(profile.phone||'')+'" placeholder="01xxxxxxxxx" autocomplete="tel"></label>'+
        '<label><span>البريد الإلكتروني</span><input name="email" maxlength="120" type="email" required value="'+MasterStore.escapeHtml(profile.email||'')+'" placeholder="name@example.com" autocomplete="email"></label>'+
        '<label><span>الكمية</span><select name="quantity">'+Array.from({length:maxQty},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join('')+'</select></label>'+
        '<label><span>طريقة الدفع المفضلة</span><select name="payment">'+MasterStore.paymentOptions().map(x=>'<option>'+MasterStore.escapeHtml(x)+'</option>').join('')+'</select></label>'+
        '<label class="terms-check"><input name="agree" type="checkbox" required><span>راجعت السعر والمدة وطريقة التفعيل والضمان وأوافق على تفاصيل الباقة.</span></label>'+
        '<button class="primary full" type="submit">إرسال الطلب على واتساب</button>'+
        '<small class="form-note">بياناتك تستخدم لإتمام الطلب والتواصل معك فقط.</small>'+
      '</form>';

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
      showToast('تم تجهيز طلبك بنجاح');
      window.open('https://wa.me/201500950624?text='+encodeURIComponent(msg),'_blank','noopener');
    };
  });

  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();