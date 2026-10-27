(function(){
  'use strict';

  const PREF_KEY='masterStoreLocaleV1';
  const FX_KEY='masterStoreFxV1';
  const FX_URL='https://open.er-api.com/v6/latest/EGP';
  const COUNTRY_URL='https://ipapi.co/country/';

  // USD/EUR/PLN fallback checked 8 Oct 2026 (provider snapshot 7 Oct); other rates from 22 Sep. Live rates refresh in the browser.
  const FALLBACK_RATES={
    EGP:1, AED:0.07073, LYD:0.122014, SAR:0.072222, KWD:0.005927,
    QAR:0.070104, BHD:0.007241, OMR:0.007405, JOD:0.013655,
    IQD:25.134273, MAD:0.183035, DZD:2.571678, TND:0.056325, USD:0.019131, EUR:0.016997, PLN:0.074314
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
  const NON_EGYPT_PRICE_INCREASE=1.05;
  function increaseForeignPrice(amount,currency){
    return Number((Number(amount)*NON_EGYPT_PRICE_INCREASE).toFixed(decimalCount(currency)));
  }
  const SYMBOLS_AR={EGP:'ج.م',LYD:'د.ل',AED:'د.إ',SAR:'ر.س',KWD:'د.ك',QAR:'ر.ق',BHD:'د.ب',OMR:'ر.ع',JOD:'د.أ',IQD:'د.ع',MAD:'د.م',DZD:'د.ج',TND:'د.ت',USD:'$'};
  const SYMBOLS_EN={EGP:'EGP',LYD:'LYD',AED:'AED',SAR:'SAR',KWD:'KWD',QAR:'QAR',BHD:'BHD',OMR:'OMR',JOD:'JOD',IQD:'IQD',MAD:'MAD',DZD:'DZD',TND:'TND',USD:'$'};

  const exactArToEn={
    'العروض':'Offers','طريقة الطلب':'How to order','ليه MASTER STORE؟':'Why MASTER STORE?',
    'طلباتي':'My orders','حسابي':'My account','حسابي ومحفظتي':'My account & wallet','افتح حسابك ←':'Open your account →','حسابك في MASTER STORE':'Your MASTER STORE account','طلباتك ورصيدك معاك في أي وقت.':'Your orders and balance, anytime.','سجل الدخول، اشحن محفظتك بعد تأكيد التحويل، وادفع من رصيدك.':'Sign in, top up after transfer verification, and pay with your balance.','تصفح العروض':'Browse offers','خدمة العملاء':'Customer support','واتساب':'WhatsApp',
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
    'عروض مختارة':'Selected offers',
    'عروض مختارة بتوفير كبير':'Selected offers with great savings',
    'تفاصيل الضمان داخل كل باقة':'Warranty details are listed in each plan',
    'متابعة سريعة على واتساب':'Quick follow-up on WhatsApp',
    'اختار الباقة وأرسل طلبك خلال دقائق':'Choose a plan and send your order in minutes',
    'السعر والمدة ونوع الحساب والتفعيل موجودين قبل إرسال الطلب.':'Review price, duration, account type and activation before ordering.',
    'تفاصيل الضمان بتظهر مع الباقة عشان تعرف حقوقك بوضوح.':'Warranty details are listed with each plan so you know your coverage.',
    'فريق الدعم متاح على واتساب لمتابعة الطلب والاستفسارات.':'Support is available on WhatsApp for orders and questions.',
    'كتالوج يضم أكثر من 60 خدمة بين AI وتصميم وتعليم وترفيه وVPN.':'Over 60 services for AI, design, education, entertainment and VPN.',
    'InstaPay وVodafone Cash وBinance / USDT حسب طريقة الدفع المناسبة ليك.':'Choose the payment method that suits you: InstaPay, Vodafone Cash or Binance / USDT.',
    'كل طلب له رقم واضح تقدر تستخدمه في المتابعة مع خدمة العملاء.':'Every order has an ID you can use to follow up with support.',
    'عرض سنوي':'Annual offer',
    '300 Credit + 5 يوميًا':'300 credits + 5 daily',
    'الطلبات والبيانات في هذه الصفحة محفوظة على هذا المتصفح فقط.':'Orders and details on this page are stored only in this browser.','طلبات الحساب ورصيد المحفظة محفوظة لحسابك. طلبات الضيوف محفوظة على الجهاز فقط.':'Account orders and wallet balance are saved to your account. Guest orders are stored on this device.'
  };
  exactArToEn['ضمان كامل لمدة سنة']='Full one-year warranty';
  exactArToEn['تسليم حساب جاهز خلال ساعتين إلى 3 ساعات.']='A ready account delivered within 2–3 hours.';
  exactArToEn['ضمان كامل لمدة شهر']='Full one-month warranty';
  exactArToEn['Plus — شهر — حساب خاص']='Plus — one month — private account';
  exactArToEn['تسليم بيانات حساب خاص.']='Private account credentials are delivered.';
  exactArToEn["باقات كورسيرا: 3 شهور، وOrg سنة، وPlus شهر، بضمان كامل."]="Coursera plans: 3 months, annual Org, and monthly Plus, with full warranty.";
exactArToEn["Org — سنة"]="Org — Annual";
exactArToEn["Plus — شهر"]="Plus — Monthly";
exactArToEn["حساب Org"]="Org account";
exactArToEn["اشتراك Coursera Org لمدة سنة."]="Coursera Org subscription for one year.";
exactArToEn["تفعيل اشتراك Coursera Plus لمدة شهر."]="Coursera Plus subscription for one month.";
exactArToEn["اشتراك Coursera Plus"]="Coursera Plus subscription";
exactArToEn["Plus تابع لـOrg — سنة — ضمان 4 شهور"]="Plus under an Org — Annual — 4-month warranty";
exactArToEn["Plus تابع لـOrg — سنة — ضمان كامل"]="Plus under an Org — Annual — Full warranty";
exactArToEn["Plus تابع لـOrg"]="Plus under an Org";
exactArToEn["Plus مستقل"]="Standalone Plus";
exactArToEn["Plus مستقل — شهر"]="Standalone Plus — Monthly";
exactArToEn["Plus مستقل غير تابع لـOrg"]="Standalone Plus, not linked to an Org";
exactArToEn["اشتراك Coursera Plus تابع لـOrg لمدة سنة."]="Coursera Plus under an Org for one year.";
exactArToEn["ضمان لمدة 4 شهور"]="4-month warranty";
exactArToEn["تشمل هدية Gemini لمدة 3 شهور وCanva Pro لمدة 3 سنين."]="Includes Gemini for 3 months and Canva Pro for 3 years as gifts.";
exactArToEn["مدة الاشتراك سنة، ومدة الضمان 4 شهور."]="One-year subscription with a 4-month warranty.";
exactArToEn["اشتراك Plus مستقل غير تابع لأي Org."]="Standalone Plus subscription, not linked to any Org.";
exactArToEn["ما معنى Org؟ اختصار لكلمة Organization، أي مؤسسة أو جهة. اشتراك Plus هنا تابع للمؤسسة، وتُدار عضويته وإمكانية الوصول من خلالها. تفاصيل مدة الاشتراك والضمان موضّحة في الباقة."]="What does Org mean? It is short for Organization. This Plus subscription is linked to an organization, which manages membership and access. The subscription term and warranty are shown in the plan.";
Object.assign(exactArToEn,{"تسليم حساب Picsart Pro خاص جاهز للاستخدام: إيميل وكلمة مرور.": "Receive a private, ready-to-use Picsart Pro account with email and password.", "حساب خاص جاهز": "Private ready-to-use account", "خاص": "Private", "بدون كريدت": "No credits", "500 كريدت": "500 credits", "تحرير الصور وتجهيز تصميمات للسوشيال ميديا باستخدام أدوات الحساب المتاحة.": "Edit photos and prepare social media designs using the tools available on the account.", "حساب خاص جاهز مع تسليم بيانات الدخول.": "Private ready-to-use account with login details provided.", "ضمان كامل طوال مدة الباقة المختارة.": "Full warranty throughout the selected plan term.", "باقة الأسبوع بدون كريدت؛ باقات الشهر و3 شهور و6 شهور والسنة تشمل 500 كريدت لكل باقة.": "The weekly plan has no credits; the one-month, three-month, six-month and annual plans each include 500 credits.", "استهلاك الكريدت يختلف حسب الأداة والعملية؛ الرصيد لا يساوي عددًا ثابتًا من الصور.": "Credit use varies by tool and task; the balance does not represent a fixed number of images.", "Pro — خاص — 7 أيام": "Pro — Private — 7 days", "7 أيام": "7 days", "ضمان كامل طوال الأسبوع": "Full warranty throughout the week", "باقة الأسبوع لا تشمل كريدت.": "The weekly plan does not include credits.", "Pro — خاص — 1 شهر": "Pro — Private — 1 month", "1 شهر": "1 month", "ضمان كامل طوال الشهر": "Full warranty throughout the month", "Pro — خاص — 3 شهور": "Pro — Private — 3 months", "3 شهور": "3 months", "ضمان كامل لمدة 3 شهور": "Full warranty for 3 months", "Pro — خاص — 6 شهور": "Pro — Private — 6 months", "6 شهور": "6 months", "ضمان كامل لمدة 6 شهور": "Full warranty for 6 months", "Pro — خاص — 12 شهر": "Pro — Private — 12 months", "12 شهر": "12 months", "ضمان كامل لمدة سنة": "Full warranty for one year", "اشتراكات Picsart Pro بحساب خاص جاهز وضمان كامل، من أسبوع إلى سنة. الأسبوع بدون كريدت، والباقات الأخرى تشمل 500 كريدت لكل باقة.": "Picsart Pro subscriptions with a private ready-to-use account and full warranty, from one week to one year. The weekly plan has no credits; the other plans each include 500 credits."});
Object.assign(exactArToEn,{
 'تم مد العرض ٣ أيام إضافية':'Offer extended by 3 days',
 'عرض جيمناي ١٨ شهر متاح حتى:':'18-month Gemini offer available until:',
 'تم مد العرض حتى ٢٩ أكتوبر':'Offer extended until 29 October',
 'تم مد فترة الاشتراك في العرض 3 أيام إضافية، حتى نهاية 29 أكتوبر 2026 بتوقيت مصر.':'The offer booking window has been extended by 3 days, until the end of 29 October 2026, Egypt time.'
});
Object.assign(exactArToEn,{"أفضل العروض": "Best offers", "🔥 أفضل العروض": "🔥 Best offers", "كل الخدمات": "All services", "تجارب العملاء": "Customer stories", "الأسئلة الشائعة": "Frequently asked questions", "الفيديو": "Video", "الصور والتصميم": "Images & design", "الصوت": "Audio", "البرمجة والمواقع": "Coding & websites", "العمل والإنتاجية": "Work & productivity", "الحماية والاتصالات": "Security & connectivity", "الكتابة والبحث": "Writing & research", "التعليم": "Education", "الترفيه": "Entertainment", "محادثة ومساعد ذكي": "Chat & AI assistants", "سوبر جروك + كورسيرا بلس": "SuperGrok + Coursera Plus", "ChatGPT للمعلمين K12": "ChatGPT for K12 teachers", "WE Gold — خصم الإنترنت المنزلي": "WE Gold — home internet discount", "ينتهي العرض قريبًا": "Offer ends soon", "يوم": "Days", "ساعة": "Hours", "دقيقة": "Minutes", "ثانية": "Seconds", "قبل فوات الأوان": "Before the offer ends", "آخر فرصة لعرض جيمناي ١٨ شهر:": "Last chance for the 18-month Gemini offer:", "٢٩ أكتوبر ٢٠٢٦": "29 October 2026", "، حتى نهاية اليوم بتوقيت مصر.": ", until the end of the day, Egypt time.", "انتهت مدة العرض · ٢٩ أكتوبر ٢٠٢٦": "Offer ended · 29 October 2026", "انتهى عرض الشهر بـ300ج": "The EGP 300 monthly offer has ended", "InstaPay وVodafone Cash وTaptap Send وCliQ وشام كاش وPayPal وBarq وBinance / USDT.": "InstaPay, Vodafone Cash, Taptap Send, CliQ, Sham Cash, PayPal, Barq and Binance / USDT.", "وسائل الدفع": "Payment methods", "إنستاباي": "InstaPay", "فودافون كاش": "Vodafone Cash", "بينانس": "Binance", "تيثر": "Tether", "تاب تاب سند": "Taptap Send", "كليك · الأردن": "CliQ · Jordan", "شام كاش": "Sham Cash", "Sham Cash · سوريا": "Sham Cash · Syria", "باي بال": "PayPal", "برق · السعودية": "Barq · Saudi Arabia", "بيانات التحويل وطريقة الدفع يتم تأكيدها مع الدعم بعد الطلب.": "Support confirms transfer details and payment instructions after ordering.", "تصفح أقسام ماستر ستور": "Browse Master Store categories", "دليل الاشتراكات والخدمات": "Subscriptions & services directory", "سياسة الضمان والاستبدال": "Warranty & replacement policy", "سياسات وشروط الاشتراك": "Subscription policies & terms", "سلة اشتراكاتك": "Your subscription cart", "كل ما تزود اشتراكات، الخصم يزيد تلقائيًا.": "Your discount increases automatically as you add subscriptions.", "قبل تأكيد الطلب، راجع ضمان الباقة و": "Before confirming, review the plan warranty and the", "متابعة طلبك": "Track your order", "ابحث برقم الطلب، وراجع الحالة والتفاصيل أو تواصل مع الدعم.": "Search by order ID to review its status and details or contact support.", "بحث": "Search", "تحديث": "Refresh", "سجّل الدخول لعرض طلبات حسابك وحالتها الحالية ←": "Sign in to see your account orders and their current status →", "طلبات الضيف محفوظة على نفس الجهاز والمتصفح فقط. لو طلبك مش ظاهر، تواصل مع الدعم برقم الطلب.": "Guest orders are saved only in this browser on this device. If an order is missing, contact support with its order ID.", "التواصل مع الدعم": "Contact support", "الاشتراك الأساسي": "Main subscription", "١٢ شهرًا من الكورسات · حساب جاهز": "12 months of courses · ready-to-use account", "✓ ضمان كامل لكورسيرا": "✓ Full Coursera warranty", "هدايا مشمولة مجانًا": "Free gifts included", "٣ شهور على إيميلك": "3 months on your email", "٣ سنين على إيميلك": "3 years on your email", "مجانًا": "FREE", "الاشتراك والهدايا معًا بـ٤٩٩ج · بدون تكلفة إضافية للهدايا": "Subscription and gifts together for EGP 499 · gifts at no extra cost", "إغلاق": "Close", "الصور السابقة": "Previous photos", "الصور التالية": "Next photos", "فتح القائمة": "Open menu", "رقم الطلب / رقم الفاتورة": "Order ID / invoice number"});
Object.assign(exactArToEn,{"ماستر ستور": "Master Store", "ماستر ستور MASTER STORE": "Master Store", "كل الخدمات والباقات ←": "All services & plans →", "أقسام أخرى": "Other categories", "تفاصيل الباقات والتفعيل ←": "Plans & activation details →", "مسار التصفح": "Breadcrumbs", "أقسام الاشتراكات": "Subscription categories", "كل صفحات الخدمات": "All service pages", "خدمات من نفس القسم": "Related services", "متابعة الطلب": "Track order", "اشتراكات أدوات الفيديو والمونتاج": "Video & editing subscriptions", "قارن باقات توليد الفيديو بالذكاء الاصطناعي والأفاتار والمونتاج. راجع مدة الاشتراك وطريقة التفعيل والضمان لكل خدمة قبل الطلب.": "Compare AI video, avatar and editing plans. Review each service’s term, activation method and warranty before ordering.", "اشتراكات أدوات الصور والتصميم": "Image & design subscriptions", "تصفح أدوات توليد الصور وتعديلها والتصميم وموارد الصور والقوالب. اختر الخدمة حسب استخدامك وراجع الباقات والتفعيل والضمان.": "Browse image generation, editing, design, stock assets and templates. Choose a service and review its plans, activation and warranty.", "اشتراكات أدوات التعليق الصوتي والصوت": "Voice-over & audio subscriptions", "اكتشف خدمات التعليق الصوتي وتحويل النص إلى صوت والإملاء وتلخيص الاجتماعات. راجع حدود الرصيد ومدة كل باقة وتفاصيل التفعيل.": "Explore voice-over, text-to-speech, dictation and meeting summaries. Review credit limits, subscription terms and activation details.", "اشتراكات أدوات البرمجة وبناء المواقع": "Coding & website builder subscriptions", "باقات مساعدي كتابة الكود وبناء المواقع والتطبيقات والاستضافة وأدوات المطورين. قارن الاستخدامات ومدة الاشتراك وطريقة التسليم.": "Compare coding assistants, website and app builders, hosting and developer tools, including subscription terms and delivery methods.", "اشتراكات أدوات الكتابة والبحث": "Writing & research subscriptions", "تصفح مساعدي البحث والكتابة والتدقيق وإعادة الصياغة وفحص التشابه. راجع الرصيد وحدود الاستخدام وشروط كل باقة قبل طلبها.": "Browse research, writing, proofreading, paraphrasing and similarity-checking tools. Review credits, usage limits and plan terms before ordering.", "اشتراكات التعليم والكورسات وتعلم اللغات": "Education, courses & language subscriptions", "باقات الكورسات وتعلم اللغات وأدوات المعلمين والاختبارات. راجع مدة الاشتراك ونوع الحساب والتفعيل والضمان لكل خدمة.": "Explore courses, language learning, teacher tools and test preparation. Review each service’s term, account type, activation and warranty.", "اشتراكات الإنتاجية وتفعيل ويندوز": "Productivity subscriptions & Windows activation", "خدمات المستندات وملفات PDF والاجتماعات والعروض التقديمية وإدارة العمل، مع نسخ ويندوز المتاحة. راجع تفاصيل الباقات والتفعيل.": "Find document, PDF, meeting, presentation and work management tools, plus Windows editions. Review plans and activation details.", "اشتراكات الترفيه والخدمات الرقمية": "Entertainment & digital subscriptions", "استعرض خدمات الترفيه الرقمية المتاحة في المتجر. قارن مدد الباقات ونوع الحساب وطريقة التفعيل والضمان قبل إتمام الطلب.": "Browse available entertainment subscriptions. Compare subscription terms, account types, activation and warranty before ordering.", "اشتراكات VPN والحماية والإنترنت": "VPN, security & internet subscriptions", "خدمات VPN والخصوصية وعروض الإنترنت المتاحة. راجع عدد الأجهزة والمدة وشروط الأهلية والتفعيل لكل عرض قبل الدفع.": "Explore VPN, privacy and internet offers. Review devices, subscription terms, eligibility and activation before payment."});
exactArToEn['الاتصالات والإنترنت']='Connectivity & internet';
Object.assign(exactArToEn,{"نكمل الطلب؟": "Ready to check out?", "أكد الطلب دلوقتي، أو ضيف الاشتراك للسلة وكمل اختيار باقي منتجاتك.": "Check out now, or add this subscription to your cart and keep shopping.", "تأكيد الطلب دلوقتي": "Check out now", "هكمل تسوّق — ضيف ده للسلة": "Keep shopping — add to cart", "شراء الآن": "Buy now", "← كل المنتجات": "← All products"});
exactArToEn['السلة']='Cart';
exactArToEn['التنقل الرئيسي']='Main navigation';
const exactEnToAr=Object.fromEntries(Object.entries(exactArToEn).map(([a,e])=>[e,a]));


  const PRODUCT_DESC_EN={
    "prezi":"Prezi Plus for one month: a private, non-shared account at EGP 450, with full warranty throughout the month.",
    "hedra":"Official Hedra Basic subscription for one month at $20: a ready account with full warranty, prepared within 2–3 hours.",
    "adobe-express":"Adobe Express Premium for 12 months: activation on your email or a ready-made account for EGP 499 with a 6-month warranty, or an activation link for your account requiring a card for EGP 200 with no warranty.",
    "academic-pro":"Review your documents before submission with Turnitin similarity reports and AI-content detection from Academi. One month of Pro on your personal account.",
"cursor-pro":"Cursor Pro for coding for one year at $135. A 100% discount activation code on your personal account requiring an accepted payment card.",
"higgsfield-pro":"Higgsfield: monthly Starter plan for EGP 599 with 210 credits, a ready-made account and one-month warranty; annual Pro activation code also available.",
"windows-pro":"Windows 7 through 11 in one place: choose from 22 editions, each EGP 265 with lifetime activation for the purchased version and full warranty.",
    "chatgpt-teachers-k12":"A ChatGPT plan for K12 teachers lasting two years at EGP 400, without warranty.",
    "chatgpt-go":"One month of ChatGPT Go for EGP 320, delivered as a ready-to-use account with email and password and full warranty throughout the month.",
    "chatgpt-plus":"Available monthly ChatGPT Plus plans: a no-warranty account for EGP 320, or activation and renewal on your personal account for EGP 1,100. The EGP 700 ready-made account plan is out of stock.",
    "gemini-pro":"Two 18-month options; the family plan adds 5 invitations. Its 1,000 monthly credits are for the main account only.",
    "claude-pro":"Activate Claude Pro on your personal account using the store's payment method.",
    "perplexity-pro":"A ready private Perplexity Pro account with full warranty under the current store offer.",
    "lovable-pro":"Build websites and apps with AI using Lovable. Monthly and annual plans include one year of Pro Lite with 300 total credits plus 5 daily, personal-email activation and full warranty.",
    "lovable-lite":"One year of Lovable Pro Lite with 300 total credits plus 5 daily, personal-email activation without a card and full warranty.",
    "runway-pro":"A 12-month Runway Pro subscription activated on your account with a redemption code, with a 6-month warranty.",
    "wink-ai":"A ready account for Wink AI tools.",
    "grok":"Only the 3-month SuperGrok plan is available for $68: a ready private account delivered with email and password, with full warranty for the subscription. All other plans are out of stock.",
    "gamma-plus":"A ready Gamma Plus account.",
    "gamma-account":"One Gamma account with 10 workspaces, each including 2,000 credits.",
    "elevenlabs":"ElevenLabs Creator plans, including one full year on your personal account for EGP 4,500 without a payment card.",
    "heygen":"A ready HeyGen account with 1,250 credits.",
    "canva-pro":"Activate Canva Pro on your personal email.",
    "capcut-pro":"CapCut Pro plans: one month with 2,000 credits for EGP 320 and full warranty, or one month on your email with at least 500 credits for EGP 270 with warranty.",
    "figma":"A 12-month Figma subscription.",
    "freepik":"A ready Freepik account for one month.",
    "adobe-cc":"Currently out of stock.",
    "duolingo":"A one-year Duolingo subscription on your personal email.",
    "elsa":"ELSA Speak subscription for pronunciation and conversation practice.",
    "coursera":"Annual Coursera Plus under an Org with 4-month or full-year warranty, and standalone monthly Plus. All include gifts.",
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
    "grammarly":"Grammarly Premium with advanced writing, grammar correction, rewriting, and AI-powered assistance available in the plan.",
    "quillbot":"QuillBot Premium plans for 1, 3, 6, or 12 months. The annual plan costs EGP 1,200, averaging EGP 100 per month.",
    "envato":"Envato Elements Premium for EGP 450: stock videos, photos, templates and design assets with portal access credentials and full warranty. The subscription term is confirmed before payment.",
    "motion-array":"Coming soon to MASTER STORE.",
    "murf":"Coming soon to MASTER STORE.",
    "discord":"Discord Nitro membership for EGP 400: access for 25–45 days, 2 Server Boosts, and a changeable account password. The account registration country is random.",
    "midjourney":"This service is currently unavailable.",
    "leonardo-ai":"Leonardo AI for image creation, editing, and upscaling: monthly Premium for EGP 950 with a ready account and full warranty, or 8,500 credits for EGP 550. Select a plan for its details.",
    "manus-pro":"A one-month Manus Pro account with 4,000 credits plus 1,000 bonus credits, a 20-day warranty, delivered with email and password.",
    "manus":"All Manus credit plans, monthly Pro, and annual Pro with activation on your personal account.",
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
    "إنشاء الفيديو":"Video creation","إنشاء الصور":"Image creation","الصوت والموسيقى":"Audio & music","البرمجة وتطوير المواقع":"Coding & websites","الكتابة والبحث":"Writing & research","العروض التقديمية":"Presentations","AI Tools":"AI Tools","التصميم":"Design","التعليم":"Education",
    "الإنتاجية":"Productivity","VPN والحماية":"VPN & Security","الترفيه":"Entertainment"
  };
  const CATALOG_EXACT_EN={
    "Adobe Express Premium — لينك تفعيل يحتاج بطاقة":"Adobe Express Premium — activation link, card required",
    "لينك تفعيل على حسابك":"Activation link for your account",
    "تسليم لينك لتفعيل اشتراك 12 شهرًا على حسابك الشخصي. يلزم وجود بطاقة لإتمام التفعيل.":"Receive a link to activate a 12-month subscription on your personal account. A card is required to complete activation.",
    "التفعيل يحتاج بطاقة يضيفها العميل بنفسه على صفحة Adobe.":"Activation requires a card, entered by the customer directly on Adobe’s page.",
    "هذه الباقة بدون ضمان لمدة اشتراك 12 شهرًا.":"This 12-month subscription has no warranty.",
    "راجع شروط التفعيل والتجديد وأي رسوم ظاهرة على صفحة Adobe قبل التأكيد.":"Review activation and renewal terms and any charges shown on Adobe’s page before confirming.",

    "Adobe Express Premium — سنة":"Adobe Express Premium — 1 year",
    "تفعيل على إيميلك أو حساب جاهز":"Your email or a ready-made account",
    "إيميل العميل أو حساب جاهز":"Customer email or a ready-made account",
    "تفعيل الاشتراك على إيميلك أو تسليم حساب جاهز، حسب اختيارك عند تأكيد الطلب.":"Activate on your email or receive a ready-made account, as selected when confirming the order.",
    "مدة الاشتراك 12 شهرًا، ومدة الضمان 6 شهور.":"The subscription lasts 12 months; the warranty lasts 6 months.",
    "12 شهرًا بالسعر الشهري الرسمي":"12 months at the official monthly rate",
    "المرجع يعادل 12 × 9.99 دولار بالسداد الشهري، وليس سعر خطة سنوية.":"Reference is 12 × USD 9.99 on monthly billing, not an annual-plan price.",

    "ChatGPT Plus — تفعيل أو تجديد على حسابك":"ChatGPT Plus — activation or renewal on your account",
    "تفعيل اشتراك Plus جديد أو تجديده على حسابك الشخصي.":"Activate a new Plus subscription or renew it on your personal account.",
    "SuperGrok — 3 شهور بضمان كامل":"SuperGrok — 3 months with full warranty",
    "3 أشهر بالسعر الشهري الرسمي":"3 months at the official monthly rate",
    "تقارير التشابه من Turnitin، أما تقارير كشف AI فمن أداة Academi الخاصة وليست تقرير Turnitin AI.":"Similarity reports come from Turnitin. AI reports use Academi’s own detector and are not Turnitin AI reports.",
    "بحسب Academi، لا تُضاف الملفات المفحوصة إلى مستودع Turnitin العالمي.":"According to Academi, checked files are not added to Turnitin’s global repository.",

    "متاح":"Available",
    "قريبًا":"Coming soon",
    "غير متوفر":"Unavailable",
    "ChatGPT Go — حساب جاهز":"ChatGPT Go — Ready-made account",
    "تسليم بيانات الحساب الجاهز: الإيميل وكلمة المرور.":"Receive the email and password for a ready-to-use account.",
    "ضمان كامل طوال الشهر":"Full warranty throughout the month",
    "حدود الاستخدام والأدوات حسب خطة ChatGPT Go.":"Tools and usage limits follow the ChatGPT Go plan.",
    "ChatGPT Plus — حساب جاهز":"ChatGPT Plus — Ready-made account",
    "ChatGPT Plus — على حسابك الشخصي":"ChatGPT Plus — On your personal account",
    "تسليم بيانات حساب جاهز.":"Delivery of ready-made account credentials.",
    "يتم تسليم حساب جاهز؛ لا يتم التفعيل على حساب العميل في هذه الباقة.":"A ready-made account is delivered; this plan does not activate your own account.",
    "الضمان يُؤكد قبل الدفع":"Warranty is confirmed before payment",
    "Creator — تفعيل على حسابك":"Creator — Activation on your account",
    "131 Credit شهريًا":"131 credits per month",
    "ChatGPT للمعلمين K12":"ChatGPT for K12 Teachers",
    "ChatGPT للمعلمين K12 — بدون ضمان":"ChatGPT for K12 Teachers — No warranty",
    "الباقة مخصصة للمعلمين K12؛ شروط الأهلية والتفعيل تُؤكد قبل الدفع.":"This plan is for K12 teachers; eligibility and activation requirements are confirmed before payment.",
    "مدة الباقة سنتان وبدون ضمان.":"The plan lasts two years and has no warranty.",
    "تسليم Gmail + كلمة المرور + بيانات التحقق الثنائي (2FA).":"Delivery: Gmail, password, and two-factor authentication (2FA) details.",
    "حساب خاص غير مشترك":"Private, non-shared account",
    "ChatGPT Plus — بدون ضمان":"ChatGPT Plus — No warranty",
    "بدون ضمان":"No warranty",
    "طريقة التفعيل تُؤكد قبل الدفع.":"Activation method is confirmed before payment.",
    "نوع الحساب يُؤكد قبل الدفع":"Account type is confirmed before payment",
    "هذه الباقة لمدة شهر وبدون ضمان.":"This plan lasts one month and has no warranty.",
    "2,250 Credit شهريًا":"2,250 credits per month",
    "رصيد كود التفعيل يُؤكد قبل الدفع":"Activation-code credits are confirmed before payment",
    "الرصيد الشهري يتجدد كل دورة فوترة، ولا ينتقل الرصيد غير المستخدم للشهر التالي.":"Monthly credits reset each billing cycle; unused credits do not roll over.",
    "مرجع المقارنة هو خطة Manus Pro الأساسية: 4,000 Credit شهريًا، بسعر معلن 17 دولارًا شهريًا عند الدفع السنوي؛ الإجمالي المحسوب 204 دولارات.":"Reference: entry-level Manus Pro with 4,000 monthly credits, advertised at $17/month billed annually; calculated total $204.",
    "اسم Pro يشمل مستويات رصيد مختلفة؛ رصيد كود المتجر يُؤكد قبل الدفع.":"Pro includes multiple credit tiers; confirm the store activation-code allowance before payment.",
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
    "اشتراك واحد":"Single subscription","بريد + كلمة مرور.":"Email and password.","اشتراك كامل":"Full subscription","خطة سنوية":"Annual plan","خطة شهر":"Monthly plan",
    "حساب Freepik":"Freepik account","كوبون شهرين":"2-month coupon",
    "عرض HMA":"HMA offer","عرض 10 أيام":"10-day offer",
    "300 Credit + 5 Credits يوميًا لمدة سنة":"300 credits + 5 daily credits for one year",
    "1,000 Credit شهريًا":"1,000 credits per month",
    "1,000 Credit شهريًا للحساب الرئيسي فقط":"1,000 credits per month for the main account only",
    "تفعيل على حسابك عبر كود استرداد.":"Activated on your account with a redemption code.",
    "تفعيل على حسابك الشخصي عبر كود تفعيل.":"Activated on your personal account with an activation code.",
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
    if(state.language==="en"&&productId==="picsart"&&exactArToEn[raw])return exactArToEn[raw];
    if(state.language==="en"&&productId==="capcut-pro"){const capcut={"7 أيام": "7 days", "شهر": "1 month", "1 شهر": "1 month", "شهر — 1600 Credits": "1 month — 1,600 credits", "3 شهور": "3 months", "6 شهور": "6 months", "سنة": "1 year", "12 شهر": "12 months", "Pro — شهر — 2000 كريدت": "Pro — 1 month — 2,000 credits", "Pro — شهر على إيميلك — 500 كريدت على الأقل": "Pro — 1 month on your email — at least 500 credits", "قد لا يوجد Credits أو تكون قليلة": "Credits may be absent or limited", "عادةً 500 Credit": "Usually 500 credits", "يتغير عادةً بين 500–1000": "Usually varies between 500 and 1,000 credits", "500–1000 Credit شهريًا": "500–1,000 credits per month", "2000 كريدت": "2,000 credits", "500 كريدت على الأقل": "At least 500 credits", "على إيميلك الشخصي": "On your personal email", "بريد + كلمة مرور؛ قد يطلب كود دخول.": "Email and password; a login code may be required.", "تسليم حساب CapCut Pro جاهز بإيميل وكلمة مرور.": "Receive a ready-to-use CapCut Pro account with email and password.", "تفعيل اشتراك CapCut Pro لمدة شهر على إيميلك الشخصي.": "Activate one month of CapCut Pro on your personal email.", "ضمان كامل لمدة شهر": "Full warranty for one month", "ضمان لمدة شهر": "One-month warranty"};if(capcut[raw])return capcut[raw];}
    if(state.language==="en"&&["humanizeai-pro","lovable-pro"].includes(productId)){const copy={"HumanizeAI.pro لتحسين صياغة النصوص وجعلها أكثر سلاسة ووضوحًا. اختار Standard أو Lite لمدة شهر، بحساب جاهز يُسلّم بإيميل وباسورد، وضمان كامل طوال الشهر.": "HumanizeAI.pro refines text for clearer, more natural writing. Choose Standard or Lite for one month, delivered as a ready-to-use account with email and password and full warranty throughout the month.", "عدد الكلمات وحدود الاستخدام وحجم الملفات حسب الباقة؛ تُراجع قبل الدفع.": "Word allowances, usage limits and file sizes depend on the plan; review them before payment.", "اسم الباقة المختارة ومدة الشهر وطريقة التسليم موضّحة في ملخص طلبك.": "Your order summary identifies the selected plan, one-month duration and delivery method.", "اشتراك Standard لمدة شهر كامل.": "One full month on the Standard plan.", "تسليم بيانات الدخول: الإيميل وكلمة المرور لحساب جاهز.": "Receive the email and password for a ready-to-use account.", "ضمان كامل على الاشتراك طوال الشهر.": "Full subscription warranty throughout the month.", "مميزات وحدود الاستخدام الخاصة بخطة Standard.": "Features and usage limits of the Standard plan.", "اشتراك Lite لمدة شهر كامل.": "One full month on the Lite plan.", "مميزات وحدود الاستخدام الخاصة بخطة Lite.": "Features and usage limits of the Lite plan.", "ابنِ مواقع وتطبيقات بمساعدة الذكاء الاصطناعي مع Lovable. باقات شهرية وسنوية في صفحة واحدة، منها Pro لمدة شهر برصيد 100 كريدت + 5 يوميًا بسعر 300 جنيه، وPro Lite لمدة سنة بسعر 450 جنيه.": "Build websites and apps with AI using Lovable. Monthly and annual plans include one year of Pro Lite with 300 total credits plus 5 daily, personal-email activation and full warranty.", "100 كريدت شهريًا + 5 كريدت بناء يوميًا": "100 monthly credits + 5 daily build credits", "الرصيد الشهري والرصيد اليومي حصتان منفصلتان.": "Monthly and daily credits are separate allowances.", "الكريدت اليومي يتجدد يوميًا ولا يتراكم لليوم التالي.": "Daily credits reset each day and do not roll over to the next day.", "اشتراك Lovable Pro لمدة شهر.": "One month of Lovable Pro.", "100 كريدت شهريًا + 5 كريدت بناء يوميًا.": "100 monthly credits plus 5 daily build credits.", "إنشاء وتعديل مواقع وتطبيقات باستخدام الأوامر النصية.": "Create and edit websites and apps using text prompts."};if(copy[raw])return copy[raw];}
    if(state.language==="en"&&productId==="humanizeai-pro"){const text={"اشتراك HumanizeAI.pro لمدة شهر بخطتي Standard وLite، حسابات جاهزة بضمان كامل طوال الشهر.": "HumanizeAI.pro monthly Standard and Lite subscriptions. Ready-to-use accounts with full warranty throughout the month.", "الخدمة على humanizeai.pro، وهي منفصلة عن HumanizeAI.com.": "This service is on humanizeai.pro and is separate from HumanizeAI.com.", "عدد الكلمات وحدود الاستخدام حسب الباقة؛ تُراجع قبل الدفع.": "Word allowances and usage limits depend on the plan; review them before payment.", "تسليم إيميل وكلمة مرور لحساب جاهز للاستخدام.": "Receive the email and password for a ready-to-use account.", "ضمان كامل طوال مدة الاشتراك: شهر.": "Full warranty throughout the one-month subscription.", "حساب جاهز للاستخدام على HumanizeAI.pro.": "Ready-to-use account on HumanizeAI.pro.", "Standard — شهر": "Standard — 1 month", "اشتراك Standard لمدة شهر كامل.": "Standard subscription for one full month.", "Lite — شهر": "Lite — 1 month", "اشتراك Lite لمدة شهر كامل.": "Lite subscription for one full month."};if(text[raw])return text[raw];}
    const windowsEditionText={"يلزم تطابق الإصدار المثبت على الجهاز مع نسخة المفتاح.": "The installed edition must match the product key edition.", "انتهى دعم Microsoft القياسي لهذا الإصدار؛ التفعيل لا يمدد الدعم الأمني.": "Microsoft standard support for this release has ended; activation does not extend security support.", "تتطلب النسخة جهازًا متوافقًا مع متطلبات Windows 11.": "A device compatible with Windows 11 requirements is required.", "تفعيل Windows لا يشمل اشتراك Office أو Microsoft 365.": "Windows activation does not include Office or Microsoft 365."};
    if(state.language==="en"&&productId?.startsWith("windows-")){
      if(kind==="description"&&window.MasterCatalog?.getProduct(productId)?.descriptionEn)return window.MasterCatalog.getProduct(productId).descriptionEn;
      if(windowsEditionText[raw])return windowsEditionText[raw];
    }
    const discordText={"Nitro — عضوية 25–45 يومًا": "Nitro — 25–45 day membership", "25–45 يومًا": "25–45 days", "تسليم بيانات الدخول للحساب؛ يمكن تغيير كلمة المرور.": "Receive account login details; the password can be changed.", "حساب ببلد تسجيل عشوائي": "Account registered in a random country", "عضوية على حساب جاهز": "Membership on a ready account", "مدة الوصول ضمن نطاق 25–45 يومًا حسب الحساب المستلم.": "Access lasts between 25 and 45 days depending on the delivered account.", "يشمل العرض تعزيزين للسيرفر (2 Server Boosts).": "The offer includes 2 Server Boosts.", "بلد تسجيل الحساب عشوائي.": "The account registration country is random."};
    if(state.language==="en"&&productId==="discord"&&discordText[raw])return discordText[raw];
    if(state.language==="en"&&productId==="leonardo-ai"&&raw==="تسليم بيانات حساب Leonardo AI جاهز للاستخدام.")return "Receive a ready-to-use Leonardo AI account.";
    const envatoText={"Premium — وصول عبر بوابة": "Premium — portal access", "غير محددة في العرض — تُؤكد قبل الدفع": "Not specified in the offer — confirm before payment", "تسليم اسم مستخدم وكلمة مرور لبوابة وصول تحوّل إلى موقع Envato.": "Receive a username and password for a portal that redirects to Envato.", "بيانات دخول لبوابة وصول": "Access portal credentials", "وصول عبر بوابة": "Portal access", "ضمان كامل وفق تفاصيل العرض": "Full warranty under the offer details", "مدة الاشتراك غير محددة في العرض المرفق؛ تُؤكد مع الدعم قبل الدفع.": "The attached offer does not specify the subscription term; confirm it before payment.", "تأكيد حدود التحميل وإمكانية إصدار ترخيص باسم العميل لكل مشروع قبل الدفع.": "Confirm download limits and whether a project license can be issued in the customer’s name before payment.", "الترخيص الدائم للمشروعات المسجلة والمكتملة وفق شروط Envato لا يعني اشتراكًا دائمًا أو تنزيلات مستمرة بعد انتهاء الوصول.": "Perpetual licensing for registered, completed projects under Envato terms does not mean lifetime access or ongoing downloads after access ends."};
    if(state.language==="en"&&productId==="envato"&&envatoText[raw])return envatoText[raw];
    if(state.language==="en"&&productId==="leonardo-ai"&&raw==="8,500 كريدت")return "8,500 credits";
    if(state.language!=="en"||!raw)return raw;
    if(kind==="description"&&PRODUCT_DESC_EN[productId])return PRODUCT_DESC_EN[productId];
    if(kind==="category")return CATEGORY_EN[raw]||exactArToEn[raw]||raw;
    const windowsText={"مدى الحياة للإصدار المشترى":"Lifetime for the purchased version","التفعيل باستخدام مفتاح المنتج.":"Activate using the product key.","مفتاح تفعيل":"Activation key","مفتاح منتج":"Product key","يُؤكد مع الدعم قبل الدفع":"Confirmed with support before payment","اختار الإصدار المطابق لنسخة Windows Pro المثبتة على جهازك.":"Select the version matching Windows Pro installed on your device.","مفتاح تفعيل لنسخة Windows Pro.":"Product key for Windows Pro.","اختيار Windows 11 Pro أو Windows 10 Pro.":"Choose Windows 11 Pro or Windows 10 Pro.","تفعيل دائم للإصدار المشترى.":"Permanent activation for the purchased version.","دفعة واحدة بدون اشتراك شهري.":"One-time payment, no monthly subscription."};
    if(productId?.startsWith("windows-")&&windowsText[raw])return windowsText[raw];
    const annualCodeText={"SuperGrok — شهر حساب خاص":"SuperGrok — monthly private account","تسليم حساب جاهز بإيميل وباسورد.":"A ready account delivered with email and password.","حساب خاص جاهز":"Ready private account","ضمان كامل طوال مدة الاشتراك":"Full warranty throughout the subscription","حساب العميل الشخصي":"Your personal account","Plus — سنة بكود تفعيل":"Plus — annual activation code","تسليم كود خصم 100% لتفعيل سنة على حسابك؛ يتطلب إضافة بطاقة دفع مقبولة.":"Receive a 100% discount code to activate one year on your account; an accepted payment card is required.","كود تفعيل على حسابك الشخصي":"Activation code on your personal account","السعر 135 دولار للكود؛ خصم 100% يخص رسوم التفعيل عند استخدام الكود.":"The code costs $135; the 100% discount applies to the activation charge when redeeming it.","Creator — سنة على حسابك":"Creator — annual on your account","تفعيل سنة كاملة على حسابك الشخصي بدون بطاقة دفع.":"Activate a full year on your personal account without a payment card.","Pro — سنة بكود تفعيل":"Pro — annual activation code","تسليم كود لتفعيل الاشتراك مباشرة على بريدك الشخصي.":"Receive a code to activate the subscription directly on your personal email."};
    if(annualCodeText[raw])return annualCodeText[raw];
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

  function safeJSON(value,fallback){try{return JSON.parse(value) ?? fallback;}catch{return fallback;}}
  function getPref(){return safeJSON(localStorage.getItem(PREF_KEY),{}) || {};}
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
  // Store USD/EGP rate supplied on 23 October 2026.
  const STORE_USD_EGP=56;
  function currencyRate(currency){if(currency==='USD')return 1/STORE_USD_EGP;return Number(state.rates[currency]||FALLBACK_RATES[currency]||1);}
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
    const currentPrice=roundUpSmart(convertEGP(value,market.code)*AUTO_PRICE_BUFFER,market.currency);
    return increaseForeignPrice(currentPrice,market.currency);
  }

  function money(value){
    const market=currentMarket();
    return formatCurrency(autoMarketAmount(value,market.code),market.currency);
  }

  // Increase existing non-Egypt prices by 5%, including manual prices; keep EGP unchanged.
  function planAmount(plan,key){
    if(!plan)return 0;
    const k=key||'price';
    // Explicit currency prices are final; other currencies keep existing rules.
    const currencyPrice=plan.currencyPrices?.[currentMarket().currency];
    if(k==='price'&&currencyPrice!=null&&Number.isFinite(Number(currencyPrice))&&Number(currencyPrice)>=0)return Number(currencyPrice);
    if(k==='price'&&Number(plan.basePriceUSD)>0){
      return Math.round(Number(plan.basePriceUSD)*currencyRate(currentMarket().currency)/currencyRate('USD'));
    }
    if(k==='oldPrice'&&plan.officialPrice){
      const ref=plan.officialPrice;
      const amount=Number(ref.amount);
      if(!(amount>0)||!currencyRate(ref.currency))return 0;
      return Number((amount*currencyRate(currentMarket().currency)/currencyRate(ref.currency)).toFixed(decimalCount(currentMarket().currency)));
    }
    const table=k==='oldPrice'?plan.marketOldPrices:plan.marketPrices;
    if(table&&table[state.market]!=null){
      const amount=Number(table[state.market])||0;
      return state.market==='EG'?amount:increaseForeignPrice(amount,currentMarket().currency);
    }
    return autoMarketAmount(plan[k]||0,state.market);
  }
  function planMoney(plan,key){
    if(plan.wholePrice){
      const market=currentMarket();
      const n=Math.round(planAmount(plan,key)).toLocaleString('en-US');
      const symbol=(state.language==='ar'?SYMBOLS_AR:SYMBOLS_EN)[market.currency]||market.currency;
      return market.currency==='USD'?'$'+n:n+' '+symbol;
    }
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
    const page=location.pathname.split('/').pop()||'index.html';
    const titles={'index.html':['ماستر ستور | الاشتراكات والخدمات الرقمية','MASTER STORE | Digital subscriptions & services'],'cart.html':['سلة اشتراكاتك | ماستر ستور','Your cart | MASTER STORE'],'account.html':['حسابك | ماستر ستور','Your account | MASTER STORE'],'track.html':['متابعة الطلب | ماستر ستور','Track your order | MASTER STORE'],'warranty.html':['سياسة الضمان والاستبدال | ماستر ستور','Warranty & replacement policy | MASTER STORE']};
    if(titles[page])document.title=titles[page][en?1:0];
  }

  function translateExactText(root){
    if(!root)return;
    const map=state.language==='en'?exactArToEn:exactEnToAr;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        const p=node.parentElement;
        if(!p||p.closest('[data-no-translate],.assistant-user,[contenteditable="true"]')||['SCRIPT','STYLE','NOSCRIPT','TEXTAREA'].includes(p.tagName))return NodeFilter.FILTER_REJECT;
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

  function translateContent(root){
    if(!root)return;
    if(root.nodeType===Node.TEXT_NODE)root=root.parentElement;
    if(!root||root.nodeType!==Node.ELEMENT_NODE||root.closest?.('script,style,textarea,[contenteditable="true"],[data-no-translate],.assistant-user'))return;
    translateExactText(root);
    const map=state.language==='en'?exactArToEn:exactEnToAr;
    for(const el of [root,...root.querySelectorAll('[aria-label],[placeholder],[title],[alt]')]){
      for(const attr of ['aria-label','placeholder','title','alt']){
        const value=el.getAttribute?.(attr);
        if(value&&map[value])el.setAttribute(attr,map[value]);
      }
    }
  }

  function watchTranslations(){
    const pending=new Set();let scheduled=false;
    const observer=new MutationObserver(records=>{
      if(state.language!=='en')return;
      for(const record of records){
        if(record.type==='childList')for(const node of record.addedNodes)pending.add(node);
        else pending.add(record.target);
      }
      if(scheduled||!pending.size)return;
      scheduled=true;queueMicrotask(()=>{
        scheduled=false;const roots=[...pending];pending.clear();
        for(const root of roots)if(root.isConnected)translateContent(root);
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','alt']});
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
    if(document.body.classList.contains('seo-landing')){
      document.querySelectorAll('.seo-service-card[data-product-id]').forEach(card=>{
        const id=card.dataset.productId,p=card.querySelector('p');
        if(p){if(!p.dataset.descriptionAr)p.dataset.descriptionAr=p.textContent;p.textContent=en?catalogText(p.dataset.descriptionAr,'description',id):p.dataset.descriptionAr;}
      });
      const count=document.querySelector('.seo-landing main>.seo-intro:last-of-type');
      if(count){const n=document.querySelectorAll('.seo-service-card').length;count.textContent=en?n+' services · Open a service to review current plans, prices and availability.':n+' خدمة · افتح صفحة الخدمة لمراجعة الباقات والأسعار والتوفر الحالي.';}
    }
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
    if(account)account.textContent=account.dataset.authenticated==='false'?(en?'Sign in':'تسجيل الدخول'):(en?'My account':'حسابي');
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
      acts.forEach(a=>{
        if(a.classList.contains('account-hero-link')){a.textContent=en?'My account & wallet':'حسابي ومحفظتي';a.setAttribute('aria-label',a.textContent);a.title=a.textContent;}
        else if(a.classList.contains('whatsapp-only')){a.setAttribute('aria-label',en?'WhatsApp support':'دعم واتساب');a.title=en?'WhatsApp support':'دعم واتساب';}
      });
      const facts=document.querySelectorAll('.hero-facts > div');
      const count=window.MasterCatalog?.products?.filter(p=>!p.redirectTo).length;
      const countLabel=count?String(count):'65+';
      if(facts[0])facts[0].innerHTML='<strong data-catalog-count>'+countLabel+'</strong><span>'+(en?'services in the catalog':'خدمة في الكتالوج')+'</span>';
      if(facts[1])facts[1].innerHTML=en?'<strong>Written warranty</strong><span>See each plan’s terms</span>':'<strong>ضمان مكتوب</strong><span>حسب تفاصيل كل باقة</span>';
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
      setText('.account-head .eyebrow','MASTER STORE','MASTER STORE');
      setText('.account-head h1','حسابك، طلباتك، ورصيدك.','Your account, orders, and balance.');
      setText('.account-head p','كل تفاصيلك في مكان واحد. تابع طلباتك واشحن محفظتك بسهولة.','Everything in one place. Track orders and top up your wallet.');
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
    translateContent(document.body);
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
    const latest=getPref();
    if(latest.manualMarket&&MARKETS[latest.market])return;
    state.market=marketFromCountry(country);
    if(!latest.language){
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
    catalogText,setMarket,setLanguage,t,apply,text:value=>state.language==='en'?(exactArToEn[value]||value):(exactEnToAr[value]||value)
  };

  // Scripts are loaded at the end of <body>, so initialize immediately.
  // This makes the selected market/language available before app.js/product-page.js render.
  init();
  watchTranslations();
})();
