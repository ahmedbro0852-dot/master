const products = [
  {
    id:"chatgpt-plus", name:"ChatGPT Plus", category:"AI Tools", logo:"chatgpt", status:"available",
    description:"تفعيل ChatGPT Plus على حساب العميل الشخصي.",
    plans:[{name:"ChatGPT Plus", duration:"المدة تُؤكد قبل الدفع", price:1100, activation:"تفعيل مباشر على حساب العميل؛ الدفع يتم بواسطة المتجر.", account:"حساب شخصي", warranty:"غير محدد", notes:["لا يتم تخزين بيانات دخولك داخل الموقع."]}]
  },
  {
    id:"claude-pro", name:"Claude Pro", category:"AI Tools", logo:"claude", status:"available",
    description:"تفعيل Claude على حسابك الشخصي باستخدام وسيلة دفع المتجر.",
    plans:[{name:"Claude Pro", duration:"المدة تُؤكد قبل الدفع", price:1250, activation:"تفعيل على حساب العميل الشخصي.", account:"حساب شخصي", warranty:"غير محدد", notes:["السعر خاص بعرض المتجر الحالي."]}]
  },
  {
    id:"perplexity-pro", name:"Perplexity Pro", category:"AI Tools", logo:"perplexity", status:"available",
    description:"حساب خاص جاهز مع ضمان كامل حسب عرض المتجر.",
    plans:[{name:"Perplexity Pro", duration:"المدة غير محددة", price:550, activation:"تسليم البريد وكلمة المرور، وقد يرسل المتجر كود الدخول عند الحاجة.", account:"حساب خاص جاهز", warranty:"ضمان كامل", notes:["يفضل عدم تغيير كلمة المرور حتى لا تتأثر خدمة الدعم/الضمان."]}]
  },
  {
    id:"lovable-pro", name:"Lovable Pro", category:"AI Tools", logo:"lovable", status:"available",
    description:"اشتراك Lovable Pro لمدة 12 شهر.",
    plans:[{name:"Pro", duration:"12 شهر", price:1800, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد", notes:["طريقة التسليم والضمان يتم تأكيدهما قبل التحويل."]}]
  },
  {
    id:"lovable-lite", name:"Lovable Pro Lite", category:"AI Tools", logo:"lovable", status:"available",
    description:"خطة سنوية برصيد أساسي مع Credits يومية.",
    plans:[{name:"Pro Lite", duration:"12 شهر", price:650, oldPrice:750, activation:"رابط تفعيل على البريد الشخصي — بدون بطاقة.", account:"حساب العميل", warranty:"غير محدد", credits:"300 Credit + 5 Credits يوميًا لمدة سنة"}]
  },
  {
    id:"runway-pro", name:"Runway Pro", category:"AI Tools", logo:"runway", status:"available",
    description:"اشتراك Runway Pro لمدة 12 شهر.",
    plans:[{name:"Pro", duration:"12 شهر", price:1600, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}]
  },
  {
    id:"wink-ai", name:"Wink AI Pro", category:"AI Tools", logo:"wink", status:"available",
    description:"حساب جاهز لأدوات Wink AI.",
    plans:[
      {name:"7 أيام", duration:"7 أيام", price:150, activation:"بريد + كلمة مرور — بدون كود حسب العرض.", account:"حساب جاهز", warranty:"غير محدد"},
      {name:"شهر", duration:"1 شهر", price:400, activation:"حساب جاهز؛ التفاصيل تُؤكد قبل الدفع.", account:"حساب جاهز", warranty:"غير محدد"}
    ]
  },
  {
    id:"grok", name:"Grok", category:"AI Tools", logo:"grok", status:"available",
    description:"حساب Grok جاهز لمدة قصيرة بسعر عرض.",
    plans:[{name:"عرض 10 أيام", duration:"10 أيام", price:150, oldPrice:250, activation:"بريد + كلمة مرور.", account:"حساب جاهز", warranty:"5 أيام"}]
  },
  {
    id:"gamma-plus", name:"Gamma Plus", category:"AI Tools", logo:"gamma", status:"available",
    description:"حساب Gamma Plus جاهز.",
    plans:[{name:"Plus", duration:"1 شهر", price:400, activation:"تسليم حساب جاهز.", account:"حساب جاهز", warranty:"ضمان كامل"}]
  },
  {
    id:"gamma-account", name:"Gamma Account", category:"AI Tools", logo:"gamma", status:"available",
    description:"حساب واحد يحتوي على 10 Workspaces، كل Workspace به 2,000 Credit.",
    plans:[{name:"10 Workspaces", duration:"المدة غير محددة", price:800, activation:"تسليم حساب جاهز.", account:"حساب واحد — الحد الأقصى للكمية 1", warranty:"دعم Upgrade كامل مرة واحدة خلال أول شهر", credits:"20,000 Credit إجماليًا", notes:["غيّر كلمة المرور فور الاستلام.","لا يوجد ضمان لنسيان كلمة المرور.","لـ Upgrade كامل قد يلزم تزويد الدعم بكلمة المرور، ويتم التنفيذ خلال 3 أيام.","لا تترك أي Workspace بدون إذن لأن ذلك قد يفقدك صلاحيات العرض."]}]
  },
  {
    id:"elevenlabs", name:"ElevenLabs", category:"AI Tools", logo:"elevenlabs", status:"available",
    description:"حساب ElevenLabs جاهز مع Credits الخطة.",
    plans:[{name:"خطة شهر", duration:"1 شهر", price:550, activation:"تسليم حساب جاهز.", account:"حساب جاهز", warranty:"غير محدد", credits:"Credits الخطة — العدد الدقيق يُؤكد قبل الدفع"}]
  },
  {
    id:"heygen", name:"HeyGen", category:"AI Tools", logo:"heygen", status:"available",
    description:"حساب HeyGen جاهز مع 1,250 Credit.",
    plans:[{name:"1,250 Credits", duration:"1 شهر", price:1250, activation:"تسليم حساب جاهز خلال 5–6 ساعات.", account:"حساب جاهز", warranty:"غير محدد", credits:"1,250 Credit"}]
  },
  {
    id:"canva-pro", name:"Canva Pro", category:"التصميم", logo:"canva", status:"available",
    description:"تفعيل Canva Pro على البريد الشخصي.",
    plans:[{name:"Canva Pro", duration:"3 سنوات", price:50, activation:"تفعيل على البريد الشخصي خلال وقت قصير.", account:"حساب العميل", warranty:"سنتان"}]
  },
  {
    id:"capcut-pro", name:"CapCut Pro", category:"التصميم", logo:"capcut", status:"available",
    description:"حسابات CapCut Pro جاهزة بعدة مدد وCredits مختلفة.",
    plans:[
      {name:"7 أيام", duration:"7 أيام", price:50, activation:"بريد + كلمة مرور؛ قد يطلب كود دخول.", account:"حساب جاهز", warranty:"غير محدد", credits:"قد لا يوجد Credits أو تكون قليلة", notes:["لا يوجد اعتراض على عدم وجود Credits في باقة 7 أيام."]},
      {name:"شهر", duration:"1 شهر", price:150, activation:"بريد + كلمة مرور؛ قد يطلب كود دخول.", account:"حساب جاهز", warranty:"غير محدد", credits:"عادةً 500 Credit", notes:["يمكن الاعتراض إذا كان الرصيد المتفق عليه غير موجود."]},
      {name:"شهر — 1600 Credits", duration:"1 شهر", price:300, activation:"بريد + كلمة مرور؛ قد يطلب كود دخول.", account:"حساب جاهز", warranty:"غير محدد", credits:"1,600 Credit", notes:["يمكن الاعتراض إذا كان الرصيد المتفق عليه غير موجود."]},
      {name:"3 شهور", duration:"3 شهور", price:550, activation:"بريد + كلمة مرور؛ قد يطلب كود دخول.", account:"حساب جاهز", warranty:"غير محدد", credits:"يتغير عادةً بين 500–1000"},
      {name:"6 شهور", duration:"6 شهور", price:950, activation:"بريد + كلمة مرور؛ قد يطلب كود دخول.", account:"حساب جاهز", warranty:"غير محدد", credits:"500–1000 Credit شهريًا"},
      {name:"سنة", duration:"12 شهر", price:1400, activation:"بريد + كلمة مرور؛ قد يطلب كود دخول.", account:"حساب جاهز", warranty:"غير محدد", credits:"يتغير عادةً بين 500–1000"}
    ],
    notes:["يفضل عدم تغيير كلمة المرور في الحسابات الجاهزة إلا على مسؤوليتك."]
  },
  {
    id:"figma", name:"Figma", category:"التصميم", logo:"figma", status:"available",
    description:"اشتراك Figma لمدة 12 شهر.",
    plans:[{name:"12 شهر", duration:"12 شهر", price:750, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}]
  },
  {
    id:"freepik", name:"Freepik", category:"التصميم", logo:"freepik", status:"available",
    description:"خدمة تحميل ملفات Freepik فقط — لا يتم تسليم حساب.",
    plans:[{name:"خدمة تحميل", duration:"1 شهر", price:450, activation:"ترسل روابط الملفات المطلوبة للمتجر.", account:"خدمة تحميل ملفات", warranty:"غير محدد", notes:["ليست خدمة تسليم حساب كامل.","عدد/حدود التحميل تُؤكد قبل الدفع."]}]
  },
  {
    id:"adobe-cc", name:"Adobe Creative Cloud", category:"التصميم", logo:"adobe", status:"out",
    description:"المخزون غير متوفر حاليًا.", plans:[]
  },
  {
    id:"duolingo", name:"Duolingo", category:"التعليم", logo:"duolingo", status:"available",
    description:"اشتراك سنة على البريد الشخصي.",
    plans:[{name:"سنة", duration:"12 شهر", price:300, activation:"رابط تفعيل على البريد الشخصي — بدون بطاقة.", account:"حساب العميل", warranty:"غير محدد"}]
  },
  {
    id:"elsa", name:"ELSA Speak", category:"التعليم", logo:"elsa", status:"available",
    description:"اشتراك ELSA Speak للتدريب على النطق والمحادثة.",
    plans:[
      {name:"7 أيام", duration:"7 أيام", price:90, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"},
      {name:"12 شهر", duration:"12 شهر", price:1900, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}
    ]
  },
  {
    id:"coursera", name:"Coursera", category:"التعليم", logo:"coursera", status:"available",
    description:"خيارات Coursera بمدد وأنواع حساب مختلفة.",
    plans:[
      {name:"3 شهور", duration:"3 شهور", price:300, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"},
      {name:"سنة — حساب مشترك", duration:"12 شهر", price:300, activation:"تسليم حساب مشترك.", account:"حساب مشترك", warranty:"غير محدد", notes:["قد تكون بعض الدورات مؤهلة لشهادة باسمك، لكن المتجر لا يضمن الشهادات في الحساب المشترك."]},
      {name:"سنة — حساب خاص", duration:"12 شهر", price:1000, activation:"تسليم حساب خاص.", account:"حساب خاص", warranty:"غير محدد"}
    ]
  },
  {
    id:"quizizz", name:"Quizizz", category:"التعليم", logo:"quizizz", status:"available",
    description:"اشتراك Quizizz على بريد العميل.",
    plans:[{name:"12 شهر", duration:"12 شهر", price:1500, activation:"تفعيل على البريد الشخصي.", account:"حساب العميل", warranty:"غير محدد"}]
  },
  {
    id:"wordwall", name:"Wordwall Pro", category:"التعليم", logo:"wordwall", status:"available",
    description:"اشتراك Wordwall Pro لمدة شهر أو سنة.",
    plans:[
      {name:"شهر", duration:"1 شهر", price:300, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"},
      {name:"سنة", duration:"12 شهر", price:1050, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}
    ]
  },
  {
    id:"turnitin", name:"Turnitin", category:"التعليم", logo:"turnitin", status:"available",
    description:"خدمة فحص ملف واحد وإرسال تقرير التشابه.",
    plans:[{name:"فحص ملف", duration:"ملف واحد", price:250, activation:"ترسل الملف المطلوب فحصه.", account:"خدمة ملف — بدون حساب", warranty:"غير محدد", notes:["الخدمة لا تضمن درجة أكاديمية أو نتيجة معينة."]}]
  },
  {
    id:"microsoft-365", name:"Microsoft 365", category:"الإنتاجية", logo:"microsoft", status:"available",
    description:"اشتراك Microsoft 365 لمدة سنة.",
    plans:[{name:"سنة", duration:"12 شهر", price:200, activation:"طريقة التفعيل تُؤكد قبل الدفع.", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}]
  },
  {
    id:"notion", name:"Notion", category:"الإنتاجية", logo:"notion", status:"available",
    description:"خطط Notion Plus وBusiness بمدد مختلفة.",
    plans:[
      {name:"Plus — 3 شهور", duration:"3 شهور", price:400, activation:"تفعيل على البريد الشخصي أو حساب جاهز؛ قد يحتاج OTP.", account:"شخصي أو جاهز", warranty:"غير محدد"},
      {name:"Business — 6 شهور", duration:"6 شهور", price:600, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"},
      {name:"Business — 12 شهر", duration:"12 شهر", price:950, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}
    ]
  },
  {
    id:"linkedin-premium", name:"LinkedIn Premium", category:"الإنتاجية", logo:"linkedin", status:"available",
    description:"تفعيل Premium على الحساب الشخصي عبر رابط يستخدم مرة واحدة.",
    plans:[{name:"3 شهور", duration:"3 شهور", price:250, activation:"رابط تفعيل لمرة واحدة ويتطلب بطاقة.", account:"حساب شخصي", warranty:"غير محدد", notes:["بعد فتح/استخدام رابط التفعيل يُعتبر مستهلكًا ولا يمكن إعادة استخدامه."]}]
  },
  {
    id:"zoom", name:"Zoom", category:"الإنتاجية", logo:"zoom", status:"available",
    description:"خيارات Zoom بحساب جاهز أو تفعيل على بريدك.",
    plans:[
      {name:"شهر — حساب جاهز", duration:"1 شهر", price:250, activation:"تسليم حساب جاهز.", account:"حساب جاهز", warranty:"ضمان كامل", notes:["قد تعمل بعض الحسابات شهرًا كاملًا أو تتوقف بعد نحو 14 يومًا؛ الضمان الكامل يغطي العرض حسب شروط المتجر."]},
      {name:"3 شهور", duration:"3 شهور", price:550, activation:"التسليم يُؤكد قبل الدفع.", account:"يُؤكد قبل الدفع", warranty:"غير محدد"},
      {name:"سنة", duration:"12 شهر", price:1800, activation:"التسليم يُؤكد قبل الدفع.", account:"يُؤكد قبل الدفع", warranty:"ضمان كامل"},
      {name:"شهر — على بريدك", duration:"1 شهر", price:300, activation:"تفعيل على بريد العميل.", account:"حساب العميل", warranty:"غير محدد"}
    ]
  },
  {
    id:"stealth-writer", name:"Stealth Writer", category:"الإنتاجية", logo:"stealthwriter", status:"available",
    description:"خدمة Humanize وإعادة صياغة النصوص.",
    plans:[{name:"شهر", duration:"1 شهر", price:400, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد", credits:"حتى 10 Humanize يوميًا، وحتى 5,000 كلمة للعملية", notes:["لا يوجد ضمان 100% لتجاوز كل أدوات كشف المحتوى بالذكاء الاصطناعي."]}]
  },
  {
    id:"icloud", name:"iCloud 4TB", category:"الإنتاجية", logo:"icloud", status:"available",
    description:"عرض مساحة iCloud إجمالية 4TB.",
    plans:[{name:"4TB", duration:"المدة غير محددة", price:1450, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}]
  },
  {
    id:"surfshark", name:"Surfshark", category:"VPN والحماية", logo:"surfshark", status:"available",
    description:"كوبون Surfshark لمدة شهرين.",
    plans:[{name:"كوبون شهرين", duration:"2 شهر", price:200, activation:"تفعيل كوبون ويتطلب بطاقة.", account:"حساب العميل", warranty:"No Hold Warranty"}]
  },
  {
    id:"nordvpn", name:"NordVPN", category:"VPN والحماية", logo:"nordvpn", status:"available",
    description:"اشتراك NordVPN لمدة 3 شهور.",
    plans:[{name:"3 شهور", duration:"3 شهور", price:300, activation:"لا يحتاج بطاقة؛ طريقة التسليم تُؤكد قبل الدفع.", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}]
  },
  {
    id:"proton-vpn", name:"Proton VPN", category:"VPN والحماية", logo:"protonvpn", status:"available",
    description:"حساب Proton VPN لمدة سنة لجهاز واحد.",
    plans:[{name:"سنة", duration:"12 شهر", price:800, activation:"تسليم بريد/حساب جاهز مع كود يقدمه المتجر عند الحاجة.", account:"حساب جاهز — جهاز واحد", warranty:"غير محدد"}]
  },
  {
    id:"hma-vpn", name:"HMA VPN", category:"VPN والحماية", logo:"hma", status:"available",
    description:"عرض HMA قصير المدة.",
    plans:[{name:"عرض HMA", duration:"30d - 20d (صياغة المورد؛ تُحدد المدة الفعلية قبل الدفع)", price:100, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}]
  },
  {
    id:"expressvpn", name:"ExpressVPN", category:"VPN والحماية", logo:"expressvpn", status:"available",
    description:"اشتراك ExpressVPN قصير المدة.",
    plans:[{name:"3 أيام", duration:"3 أيام", price:50, activation:"يُؤكد قبل الدفع", account:"يُؤكد قبل الدفع", warranty:"غير محدد"}]
  },
  {
    id:"spotify", name:"Spotify Premium", category:"الترفيه", logo:"spotify", status:"available",
    description:"تفعيل Spotify Premium على حساب العميل الشخصي.",
    plans:[{name:"3 شهور", duration:"3 شهور", price:100, activation:"رابط تفعيل على حساب العميل.", account:"حساب شخصي", warranty:"ضمان كامل"}]
  },
  {
    id:"youtube", name:"YouTube Premium", category:"الترفيه", logo:"youtube", status:"available",
    description:"تفعيل YouTube Premium على حسابك الشخصي.",
    plans:[{name:"3 شهور", duration:"3 شهور", price:200, activation:"رابط تفعيل ويتطلب بطاقة.", account:"حساب شخصي", warranty:"غير محدد"}]
  },
  {id:"adobe-out", name:"Adobe Creative Cloud", category:"التصميم", logo:"adobe", status:"out", description:"المخزون منتهٍ حاليًا.", plans:[]},
  {id:"kling", name:"Kling AI", category:"AI Tools", logo:"kling", status:"out", description:"المخزون منتهٍ حاليًا.", plans:[]},
  {id:"grammarly", name:"Grammarly Premium", category:"الإنتاجية", logo:"grammarly", status:"soon", description:"قريبًا في MASTER STORE.", plans:[]},
  {id:"quillbot", name:"QuillBot Premium", category:"الإنتاجية", logo:"quillbot", status:"soon", description:"قريبًا في MASTER STORE.", plans:[]},
  {id:"envato", name:"Envato Elements", category:"التصميم", logo:"envato", status:"soon", description:"قريبًا في MASTER STORE.", plans:[]},
  {id:"motion-array", name:"Motion Array", category:"التصميم", logo:"motionarray", status:"soon", description:"قريبًا في MASTER STORE.", plans:[]},
  {id:"suno", name:"Suno AI Pro", category:"AI Tools", logo:"suno", status:"soon", description:"قريبًا في MASTER STORE.", plans:[]},
  {id:"murf", name:"Murf AI", category:"AI Tools", logo:"murf", status:"soon", description:"قريبًا في MASTER STORE.", plans:[]},
  {id:"discord", name:"Discord Nitro", category:"الترفيه", logo:"discord", status:"soon", description:"قريبًا في MASTER STORE.", plans:[]}
];

const categoryOrder = ["AI Tools","التصميم","التعليم","الإنتاجية","VPN والحماية","الترفيه"];

function getProduct(id){ return products.find(p => p.id === id); }
function formatPrice(value){ return Number(value).toLocaleString("en-US") + " ج"; }
function startingPrice(product){
  if(!product.plans || !product.plans.length) return "—";
  const nums = product.plans.map(p => Number(p.price)).filter(Number.isFinite);
  if(!nums.length) return "—";
  const min = Math.min(...nums);
  return product.plans.length > 1 ? "من " + formatPrice(min) : formatPrice(min);
}
function statusLabel(status){
  return status === "available" ? "متاح" : status === "soon" ? "قريبًا" : "غير متوفر";
}
