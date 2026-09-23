(function(){
  'use strict';

  const PREF_KEY='masterStoreLocaleV1';
  const FX_KEY='masterStoreFxV1';
  const FX_URL='https://open.er-api.com/v6/latest/EGP';
  const COUNTRY_URL='https://ipapi.co/country/';

  // Fallback snapshot from 22 Sep 2026. Live rates are refreshed in the browser.
  const FALLBACK_RATES={
    EGP:1, AED:0.07073, LYD:0.122014, SAR:0.072222, KWD:0.005927,
    QAR:0.070104, BHD:0.007241, OMR:0.007405, JOD:0.013655,
    IQD:25.134273, MAD:0.183035, DZD:2.571678, TND:0.056325, USD:0.019257
  };

  const MARKETS={
    EG:{code:'EG',flag:'🇪🇬',nameAr:'مصر',nameEn:'Egypt',currency:'EGP'},
    LY:{code:'LY',flag:'🇱🇾',nameAr:'ليبيا',nameEn:'Libya',currency:'LYD'},
    AE:{code:'AE',flag:'🇦🇪',nameAr:'الإمارات',nameEn:'UAE',currency:'AED'},
    SA:{code:'SA',flag:'🇸🇦',nameAr:'السعودية',nameEn:'Saudi Arabia',currency:'SAR'},
    KW:{code:'KW',flag:'🇰🇼',nameAr:'الكويت',nameEn:'Kuwait',currency:'KWD'},
    QA:{code:'QA',flag:'🇶🇦',nameAr:'قطر',nameEn:'Qatar',currency:'QAR'},
    BH:{code:'BH',flag:'🇧🇭',nameAr:'البحرين',nameEn:'Bahrain',currency:'BHD'},
    OM:{code:'OM',flag:'🇴🇲',nameAr:'عُمان',nameEn:'Oman',currency:'OMR'},
    JO:{code:'JO',flag:'🇯🇴',nameAr:'الأردن',nameEn:'Jordan',currency:'JOD'},
    IQ:{code:'IQ',flag:'🇮🇶',nameAr:'العراق',nameEn:'Iraq',currency:'IQD'},
    MA:{code:'MA',flag:'🇲🇦',nameAr:'المغرب',nameEn:'Morocco',currency:'MAD'},
    DZ:{code:'DZ',flag:'🇩🇿',nameAr:'الجزائر',nameEn:'Algeria',currency:'DZD'},
    TN:{code:'TN',flag:'🇹🇳',nameAr:'تونس',nameEn:'Tunisia',currency:'TND'},
    INTL:{code:'INTL',flag:'🌍',nameAr:'دولي',nameEn:'International',currency:'USD'}
  };

  const DECIMALS={EGP:0,IQD:0,KWD:3,BHD:3,OMR:3,JOD:3,TND:3};
  const AUTO_PRICE_BUFFER=1.05;
  const SYMBOLS_AR={EGP:'ج.م',LYD:'د.ل',AED:'د.إ',SAR:'ر.س',KWD:'د.ك',QAR:'ر.ق',BHD:'د.ب',OMR:'ر.ع',JOD:'د.أ',IQD:'د.ع',MAD:'د.م',DZD:'د.ج',TND:'د.ت',USD:'$'};
  const SYMBOLS_EN={EGP:'EGP',LYD:'LYD',AED:'AED',SAR:'SAR',KWD:'KWD',QAR:'QAR',BHD:'BHD',OMR:'OMR',JOD:'JOD',IQD:'IQD',MAD:'MAD',DZD:'DZD',TND:'TND',USD:'$'};

  const exactArToEn={
    'العروض':'Offers','طريقة الطلب':'How to order','ليه MASTER STORE؟':'Why MASTER STORE?',
    'طلباتي':'My orders','تصفح العروض':'Browse offers','خدمة العملاء':'Customer support','واتساب':'WhatsApp',
    'اختار الباقة':'Choose a plan','تفاصيل الباقة':'Plan details','تفاصيل داخل المنتج':'See product details',
    'غير متاح حاليًا':'Currently unavailable','غير متوفر':'Unavailable','متاح':'Available',
    'مميزات الاشتراك':'Subscription features','السعر':'Price','السعر قبل العرض':'Before discount',
    'المدة':'Duration','نوع الحساب':'Account type','التفعيل':'Activation','الضمان':'Warranty','الرصيد':'Credits',
    'ملاحظات مهمة':'Important notes','اطلب الباقة':'Order plan','إتمام الطلب':'Checkout',
    'بيانات التواصل':'Contact details','الاسم':'Name','رقم واتساب':'WhatsApp number',
    'البريد الإلكتروني':'Email','الكمية':'Quantity','طريقة الدفع المفضلة':'Preferred payment method',
    'إرسال الطلب على واتساب':'Send order on WhatsApp','طلباتك':'Your orders','سجل الطلبات':'Order history',
    'رقم الطلب':'Order ID','الإجمالي':'Total','متابعة الطلب على واتساب':'Track order on WhatsApp',
    'تعديل البيانات':'Edit details','يبدأ من':'From','كل المنتجات':'All products',
    'العودة للمنتجات':'Back to products','المنتج غير موجود':'Product not found',
    'جاري تحميل المنتج...':'Loading product...','تأكيد الطلب':'Confirm order',
    'اختار خدمتك':'Choose your service','حدد الباقة':'Choose a plan','أرسل الطلب':'Send your order',
    'تصفح العروض وافتح الخدمة المناسبة ليك.':'Browse offers and open the service that fits you.',
    'راجع السعر والمدة وطريقة التفعيل والضمان قبل الطلب.':'Review price, duration, activation and warranty before ordering.',
    'اكتب بيانات التواصل، وفريق الدعم يتابع معاك على واتساب.':'Enter your contact details and support will follow up on WhatsApp.',
    'تفاصيل واضحة':'Clear details','ضمان مكتوب':'Written warranty','دعم مباشر':'Direct support',
    'اختيارات كتير':'More choices','طرق دفع متعددة':'Multiple payment methods','متابعة أسهل':'Easy order tracking',
    'أسعار منافسة':'Competitive pricing','ضمان واضح':'Clear warranty','طلب سريع':'Fast ordering',
    'نوع الباقة':'Plan tier','نوع الاشتراك':'Subscription type','طريقة الحساب':'Account method',
    'غير محددة':'Not specified','يُؤكد قبل الدفع':'Confirmed before payment','بانتظار التأكيد':'Pending confirmation',
    'بيانات التواصل':'Contact details','خصوصية بياناتك':'Your privacy',
    'مفيش نتيجة مطابقة.':'No matching results.','اختار منتج':'Choose a product',
    'لسه مفيش طلبات محفوظة.':'No saved orders yet.',
    'شوف الباقات':'View plans',
    'الخدمة غير متاحة للطلب حاليًا.':'This service is currently unavailable for ordering.',
    'بعد إرسال الطلب، فريق الدعم هيتواصل معاك لتأكيد التوفر وبيانات الدفع.':'After you send the order, support will confirm availability and payment details.',
    'اختار الباقة المناسبة وسيب الباقي علينا.':'Choose the right plan and we will handle the rest.',
    'اشتراكات وخدمات رقمية بأسعار مميزة ودعم مباشر قبل وبعد الطلب.':'Digital subscriptions and services at competitive prices with direct support before and after ordering.',
    'رقم الطلب هو أسرع طريقة للمتابعة مع خدمة العملاء.':'Your order ID is the fastest way to follow up with customer support.',
    'الأسماء والعلامات التجارية مملوكة لأصحابها.':'Names and trademarks belong to their respective owners.',
    'الأسماء والعلامات التجارية مملوكة لأصحابها، ولا تعني عرض المنتجات وجود شراكة رسمية مع الشركات المالكة.':'Names and trademarks belong to their respective owners. Product listings do not imply an official partnership.',
    'تعديل بيانات التواصل':'Edit contact details',
    'حدّث البيانات المستخدمة في متابعة طلباتك.':'Update the contact details used to follow up on your orders.',
    'إلغاء':'Cancel',
    'حفظ التعديلات':'Save changes',
    'لسه ماعملتش طلب':'No orders yet',
    'اختار الخدمة المناسبة، ولما ترسل أول طلب هتقدر ترجع هنا لمتابعته بسهولة.':'Choose a service and your first order will appear here for easy tracking.',
    'بيانات الطلبات محفوظة على المتصفح الحالي لتسهيل المتابعة، لذلك قد لا تظهر تلقائيًا عند استخدام جهاز مختلف.':'Order data is stored in this browser for easier tracking and may not appear automatically on another device.',
    'الأكثر طلبًا':'Most requested',
    'عروض مختارة':'Selected offers'
  };
  const exactEnToAr=Object.fromEntries(Object.entries(exactArToEn).map(([a,e])=>[e,a]));


  const PRODUCT_DESC_EN={
    "chatgpt-plus":"Activate ChatGPT Plus on the customer's personal account.",
    "gemini-pro":"Two 18-month options with the same core benefits; the family plan adds 5 extra invitations alongside the manager account.",
    "claude-pro":"Activate Claude Pro on your personal account using the store's payment method.",
    "perplexity-pro":"A ready private Perplexity Pro account with full warranty under the current store offer.",
    "lovable-pro":"A 12-month Lovable Pro subscription.",
    "lovable-lite":"An annual Lovable plan with base credits plus daily credits.",
    "runway-pro":"This service is currently unavailable.",
    "wink-ai":"A ready account for Wink AI tools.",
    "grok":"A short-term ready Grok account at a promotional price.",
    "gamma-plus":"A ready Gamma Plus account.",
    "gamma-account":"One Gamma account with 10 workspaces, each including 2,000 credits.",
    "elevenlabs":"A ready ElevenLabs account with the plan's included credits.",
    "heygen":"A ready HeyGen account with 1,250 credits.",
    "canva-pro":"Activate Canva Pro on your personal email.",
    "capcut-pro":"Ready CapCut Pro accounts with multiple durations and different credit amounts.",
    "figma":"A 12-month Figma subscription.",
    "freepik":"A ready Freepik account for one month.",
    "adobe-cc":"Currently out of stock.",
    "duolingo":"A one-year Duolingo subscription on your personal email.",
    "elsa":"ELSA Speak subscription for pronunciation and conversation practice.",
    "coursera":"Coursera options with different durations and account types.",
    "quizizz":"Quizizz subscription activated on the customer's email.",
    "wordwall":"Wordwall Pro subscription for one month or one year.",
    "turnitin":"One-file similarity check with a similarity report.",
    "microsoft-365":"A one-year Microsoft 365 subscription.",
    "notion":"Notion Plus and Business plans with different durations.",
    "linkedin-premium":"Activate LinkedIn Premium on your personal account through a one-time activation link.",
    "zoom":"Zoom Pro subscriptions with multiple durations, delivered as a ready account or activated on your email.",
    "stealth-writer":"Humanize and text rewriting service.",
    "icloud":"An iCloud storage offer with a total capacity of 4 TB.",
    "surfshark":"A two-month Surfshark coupon.",
    "nordvpn":"A three-month NordVPN subscription.",
    "proton-vpn":"A one-year Proton VPN account for one device.",
    "hma-vpn":"A short-term HMA VPN offer.",
    "expressvpn":"A short-term ExpressVPN subscription.",
    "spotify":"Activate Spotify Premium on the customer's personal account.",
    "youtube":"Activate YouTube Premium on your personal account.",
    "kling":"Currently out of stock.",
    "grammarly":"Coming soon to MASTER STORE.",
    "quillbot":"Coming soon to MASTER STORE.",
    "envato":"Coming soon to MASTER STORE.",
    "motion-array":"Coming soon to MASTER STORE.",
    "suno":"Coming soon to MASTER STORE.",
    "murf":"Coming soon to MASTER STORE.",
    "discord":"Coming soon to MASTER STORE.",
    "midjourney":"This service is currently unavailable.",
    "leonardo-ai":"This service is currently unavailable.",
    "manus":"An AI agent for executing tasks, research, and workflow organization.",
    "gumloop":"Automate workflows and connect AI-powered tasks.",
    "magic-patterns":"Create interfaces and digital experiences from text prompts.",
    "factory-pro":"A plan for developers and teams building software with AI assistance.",
    "framer-pro":"Design and publish interactive websites quickly with less complexity.",
    "supabase-pro":"Database, authentication, and backend infrastructure for digital projects.",
    "railway-hobby":"A Hobby plan for running and deploying projects and applications.",
    "pangram-pro":"Professional tools for content analysis and text workflows.",
    "supercut-pro":"A Pro plan for content creation and editing tools.",
    "wispr-flow-pro":"Smart voice dictation and speech-to-text while you work.",
    "mobbin-team":"A reference library for UI and UX design.",
    "granola-business":"AI-assisted meeting notes, organization, and follow-up.",
    "jam-team":"Record, share, and collaborate on website issues with your team.",
    "readwise-reader":"Save, organize, and review articles, books, and notes.",
    "waking-up":"Full access to the Waking Up app.",
    "linear-business":"Project and task management for teams on the Business plan.",
    "posthog-scale":"Product analytics and user behavior tools on the Scale plan.",
    "customerio-essentials":"Messaging and automated customer communication tools."
  };
  const CATEGORY_EN={
    "AI Tools":"AI Tools","التصميم":"Design","التعليم":"Education",
    "الإنتاجية":"Productivity","VPN والحماية":"VPN & Security","الترفيه":"Entertainment"
  };
  const CATALOG_EXACT_EN={
    "ضمان كامل":"Full warranty",
    "حساب العميل الشخصي":"Customer's personal account",
    "حساب العميل":"Customer account",
    "حساب شخصي":"Personal account",
    "حساب خاص":"Private account",
    "حساب خاص جاهز":"Ready private account",
    "حساب جاهز":"Ready-made account",
    "بيانات دخول الحساب":"Account login credentials",
    "إيميل وكلمة مرور":"Email and password",
    "حسب المتوفر":"Subject to availability",
    "حسب العرض":"According to the offer",
    "تفعيل على حساب العميل.":"Activation on the customer's account.",
    "تفعيل على البريد الشخصي.":"Activation on your personal email.",
    "تفعيل على بريد العميل.":"Activation on the customer's email.",
    "تفعيل مباشر على حساب Lovable":"Direct activation on the Lovable account.",
    "تسليم حساب جاهز.":"Ready account delivery.",
    "تسليم حساب جاهز":"Ready account delivery.",
    "تسليم حساب.":"Account delivery.",
    "تسليم حساب":"Account delivery.",
    "تسليم حساب خاص.":"Private account delivery.",
    "تسليم حساب مشترك.":"Shared account delivery.",
    "دعوة أو حساب":"Invitation or account",
    "دعوة أو حساب.":"Invitation or account.",
    "دعوة إلى Team.":"Team invitation.",
    "تسليم أو تفعيل":"Delivery or activation",
    "شخصي أو جاهز":"Personal or ready-made account",
    "مشاركة عائلية":"Family sharing",
    "دعوة Apple ID عبر المشاركة العائلية.":"Apple ID invitation via Family Sharing.",
    "خدمة ملف — بدون حساب":"File service — no account required",
    "حساب فردي":"Individual account",
    "حساب جاهز — جهاز واحد":"Ready account — one device",
    "حساب واحد — الحد الأقصى للكمية 1":"One account — maximum quantity: 1",
    "حساب العميل الشخصي — بدون طلب كلمة مرور Gmail":"Customer's personal account — Gmail password is not requested",
    "احتفظ بالبيانات الأصلية":"Keep the original account details",
    "احتفظ بإعدادات الفريق":"Keep the original team settings",
    "احتفظ بالبيانات الأصلية عند استلام حساب جاهز":"Keep the original credentials when receiving a ready account",
    "غير محدد":"Not specified","غير محددة":"Not specified",
    "يُؤكد قبل الدفع":"Confirmed before payment","يُحدد قبل الدفع":"Confirmed before payment",
    "يُحدد حسب المتوفر":"Subject to availability",
    "على حسابك الشخصي":"On your personal account",
    "دعوة للحساب/الفريق":"Account/team invitation",
    "خدمة بدون حساب":"No-account service",
    "مشترك":"Shared","عائلي":"Family",
    "الخدمة غير متوفرة حاليًا.":"This service is currently unavailable.",
    "المخزون غير متوفر حاليًا.":"Currently out of stock.",
    "المخزون منتهٍ حاليًا.":"Currently out of stock.",
    "قريبًا في MASTER STORE.":"Coming soon to MASTER STORE.",
    "فحص ملف":"File check","ملف واحد":"One file",
    "اشتراك كامل":"Full subscription","خطة سنوية":"Annual plan","خطة شهر":"Monthly plan",
    "حساب Freepik":"Freepik account","كوبون شهرين":"2-month coupon",
    "عرض HMA":"HMA offer","عرض 10 أيام":"10-day offer",
    "300 Credit + 5 Credits يوميًا لمدة سنة":"300 credits + 5 daily credits for one year",
    "1,000 Credit شهريًا":"1,000 credits per month",
    "1,000 Credit شهريًا لكل حساب":"1,000 credits per month for each account",
    "20,000 Credit إجماليًا":"20,000 total credits",
    "Credits الخطة — العدد الدقيق يُؤكد قبل الدفع":"Plan credits — exact amount confirmed before payment",
    "لا يتم تخزين بيانات دخولك داخل الموقع.":"Your login credentials are not stored on this website.",
    "السعر خاص بعرض المتجر الحالي.":"This price applies to the current store offer.",
    "يفضل عدم تغيير كلمة المرور حتى لا تتأثر خدمة الدعم/الضمان.":"Avoid changing the password so support and warranty coverage are not affected.",
    "طريقة التسليم والضمان يتم تأكيدهما قبل التحويل.":"Delivery and warranty details are confirmed before payment.",
    "غيّر كلمة المرور فور الاستلام.":"Change the password immediately after delivery.",
    "لا يوجد ضمان لنسيان كلمة المرور.":"Password loss is not covered by warranty.",
    "لا يوجد اعتراض على عدم وجود Credits في باقة 7 أيام.":"The 7-day plan does not guarantee included credits.",
    "يمكن الاعتراض إذا كان الرصيد المتفق عليه غير موجود.":"Contact support if the agreed credit balance is missing.",
    "الخدمة لا تضمن درجة أكاديمية أو نتيجة معينة.":"The service does not guarantee a specific academic grade or result.",
    "بعد فتح/استخدام رابط التفعيل يُعتبر مستهلكًا ولا يمكن إعادة استخدامه.":"Once the activation link is opened or used, it is consumed and cannot be reused.",
    "لا يوجد ضمان 100% لتجاوز كل أدوات كشف المحتوى بالذكاء الاصطناعي.":"There is no 100% guarantee of bypassing every AI-content detector."
  };
  function catalogText(value,kind,productId){
    const raw=String(value??"");
    if(state.language!=="en"||!raw)return raw;
    if(kind==="description"&&PRODUCT_DESC_EN[productId])return PRODUCT_DESC_EN[productId];
    if(kind==="category")return CATEGORY_EN[raw]||raw;
    if(CATALOG_EXACT_EN[raw])return CATALOG_EXACT_EN[raw];
    let s=raw
      .replace(/(\d+)\s*أيام?/g,"$1 days")
      .replace(/(\d+)\s*يوم/g,"$1 days")
      .replace(/(\d+)\s*شهور?/g,"$1 months")
      .replace(/(\d+)\s*شهر/g,"$1 months")
      .replace(/(\d+)\s*سنوات?/g,"$1 years")
      .replace(/(\d+)\s*سنة/g,"$1 years")
      .replace(/حساب خاص/g,"Private account")
      .replace(/حساب مشترك/g,"Shared account")
      .replace(/حساب جاهز/g,"Ready account")
      .replace(/حساب العميل/g,"Customer account")
      .replace(/البريد الشخصي/g,"personal email")
      .replace(/بريد العميل/g,"customer email")
      .replace(/بدون بطاقة/g,"no card required")
      .replace(/ضمان كامل/g,"Full warranty")
      .replace(/شهريًا/g,"per month")
      .replace(/يوميًا/g,"daily")
      .replace(/لكل حساب/g,"for each account")
      .replace(/دعوات عائلية/g,"family invitations")
      .replace(/العائلي/g,"Family")
      .replace(/عرض/g,"Offer");
    if(!/[\u0600-\u06FF]/.test(s))return s;
    const fallback={
      planName:"Standard plan",
      duration:"Selected subscription term",
      activation:"Activation or delivery details are confirmed before payment.",
      account:"Account type is confirmed before payment.",
      accountType:"Account type is confirmed before payment.",
      warranty:"Warranty details are confirmed before payment.",
      credits:"Plan credits are confirmed before payment.",
      note:"Important usage terms apply; confirm the details with support before payment.",
      feature:"Premium feature included with the selected plan.",
      status:"Unavailable"
    };
    return fallback[kind]||s.replace(/[\u0600-\u06FF]+/g,"").replace(/\s{2,}/g," ").trim()||"Details confirmed before payment.";
  }

  let state={market:'EG',language:'ar',rates:{...FALLBACK_RATES},rateSource:'fallback'};
  let applying=false;

  function safeJSON(value,fallback){try{return JSON.parse(value);}catch{return fallback;}}
  function getPref(){return safeJSON(localStorage.getItem(PREF_KEY),{});}
  function savePref(extra){
    const prev=getPref();
    localStorage.setItem(PREF_KEY,JSON.stringify({...prev,market:state.market,language:state.language,...extra}));
  }
  function marketFromCountry(code){
    const c=String(code||'').trim().toUpperCase();
    return MARKETS[c]?c:'INTL';
  }
  function inferCountry(){
    const locale=(navigator.languages&&navigator.languages[0])||navigator.language||'';
    const m=locale.match(/[-_]([A-Za-z]{2})$/);
    return m?m[1].toUpperCase():'';
  }
  function currentMarket(){return MARKETS[state.market]||MARKETS.INTL;}
  function currencyRate(currency){return Number(state.rates[currency]||FALLBACK_RATES[currency]||1);}
  function decimalCount(currency){return DECIMALS[currency]??2;}

  function formatCurrency(amount,currency,language){
    const n=Number(amount)||0;
    const digits=decimalCount(currency);
    const formatted=n.toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits});
    const lang=language||state.language;
    const symbol=(lang==='ar'?SYMBOLS_AR:SYMBOLS_EN)[currency]||currency;
    if(currency==='USD') return '$'+formatted;
    return lang==='ar'?formatted+' '+symbol:symbol+' '+formatted;
  }

  function convertEGP(value,marketCode){
    const market=MARKETS[marketCode||state.market]||MARKETS.INTL;
    return Number(value||0)*currencyRate(market.currency);
  }

  function smartStep(amount,currency){
    const n=Math.abs(Number(amount)||0);
    if(currency==='EGP')return 1;
    if(currency==='IQD'){
      if(n<1000)return 50;
      if(n<10000)return 100;
      return 500;
    }
    if(['KWD','BHD','OMR','JOD'].includes(currency)){
      if(n<2)return 0.025;
      if(n<10)return 0.05;
      if(n<50)return 0.10;
      return 0.25;
    }
    if(currency==='TND'){
      if(n<5)return 0.10;
      if(n<20)return 0.25;
      if(n<100)return 0.50;
      return 1;
    }
    if(n<5)return 0.25;
    if(n<20)return 0.50;
    if(n<100)return 1;
    if(n<500)return 5;
    return 10;
  }

  function roundUpSmart(amount,currency){
    const n=Number(amount)||0;
    if(n<=0)return 0;
    const step=smartStep(n,currency);
    const rounded=Math.ceil((n-1e-9)/step)*step;
    return Number(rounded.toFixed(decimalCount(currency)));
  }

  function autoMarketAmount(value,marketCode){
    const market=MARKETS[marketCode||state.market]||MARKETS.INTL;
    if(market.code==='EG')return Number(value)||0;
    return roundUpSmart(convertEGP(value,market.code)*AUTO_PRICE_BUFFER,market.currency);
  }

  function money(value){
    const market=currentMarket();
    return formatCurrency(autoMarketAmount(value,market.code),market.currency);
  }

  // Manual country prices always win. Otherwise use live FX + 5% safety buffer + smart rounding.
  function planAmount(plan,key){
    if(!plan)return 0;
    const k=key||'price';
    const table=k==='oldPrice'?plan.marketOldPrices:plan.marketPrices;
    if(table&&table[state.market]!=null) return Number(table[state.market])||0;
    return autoMarketAmount(plan[k]||0,state.market);
  }
  function planMoney(plan,key){
    return formatCurrency(planAmount(plan,key),currentMarket().currency);
  }

  function t(key){
    const dict={
      ar:{
        market:'الدولة والعملة',language:'اللغة',auto:'تلقائي',
        localPayment:'طريقة دفع محلية — بعد التأكيد',ordersPrivacy:'العملة محفوظة وقت الطلب'
      },
      en:{
        market:'Country & currency',language:'Language',auto:'Auto',
        localPayment:'Local payment method — confirmed by support',ordersPrivacy:'Currency saved at checkout'
      }
    };
    return (dict[state.language]&&dict[state.language][key])||key;
  }

  function emit(){
    document.dispatchEvent(new CustomEvent('masterstore:localechange',{detail:getState()}));
  }
  function getState(){
    const m=currentMarket();
    return {market:m.code,currency:m.currency,language:state.language,rates:{...state.rates},rateSource:state.rateSource};
  }

  function updateDocumentDirection(){
    const en=state.language==='en';
    document.documentElement.lang=en?'en':'ar';
    document.documentElement.dir=en?'ltr':'rtl';
  }

  function translateExactText(root){
    if(!root)return;
    const map=state.language==='en'?exactArToEn:exactEnToAr;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        const p=node.parentElement;
        if(!p||['SCRIPT','STYLE','NOSCRIPT','TEXTAREA'].includes(p.tagName))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const raw=node.nodeValue;
      const trimmed=raw.trim();
      if(!trimmed||!map[trimmed])return;
      const lead=(raw.match(/^\s*/)||[''])[0];
      const tail=(raw.match(/\s*$/)||[''])[0];
      node.nodeValue=lead+map[trimmed]+tail;
    });
  }

  function setText(selector,ar,en){
    const el=document.querySelector(selector);
    if(el)el.textContent=state.language==='en'?en:ar;
  }
  function setHTML(selector,ar,en){
    const el=document.querySelector(selector);
    if(el)el.innerHTML=state.language==='en'?en:ar;
  }

  function applyStaticTranslations(){
    const en=state.language==='en';
    const offer=document.querySelector('.offer-bar');
    if(offer){
      const a=offer.querySelector('a');
      const href=a?a.getAttribute('href'):'#products';
      offer.innerHTML=(en?'Up to 90% off selected offers ':'خصومات تصل إلى 90% على عروض مختارة ')+
        '<a href="'+href+'">'+(en?'Browse offers':'تصفح العروض')+'</a>';
    }
    document.querySelectorAll('.topbar nav a').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(href.includes('#products'))a.textContent=en?'Offers':'العروض';
      else if(href.includes('#how'))a.textContent=en?'How to order':'طريقة الطلب';
      else if(href.includes('#terms'))a.textContent=en?'Why MASTER STORE?':'ليه MASTER STORE؟';
    });
    const account=document.querySelector('.account-link');
    if(account)account.textContent=en?'My orders':'طلباتي';
    const menu=document.querySelector('.menu');
    if(menu)menu.setAttribute('aria-label',en?'Open menu':'فتح القائمة');
    const search=document.getElementById('search');
    if(search)search.placeholder=en?'Search for a service...':'دور على خدمتك...';

    if(document.querySelector('.hero-v2')){
      setHTML('.hero-kicker','<span></span> وفّر أكتر مع MASTER STORE','<span></span> Save more with MASTER STORE');
      setHTML('.hero-copy h1','اشتراكاتك المفضلة.<br><em>بخصومات تصل إلى 90%.</em>','Your favorite subscriptions.<br><em>Save up to 90%.</em>');
      setText('.discount-note','على عروض مختارة','On selected offers');
      setText('.hero-copy > p','من أدوات الذكاء الاصطناعي والتصميم للتعليم والترفيه — اختار خدمتك واطلبها بسهولة مع دعم مباشر على واتساب.','AI, design, education and entertainment subscriptions — choose your service and order easily with direct WhatsApp support.');
      const acts=document.querySelectorAll('.hero-actions a');
      if(acts[0])acts[0].textContent=en?'Browse offers':'تصفح العروض';
      if(acts[1])acts[1].textContent=en?'Customer support':'خدمة العملاء';
      const facts=document.querySelectorAll('.hero-facts > div');
      if(facts[0])facts[0].innerHTML=en?'<strong>65+</strong><span>services in the catalog</span>':'<strong>+65</strong><span>خدمة في الكتالوج</span>';
      if(facts[1])facts[1].innerHTML=en?'<strong>Full warranty</strong><span>on available services</span>':'<strong>ضمان كامل</strong><span>على الخدمات المتاحة</span>';
      if(facts[2])facts[2].innerHTML=en?'<strong>Direct support</strong><span>before and after ordering</span>':'<strong>دعم مباشر</strong><span>قبل وبعد الطلب</span>';
      setText('#products .eyebrow','العروض والخدمات','Offers & services');
      setText('#products h2','اختار اشتراكك','Choose your subscription');
      setText('#products .section-sub','كل التفاصيل المهمة موجودة داخل صفحة الخدمة.','All important details are available on each service page.');
      const how=document.querySelector('#how');
      if(how){
        setText('#how .eyebrow','طلب سهل وسريع','Fast & simple ordering');
        setText('#how h2','3 خطوات وتكون خلصت','Done in 3 steps');
      }
      const terms=document.querySelector('#terms');
      if(terms){
        setText('#terms .eyebrow','تجربة أفضل','A better experience');
        setText('#terms h2','ليه MASTER STORE؟','Why MASTER STORE?');
        setText('#terms .section-sub','كل حاجة مصممة عشان تختار وتطلب وأنت فاهم التفاصيل.','Everything is designed so you can choose and order with clear details.');
      }
    }

    if(document.querySelector('.account-page')){
      setText('.account-head .eyebrow','متابعة الطلبات','Order tracking');
      setText('.account-head h1','طلباتك في مكان واحد','All your orders in one place');
      setText('.account-head p','راجع بيانات التواصل وأرقام الطلبات، وتابع أي طلب مباشرة مع خدمة العملاء.','Review your contact details and order IDs, then follow up directly with customer support.');
    }

    const fab=document.querySelector('.support-fab');
    if(fab){
      const span=fab.querySelector('span'),b=fab.querySelector('b');
      if(span)span.textContent=en?'Customer support':'خدمة العملاء';
      if(b)b.textContent=en?'WhatsApp':'واتساب';
    }
  }

  function updateSwitcher(){
    const marketSelect=document.getElementById('marketSelect');
    const languageSelect=document.getElementById('languageSelect');
    if(marketSelect){
      marketSelect.innerHTML=Object.values(MARKETS).map(m=>
        '<option value="'+m.code+'">'+m.flag+' '+(state.language==='en'?m.nameEn:m.nameAr)+' · '+m.currency+'</option>'
      ).join('');
      marketSelect.value=state.market;
      marketSelect.setAttribute('aria-label',t('market'));
      marketSelect.title=t('market');
    }
    if(languageSelect){
      languageSelect.innerHTML='<option value="ar">العربية</option><option value="en">English</option>';
      languageSelect.value=state.language;
      languageSelect.setAttribute('aria-label',t('language'));
      languageSelect.title=t('language');
    }
  }

  function bindSwitcher(wrap){
    if(!wrap||wrap.dataset.bound==='1')return;
    const market=wrap.querySelector('#marketSelect');
    const language=wrap.querySelector('#languageSelect');
    if(market)market.addEventListener('change',e=>setMarket(e.target.value,true));
    if(language)language.addEventListener('change',e=>setLanguage(e.target.value));
    wrap.dataset.bound='1';
  }

  function injectSwitcher(){
    let wrap=document.getElementById('marketSwitcher');
    if(!wrap){
      const header=document.querySelector('.topbar');
      if(!header)return;
      wrap=document.createElement('div');
      wrap.className='market-switcher';
      wrap.id='marketSwitcher';
      wrap.innerHTML='<select id="marketSelect"></select><select id="languageSelect"></select>';
      const account=header.querySelector('.account-link');
      header.insertBefore(wrap,account||header.querySelector('.menu')||null);
    }
    bindSwitcher(wrap);
    updateSwitcher();
  }

  function apply(){
    if(applying)return;
    applying=true;
    updateDocumentDirection();
    injectSwitcher();
    updateSwitcher();
    applyStaticTranslations();
    translateExactText(document.body);
    applying=false;
  }

  function setMarket(code,manual){
    const next=MARKETS[code]?code:'INTL';
    if(next===state.market&&manual){
      savePref({manualMarket:true,detectedAt:Date.now()});
      return;
    }
    state.market=next;
    savePref({manualMarket:!!manual,detectedAt:Date.now()});
    apply();
    emit();
  }
  function setLanguage(lang){
    state.language=lang==='en'?'en':'ar';
    savePref({});
    apply();
    emit();
  }

  async function loadRates(){
    const cached=safeJSON(localStorage.getItem(FX_KEY),null);
    if(cached&&cached.rates&&Date.now()-Number(cached.at||0)<12*60*60*1000){
      state.rates={...FALLBACK_RATES,...cached.rates};
      state.rateSource='cache';
    }
    try{
      const res=await fetch(FX_URL,{cache:'no-store'});
      const data=await res.json();
      if(data&&data.result==='success'&&data.rates){
        state.rates={...FALLBACK_RATES,...data.rates};
        state.rateSource='live';
        localStorage.setItem(FX_KEY,JSON.stringify({at:Date.now(),rates:data.rates}));
        emit();
      }
    }catch(_){}
  }

  async function detectMarket(){
    const pref=getPref();
    if(pref.manualMarket&&MARKETS[pref.market])return;
    if(pref.market&&MARKETS[pref.market]&&Date.now()-Number(pref.detectedAt||0)<24*60*60*1000){
      state.market=pref.market;
      return;
    }
    let country=inferCountry();
    try{
      const res=await Promise.race([
        fetch(COUNTRY_URL,{cache:'no-store'}),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),2500))
      ]);
      if(res&&res.ok){
        const text=(await res.text()).trim().toUpperCase();
        if(/^[A-Z]{2}$/.test(text))country=text;
      }
    }catch(_){}
    state.market=marketFromCountry(country);
    if(!pref.language){
      state.language=state.market==='INTL'?'en':'ar';
    }
    savePref({manualMarket:false,detectedAt:Date.now()});
    apply();
    emit();
  }

  function init(){
    const pref=getPref();
    if(pref.market&&MARKETS[pref.market])state.market=pref.market;
    if(pref.language==='en'||pref.language==='ar')state.language=pref.language;
    else {
      const nav=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();
      state.language=nav.startsWith('ar')?'ar':'en';
    }
    apply();
    loadRates();
    detectMarket();
  }

  window.MasterLocale={
    MARKETS,getState,currentMarket,money,convertEGP,autoMarketAmount,formatCurrency,planAmount,planMoney,
    catalogText,setMarket,setLanguage,t,apply
  };

  // Scripts are loaded at the end of <body>, so initialize immediately.
  // This makes the selected market/language available before app.js/product-page.js render.
  init();
})();