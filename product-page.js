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
            '<strong>'+MasterStore.money(plan.price)+'</strong>'+
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
    "chatgpt-plus":["الوصول إلى قدرات ChatGPT المتقدمة","تحليل الملفات والصور والمستندات","المساعدة في الكتابة والبرمجة والبحث","إنشاء محتوى وأفكار بسرعة أعلى"],
    "gemini-pro":["استخدام قدرات Gemini المتقدمة","تحليل الملفات والصور والمحتوى","المساعدة في البحث والكتابة والبرمجة","إنشاء وتلخيص المحتوى والعمل على مهام متعددة"],
    "claude-pro":["نماذج Claude المتقدمة للكتابة والتحليل","التعامل مع ملفات ونصوص طويلة","مساعدة قوية في البرمجة والتفكير والتحرير","مساحة استخدام أعلى من الخطة المجانية"],
    "perplexity-pro":["بحث ذكي مدعوم بالذكاء الاصطناعي","إجابات مدعومة بمصادر","رفع وتحليل الملفات","أدوات بحث متقدمة للمعلومات والدراسة"],
    "lovable-pro":["إنشاء تطبيقات ومواقع من وصف نصي","تعديل الواجهة والمنطق باستخدام الذكاء الاصطناعي","تسريع بناء النماذج الأولية","مناسب للمشاريع والتجارب السريعة"],
    "lovable-lite":["إنشاء تطبيقات ومواقع بالذكاء الاصطناعي","رصيد Credits للاستخدام داخل المنصة","مفيد للنماذج الأولية والمشاريع الصغيرة","إمكانية التطوير والتعديل من خلال المحادثة"],
    "wink-ai":["أدوات تحسين وتحرير الصور والفيديو بالذكاء الاصطناعي","تحسين الجودة والمظهر تلقائيًا","أدوات مناسبة لصناع المحتوى","تسريع عمليات التعديل المتكررة"],
    "grok":["محادثة ومساعدة بالذكاء الاصطناعي","البحث وصياغة المحتوى والأفكار","مساعدة في البرمجة والتحليل","إنشاء وتلخيص النصوص بسرعة"],
    "gamma-plus":["إنشاء عروض تقديمية ومستندات بالذكاء الاصطناعي","تحويل الأفكار إلى شرائح منظمة","قوالب وتصميم تلقائي","تسريع إعداد العروض والمحتوى"],
    "gamma-account":["إنشاء عروض ومستندات بالذكاء الاصطناعي","10 Workspaces للعمل والتنظيم","رصيد كبير موزع على مساحات العمل","مناسب لإدارة عدة مشاريع أو عملاء"],
    "elevenlabs":["تحويل النص إلى صوت بالذكاء الاصطناعي","أصوات واقعية ومتعددة الاستخدامات","مفيد للتعليق الصوتي وصناعة المحتوى","إمكانيات توليد صوت احترافية"],
    "heygen":["إنشاء فيديوهات بالذكاء الاصطناعي","أفاتار وتقديم مرئي للمحتوى","تحويل النصوص إلى فيديو","مناسب للتسويق والشرح وصناعة المحتوى"],
    "canva-pro":["قوالب وتصاميم احترافية","أدوات تحرير وتصميم متقدمة","إزالة الخلفيات وأدوات ذكاء اصطناعي","مكتبة أصول وعناصر أكبر للتصميم"],
    "capcut-pro":["أدوات مونتاج فيديو متقدمة","مؤثرات وقوالب وميزات Pro","أدوات ذكاء اصطناعي للفيديو","مناسب لصناعة المحتوى السريع للسوشيال ميديا"],
    "figma":["تصميم واجهات وتجارب المستخدم","التعاون على ملفات التصميم","مكونات وأنظمة تصميم احترافية","مناسب للويب والتطبيقات والفرق"],
    "freepik":["الوصول إلى مكتبة ضخمة من الأصول الإبداعية","صور وVectors وPSD وموارد تصميم","أدوات ذكاء اصطناعي للتصميم","مفيد للمصممين وصناع المحتوى"],
    "duolingo":["تعلّم اللغات بتمارين تفاعلية","ممارسة يومية للمفردات والقواعد","تتبع التقدم والاستمرارية","تجربة تعلم مناسبة للمبتدئين والمتوسطين"],
    "elsa":["تدريب على النطق والمحادثة بالإنجليزية","تحليل النطق وتقديم ملاحظات","تمارين تحدث واستماع","مفيد لتحسين اللكنة والثقة في الكلام"],
    "coursera":["الوصول إلى دورات تعليمية من جامعات وشركات","التعلم في مجالات تقنية ومهنية متعددة","مشاريع وتمارين منظمة","مناسب للتعلم الذاتي وتطوير المهارات"],
    "quizizz":["إنشاء اختبارات وأنشطة تفاعلية","مشاركة الأنشطة مع الطلاب","تقارير ونتائج للتفاعل والأداء","مفيد للمعلمين والفصول الدراسية"],
    "wordwall":["إنشاء أنشطة وألعاب تعليمية تفاعلية","قوالب جاهزة قابلة للتعديل","مشاركة الأنشطة بسهولة","مناسب للدروس والمراجعة داخل الفصل"],
    "turnitin":["فحص التشابه في الملفات الأكاديمية","تقرير يوضح نسب ومصادر التشابه","مفيد للمراجعة قبل التسليم","يساعد على اكتشاف الاقتباسات المتشابهة"],
    "microsoft-365":["تطبيقات Office للإنتاجية","Word وExcel وPowerPoint وخدمات Microsoft","إنشاء وتحرير المستندات والجداول والعروض","مناسب للدراسة والعمل اليومي"],
    "notion":["تنظيم الملاحظات والمشاريع وقواعد البيانات","مساحات عمل مرنة للفرق والأفراد","إدارة المهام والمحتوى في مكان واحد","مفيد للدراسة والعمل والتخطيط"],
    "linkedin-premium":["مزايا إضافية للحساب المهني","أدوات تساعد في البحث عن فرص والعمل","رؤية أوسع لبعض بيانات الحسابات والوظائف","مفيد للتوظيف وبناء الحضور المهني"],
    "zoom":["اجتماعات فيديو بخصائص Pro","مناسب للاجتماعات والدروس أونلاين","إدارة أفضل للجلسات والمشاركين","أدوات إضافية للاستخدام المهني"],
    "stealth-writer":["إعادة صياغة وتحسين النصوص","Humanize للمحتوى المكتوب","التعامل مع نصوص طويلة حسب الخطة","مفيد للتحرير وإعادة كتابة المحتوى"],
    "icloud":["مساحة تخزين سحابية كبيرة","نسخ احتياطي للصور والملفات","مزامنة البيانات بين أجهزة Apple","مفيد لتوسيع مساحة التخزين الشخصية"],
    "surfshark":["اتصال VPN مشفر","تغيير الموقع الافتراضي","حماية أفضل على الشبكات العامة","خصوصية أكبر أثناء التصفح"],
    "nordvpn":["اتصال VPN مشفر","خوادم متعددة حول العالم","حماية أفضل للاتصال والخصوصية","مفيد للتصفح على الشبكات العامة"],
    "proton-vpn":["اتصال VPN مشفر","تعزيز الخصوصية أثناء التصفح","إمكانية استخدام خوادم متعددة","مفيد للاستخدام اليومي الآمن"],
    "hma-vpn":["اتصال VPN وتغيير الموقع الافتراضي","تشفير الاتصال أثناء التصفح","خوادم في مواقع متعددة","مفيد للخصوصية على الإنترنت"],
    "expressvpn":["VPN سريع ومشفر","خوادم في دول متعددة","حماية الخصوصية على الشبكات العامة","مناسب للتصفح والاستخدام اليومي"],
    "spotify":["استماع بدون إعلانات","تنزيل الموسيقى للاستماع دون إنترنت","تحكم كامل في التشغيل","جودة وتجربة أفضل من الخطة المجانية"],
    "youtube":["مشاهدة YouTube بدون إعلانات","تشغيل في الخلفية","تنزيل الفيديوهات للمشاهدة دون إنترنت","يتضمن مزايا YouTube Music Premium حسب الخطة"],
    "manus":["تنفيذ مهام متعددة الخطوات بالذكاء الاصطناعي","البحث وجمع المعلومات وتنظيمها","المساعدة في أتمتة سير العمل","مفيد للمهام المعقدة والمشاريع"],
    "gumloop":["أتمتة سير العمل باستخدام الذكاء الاصطناعي","ربط خطوات وأدوات متعددة","تقليل المهام اليدوية المتكررة","مناسب للأعمال والعمليات الرقمية"],
    "magic-patterns":["إنشاء واجهات من وصف نصي","توليد نماذج UI بسرعة","تسريع استكشاف أفكار التصميم","مفيد للمصممين والمطورين"],
    "factory-pro":["مساعدة الذكاء الاصطناعي في تطوير البرمجيات","تسريع كتابة وفهم الكود","مفيد للفرق والمشاريع البرمجية","أدوات لدعم سير عمل التطوير"],
    "framer-pro":["تصميم ونشر مواقع تفاعلية","بناء صفحات بدون تعقيد برمجي كبير","أدوات تصميم وحركة متقدمة","مناسب للمواقع والصفحات التسويقية"],
    "supabase-pro":["قاعدة بيانات وبنية خلفية للمشاريع","مصادقة المستخدمين وتخزين البيانات","خدمات Backend جاهزة للمطورين","مفيد لبناء التطبيقات بسرعة"],
    "railway-hobby":["نشر وتشغيل التطبيقات والخدمات","إدارة بيئات ومشاريع من لوحة واحدة","مناسب للمطورين والمشاريع التجريبية","تبسيط عمليات الاستضافة والنشر"],
    "pangram-pro":["تحليل النصوص والمحتوى","أدوات احترافية للعمل على الكتابة","مفيد للمراجعة والتحرير","يساعد على تحسين سير عمل المحتوى"],
    "supercut-pro":["أدوات لصناعة وتحرير المحتوى","تسريع تجهيز المقاطع والمحتوى المرئي","خصائص Pro إضافية","مناسب لصناع المحتوى"],
    "wispr-flow-pro":["تحويل الكلام إلى نص أثناء العمل","إملاء صوتي سريع","تقليل الحاجة للكتابة اليدوية","مفيد للرسائل والمستندات والعمل اليومي"],
    "mobbin-team":["مكتبة كبيرة لواجهات وتجارب المستخدم","مراجع لتصميم التطبيقات والمواقع","مفيد للبحث والإلهام التصميمي","يساعد الفرق على دراسة أنماط UX/UI"],
    "granola-business":["تدوين وتنظيم ملاحظات الاجتماعات","مساعدة بالذكاء الاصطناعي في تلخيص النقاط","استخراج أهم المعلومات والمتابعة","مفيد للفرق والاجتماعات المهنية"],
    "jam-team":["تسجيل مشكلات المواقع بصريًا","مشاركة الأخطاء مع الفريق بسرعة","تسهيل التواصل بين التصميم والتطوير","مفيد لتوثيق ومتابعة الـbugs"],
    "readwise-reader":["حفظ المقالات والمحتوى للقراءة لاحقًا","تنظيم الملاحظات والاقتباسات","مراجعة المعرفة بشكل منظم","تجميع مصادر القراءة في مكان واحد"],
    "waking-up":["محتوى تأمل ووعي ذهني","جلسات ودروس منظمة","مكتبة صوتية للتدريب الذهني","مناسب لبناء روتين تأمل منتظم"],
    "linear-business":["إدارة المشاريع والمهام للفرق","تتبع الـissues وسير العمل","تنظيم التخطيط والتنفيذ","مناسب لفرق المنتج والتطوير"],
    "posthog-scale":["تحليلات استخدام المنتج","فهم سلوك المستخدمين داخل التطبيق","تقارير وتجارب لتحسين المنتج","مفيد لفرق المنتج والنمو"],
    "customerio-essentials":["إرسال رسائل آلية للعملاء","بناء حملات وتدفقات تواصل","تقسيم الجمهور حسب السلوك","مفيد للتسويق والـcustomer engagement"]
  };

  function renderDetails(){
    const plan=selectedPlan();
    if(!plan){planDetails.innerHTML='';return;}
    const notes=[...(p.notes||[]),...(plan.notes||[])];
    const features=[...(serviceFeatures[p.id]||[]),...(p.features||[]),...(plan.features||[])];
    const saving=plan.oldPrice&&Number(plan.oldPrice)>Number(plan.price)?Number(plan.oldPrice)-Number(plan.price):0;
    planDetails.innerHTML=
      '<dl class="details-list">'+
        '<div><dt>السعر</dt><dd>'+MasterStore.money(plan.price)+'</dd></div>'+
        (plan.oldPrice?'<div><dt>السعر قبل العرض</dt><dd><del>'+MasterStore.money(plan.oldPrice)+'</del>'+(saving?' <strong class="saving">وفر '+MasterStore.money(saving)+'</strong>':'')+'</dd></div>':'')+
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
      '<div class="checkout-summary"><b>'+MasterStore.escapeHtml(p.name)+'</b><span>'+MasterStore.escapeHtml(plan.name)+' — '+MasterStore.escapeHtml(plan.duration)+'</span><strong>'+MasterStore.money(plan.price)+'</strong></div>'+
      '<form id="checkoutForm" class="checkout-form">'+
        '<label><span>الاسم</span><input name="name" maxlength="80" required value="'+MasterStore.escapeHtml(profile.name||'')+'" placeholder="اسمك الكامل" autocomplete="name"></label>'+
        '<label><span>رقم واتساب</span><input name="phone" maxlength="30" inputmode="tel" required value="'+MasterStore.escapeHtml(profile.phone||'')+'" placeholder="01xxxxxxxxx" autocomplete="tel"></label>'+
        '<label><span>البريد الإلكتروني</span><input name="email" maxlength="120" type="email" required value="'+MasterStore.escapeHtml(profile.email||'')+'" placeholder="name@example.com" autocomplete="email"></label>'+
        '<label><span>الكمية</span><select name="quantity">'+Array.from({length:maxQty},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join('')+'</select></label>'+
        '<label><span>طريقة الدفع المفضلة</span><select name="payment"><option>InstaPay</option><option>Vodafone Cash</option><option>Binance / USDT</option></select></label>'+
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
        'الإجمالي: '+MasterStore.money(order.total),
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