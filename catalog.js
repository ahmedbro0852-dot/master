const products = [
  {
    "id": "chatgpt-plus",
    "name": "ChatGPT Plus",
    "category": "AI Tools",
    "logo": "chatgpt",
    "status": "available",
    "description": "تفعيل ChatGPT Plus على حساب العميل الشخصي.",
    "plans": [
      {
        "name": "ChatGPT Plus",
        "duration": "1 شهر",
        "price": 1100,
        "activation": "تفعيل على حساب العميل.",
        "account": "حساب العميل الشخصي",
        "warranty": "ضمان كامل",
        "notes": [
          "لا يتم تخزين بيانات دخولك داخل الموقع."
        ]
      }
    ]
  },
  {
    "id": "gemini-pro",
    "name": "Gemini Pro",
    "category": "AI Tools",
    "logo": "gemini",
    "logoUrl": "https://cdn.simpleicons.org/googlegemini",
    "status": "available",
    "description": "عرضان لمدة 18 شهر بنفس المزايا؛ الباقة العائلية تضيف 5 دعوات إضافية بجانب حساب المتحكم.",
    "plans": [
      {
        "name": "Gemini Pro",
        "duration": "18 شهر",
        "price": 150,
        "activation": "رابط تفعيل مباشر على البريد الشخصي — بدون بطاقة أو بيانات دفع.",
        "account": "حساب العميل الشخصي",
        "warranty": "ضمان كامل",
        "credits": "1,000 Credit شهريًا",
        "features": [
          "1,000 Credit شهريًا للاستخدام داخل الخدمة"
        ]
      },
      {
        "name": "Gemini العائلي",
        "duration": "18 شهر",
        "price": 250,
        "activation": "نفس تفعيل Gemini Pro + 5 دعوات عائلية إضافية.",
        "account": "حساب المتحكم + 5 دعوات إضافية",
        "warranty": "ضمان كامل",
        "credits": "1,000 Credit شهريًا لكل حساب",
        "features": [
          "1,000 Credit شهريًا لكل حساب",
          "5 دعوات عائلية إضافية لاستخدام Gemini"
        ]
      }
    ]
  },
  {
    "id": "claude-pro",
    "name": "Claude Pro",
    "category": "AI Tools",
    "logo": "claude",
    "logoUrl": "https://cdn.simpleicons.org/claude",
    "status": "available",
    "description": "تفعيل Claude على حسابك الشخصي باستخدام وسيلة دفع المتجر.",
    "plans": [
      {
        "name": "Claude Pro",
        "duration": "1 شهر",
        "price": 1250,
        "activation": "تفعيل خلال ساعة إلى ساعتين على حساب العميل.",
        "account": "حساب العميل الشخصي",
        "warranty": "ضمان كامل",
        "notes": [
          "السعر خاص بعرض المتجر الحالي."
        ]
      }
    ]
  },
  {
    "id": "perplexity-pro",
    "name": "Perplexity Pro",
    "category": "AI Tools",
    "logo": "perplexity",
    "logoUrl": "https://cdn.simpleicons.org/perplexity",
    "status": "available",
    "description": "حساب خاص جاهز مع ضمان كامل حسب عرض المتجر.",
    "plans": [
      {
        "name": "Perplexity Pro",
        "duration": "1 شهر",
        "price": 550,
        "activation": "تسليم حساب جاهز، وقد يطلب كود دخول أول مرة.",
        "account": "حساب خاص جاهز",
        "warranty": "ضمان كامل",
        "notes": [
          "يفضل عدم تغيير كلمة المرور حتى لا تتأثر خدمة الدعم/الضمان."
        ]
      }
    ]
  },
  {
    "id": "lovable-pro",
    "name": "Lovable Pro",
    "category": "AI Tools",
    "logo": "lovable",
    "status": "available",
    "description": "اشتراك Lovable Pro لمدة 12 شهر.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 1800,
        "activation": "تفعيل مباشر على حساب Lovable",
        "account": "حساب العميل الشخصي — بدون طلب كلمة مرور Gmail",
        "warranty": "ضمان كامل",
        "notes": [
          "طريقة التسليم والضمان يتم تأكيدهما قبل التحويل."
        ]
      }
    ]
  },
  {
    "id": "lovable-lite",
    "name": "Lovable Pro Lite",
    "category": "AI Tools",
    "logo": "lovable",
    "status": "available",
    "description": "خطة سنوية برصيد أساسي مع Credits يومية.",
    "plans": [
      {
        "name": "Pro Lite",
        "duration": "12 شهر",
        "price": 650,
        "oldPrice": 750,
        "activation": "رابط تفعيل على البريد الشخصي — بدون بطاقة.",
        "account": "حساب العميل",
        "warranty": "ضمان كامل",
        "credits": "300 Credit + 5 Credits يوميًا لمدة سنة"
      }
    ]
  },
  {
    "id": "runway-pro",
    "name": "Runway Pro",
    "category": "AI Tools",
    "logo": "runway",
    "status": "out",
    "description": "الخدمة غير متوفرة حاليًا.",
    "plans": []
  },
  {
    "id": "wink-ai",
    "name": "Wink AI Pro",
    "category": "AI Tools",
    "logo": "wink",
    "status": "available",
    "description": "حساب جاهز لأدوات Wink AI.",
    "plans": [
      {
        "name": "7 أيام",
        "duration": "7 أيام",
        "price": 150,
        "activation": "تسليم حساب جاهز خلال 5 دقائق",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل"
      },
      {
        "name": "شهر",
        "duration": "1 شهر",
        "price": 400,
        "activation": "حساب جاهز؛ التفاصيل تُؤكد قبل الدفع.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل"
      }
    ],
  },
  {
    "id": "grok",
    "name": "Grok",
    "category": "AI Tools",
    "logo": "grok",
    "status": "available",
    "description": "حساب Grok جاهز لمدة قصيرة بسعر عرض.",
    "plans": [
      {
        "name": "عرض 10 أيام",
        "duration": "10 أيام",
        "price": 220,
        "oldPrice": 250,
        "activation": "بريد + كلمة مرور.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "gamma-plus",
    "name": "Gamma Plus",
    "category": "AI Tools",
    "logo": "gamma",
    "status": "available",
    "description": "حساب Gamma Plus جاهز.",
    "plans": [
      {
        "name": "Plus",
        "duration": "1 شهر",
        "price": 400,
        "activation": "تسليم حساب جاهز.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "gamma-account",
    "name": "Gamma Account",
    "category": "AI Tools",
    "logo": "gamma",
    "status": "available",
    "description": "حساب واحد يحتوي على 10 Workspaces، كل Workspace به 2,000 Credit.",
    "plans": [
      {
        "name": "10 Workspaces",
        "duration": "12 شهر",
        "price": 800,
        "activation": "تسليم حساب جاهز.",
        "account": "حساب واحد — الحد الأقصى للكمية 1",
        "warranty": "ضمان كامل",
        "credits": "20,000 Credit إجماليًا",
        "notes": [
          "غيّر كلمة المرور فور الاستلام.",
          "لا يوجد ضمان لنسيان كلمة المرور.",
          "لـ Upgrade كامل قد يلزم تزويد الدعم بكلمة المرور، ويتم التنفيذ خلال 3 أيام.",
          "لا تترك أي Workspace بدون إذن لأن ذلك قد يفقدك صلاحيات العرض."
        ]
      }
    ]
  },
  {
    "id": "elevenlabs",
    "name": "ElevenLabs",
    "category": "AI Tools",
    "logo": "elevenlabs",
    "logoUrl": "https://cdn.simpleicons.org/elevenlabs",
    "status": "available",
    "description": "حساب ElevenLabs جاهز بخطة Creator مع 131,000 Credit.",
    "plans": [
      {
        "name": "Creator",
        "duration": "1 شهر",
        "price": 550,
        "activation": "تسليم حساب جاهز.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "131,000 Credit"
      }
    ]
  },
  {
    "id": "heygen",
    "name": "HeyGen",
    "category": "AI Tools",
    "logo": "heygen",
    "status": "available",
    "description": "حساب HeyGen جاهز مع 1,250 Credit.",
    "plans": [
      {
        "name": "1,250 Credits",
        "duration": "1 شهر",
        "price": 1250,
        "activation": "تسليم حساب جاهز خلال 5–6 ساعات.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "1,250 Credit"
      }
    ]
  },
  {
    "id": "canva-pro",
    "name": "Canva Pro",
    "category": "التصميم",
    "logo": "canva",
    "status": "available",
    "description": "تفعيل Canva Pro على البريد الشخصي.",
    "plans": [
      {
        "name": "Canva Pro",
        "duration": "3 سنوات",
        "price": 50,
        "activation": "تفعيل على البريد الشخصي خلال وقت قصير.",
        "account": "حساب العميل",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "capcut-pro",
    "name": "CapCut Pro",
    "category": "التصميم",
    "logo": "capcut",
    "status": "available",
    "description": "حسابات CapCut Pro جاهزة بعدة مدد وCredits مختلفة.",
    "plans": [
      {
        "name": "7 أيام",
        "duration": "7 أيام",
        "price": 50,
        "activation": "بريد + كلمة مرور؛ قد يطلب كود دخول.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "قد لا يوجد Credits أو تكون قليلة",
        "notes": [
          "لا يوجد اعتراض على عدم وجود Credits في باقة 7 أيام."
        ]
      },
      {
        "name": "شهر",
        "duration": "1 شهر",
        "price": 150,
        "activation": "بريد + كلمة مرور؛ قد يطلب كود دخول.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "عادةً 500 Credit",
        "notes": [
          "يمكن الاعتراض إذا كان الرصيد المتفق عليه غير موجود."
        ]
      },
      {
        "name": "شهر — 1600 Credits",
        "duration": "1 شهر",
        "price": 300,
        "activation": "بريد + كلمة مرور؛ قد يطلب كود دخول.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "1,600 Credit",
        "notes": [
          "يمكن الاعتراض إذا كان الرصيد المتفق عليه غير موجود."
        ]
      },
      {
        "name": "3 شهور",
        "duration": "3 شهور",
        "price": 550,
        "activation": "بريد + كلمة مرور؛ قد يطلب كود دخول.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "يتغير عادةً بين 500–1000"
      },
      {
        "name": "6 شهور",
        "duration": "6 شهور",
        "price": 950,
        "activation": "بريد + كلمة مرور؛ قد يطلب كود دخول.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "500–1000 Credit شهريًا"
      },
      {
        "name": "سنة",
        "duration": "12 شهر",
        "price": 1400,
        "activation": "بريد + كلمة مرور؛ قد يطلب كود دخول.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "يتغير عادةً بين 500–1000"
      }
    ],
    "notes": [
      "يفضل عدم تغيير كلمة المرور في الحسابات الجاهزة إلا على مسؤوليتك."
    ]
  },
  {
    "id": "figma",
    "name": "Figma",
    "category": "التصميم",
    "logo": "figma",
    "logoUrl": "https://cdn.simpleicons.org/figma",
    "status": "available",
    "description": "اشتراك Figma لمدة 12 شهر.",
    "plans": [
      {
        "name": "Professional",
        "duration": "12 شهر",
        "price": 750,
        "activation": "دعوة أو حساب",
        "account": "حسب المتوفر",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "freepik",
    "name": "Freepik",
    "category": "التصميم",
    "logo": "freepik",
    "logoUrl": "https://cdn.simpleicons.org/freepik",
    "status": "available",
    "description": "تسليم حساب Freepik جاهز لمدة شهر.",
    "plans": [
      {
        "name": "حساب Freepik",
        "duration": "1 شهر",
        "price": 450,
        "activation": "تسليم حساب جاهز.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "adobe-cc",
    "name": "Adobe Creative Cloud",
    "category": "التصميم",
    "logo": "adobe",
    "status": "out",
    "description": "المخزون غير متوفر حاليًا.",
    "plans": []
  },
  {
    "id": "duolingo",
    "name": "Duolingo",
    "category": "التعليم",
    "logo": "duolingo",
    "logoUrl": "https://cdn.simpleicons.org/duolingo",
    "status": "available",
    "description": "اشتراك سنة على البريد الشخصي.",
    "plans": [
      {
        "name": "سنة",
        "duration": "12 شهر",
        "price": 300,
        "activation": "رابط تفعيل على البريد الشخصي — بدون بطاقة.",
        "account": "حساب العميل",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "elsa",
    "name": "ELSA Speak",
    "category": "التعليم",
    "logo": "elsa",
    "status": "available",
    "description": "اشتراك ELSA Speak للتدريب على النطق والمحادثة.",
    "plans": [
      {
        "name": "7 أيام",
        "duration": "7 أيام",
        "price": 90,
        "activation": "تسليم أو تفعيل",
        "account": "حساب فردي",
        "warranty": "ضمان كامل"
      },
      {
        "name": "12 شهر",
        "duration": "12 شهر",
        "price": 1900,
        "activation": "تسليم أو تفعيل",
        "account": "حساب فردي",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "coursera",
    "name": "Coursera",
    "category": "التعليم",
    "logo": "coursera",
    "logoUrl": "https://cdn.simpleicons.org/coursera",
    "status": "available",
    "description": "خيارات Coursera بمدد وأنواع حساب مختلفة.",
    "plans": [
      {
        "name": "3 شهور — حساب خاص",
        "duration": "3 شهور",
        "price": 300,
        "activation": "تسليم حساب خاص.",
        "account": "حساب خاص",
        "warranty": "ضمان كامل"
      },
      {
        "name": "سنة — حساب مشترك",
        "duration": "12 شهر",
        "price": 300,
        "activation": "تسليم حساب مشترك.",
        "account": "حساب مشترك",
        "warranty": "ضمان كامل",
        "notes": [
          "قد تكون بعض الدورات مؤهلة لشهادة باسمك، لكن المتجر لا يضمن الشهادات في الحساب المشترك."
        ]
      },
      {
        "name": "سنة — حساب خاص",
        "duration": "12 شهر",
        "price": 1000,
        "activation": "تسليم حساب خاص.",
        "account": "حساب خاص",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "quizizz",
    "name": "Quizizz",
    "category": "التعليم",
    "logo": "quizizz",
    "status": "available",
    "description": "اشتراك Quizizz على بريد العميل.",
    "plans": [
      {
        "name": "12 شهر",
        "duration": "12 شهر",
        "price": 1500,
        "activation": "تفعيل على البريد الشخصي.",
        "account": "حساب العميل",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "wordwall",
    "name": "Wordwall Pro",
    "category": "التعليم",
    "logo": "wordwall",
    "status": "available",
    "description": "اشتراك Wordwall Pro لمدة شهر أو سنة.",
    "plans": [
      {
        "name": "شهر",
        "duration": "1 شهر",
        "price": 300,
        "activation": "تسليم حساب جاهز",
        "account": "إيميل وكلمة مرور",
        "warranty": "ضمان كامل"
      },
      {
        "name": "سنة",
        "duration": "12 شهر",
        "price": 1050,
        "activation": "تسليم حساب جاهز",
        "account": "إيميل وكلمة مرور",
        "warranty": "ضمان كامل"
      }
    ],
  },
  {
    "id": "turnitin",
    "name": "Turnitin",
    "category": "التعليم",
    "logo": "turnitin",
    "logoUrl": "https://kr.turnitin.com/assets/images/shared-assets-1/product-logos/logo-tii.svg",
    "status": "available",
    "description": "خدمة فحص ملف واحد وإرسال تقرير التشابه.",
    "plans": [
      {
        "name": "فحص ملف",
        "duration": "ملف واحد",
        "price": 250,
        "activation": "ترسل الملف المطلوب فحصه.",
        "account": "خدمة ملف — بدون حساب",
        "warranty": "ضمان كامل",
        "notes": [
          "الخدمة لا تضمن درجة أكاديمية أو نتيجة معينة."
        ]
      }
    ]
  },
  {
    "id": "microsoft-365",
    "name": "Microsoft 365",
    "category": "الإنتاجية",
    "logo": "microsoft",
    "status": "available",
    "description": "اشتراك Microsoft 365 لمدة سنة.",
    "plans": [
      {
        "name": "سنة",
        "duration": "12 شهر",
        "price": 200,
        "activation": "حساب جاهز أو تفعيل",
        "account": "احتفظ بالبيانات الأصلية عند استلام حساب جاهز",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "notion",
    "name": "Notion",
    "category": "الإنتاجية",
    "logo": "notion",
    "logoUrl": "https://cdn.simpleicons.org/notion",
    "status": "available",
    "description": "خطط Notion Plus وBusiness بمدد مختلفة.",
    "plans": [
      {
        "name": "Plus — 3 شهور",
        "duration": "3 شهور",
        "price": 400,
        "activation": "تفعيل على البريد الشخصي أو حساب جاهز؛ قد يحتاج OTP.",
        "account": "شخصي أو جاهز",
        "warranty": "ضمان كامل"
      },
      {
        "name": "Business — 6 شهور",
        "duration": "6 شهور",
        "price": 600,
        "activation": "حساب شخصي أو جاهز؛ قد يتطلب OTP",
        "account": "شخصي أو جاهز",
        "warranty": "ضمان كامل"
      },
      {
        "name": "Business — 12 شهر",
        "duration": "12 شهر",
        "price": 950,
        "activation": "حساب شخصي أو جاهز؛ قد يتطلب OTP",
        "account": "شخصي أو جاهز",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "linkedin-premium",
    "name": "LinkedIn Premium",
    "category": "الإنتاجية",
    "logo": "linkedin",
    "status": "available",
    "description": "تفعيل Premium على الحساب الشخصي عبر رابط يستخدم مرة واحدة.",
    "plans": [
      {
        "name": "3 شهور",
        "duration": "3 شهور",
        "price": 250,
        "activation": "رابط تفعيل لمرة واحدة ويتطلب بطاقة.",
        "account": "حساب شخصي",
        "warranty": "ضمان كامل",
        "notes": [
          "بعد فتح/استخدام رابط التفعيل يُعتبر مستهلكًا ولا يمكن إعادة استخدامه."
        ]
      }
    ]
  },
  {
    "id": "zoom",
    "name": "Zoom Pro",
    "category": "الإنتاجية",
    "logo": "zoom",
    "logoUrl": "https://cdn.simpleicons.org/zoom",
    "status": "available",
    "description": "اشتراكات Zoom Pro بعدة مدد، بحساب جاهز أو تفعيل على بريدك.",
    "plans": [
      {
        "name": "Zoom Pro — شهر (حساب جاهز)",
        "duration": "1 شهر",
        "price": 250,
        "activation": "تسليم حساب جاهز.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "notes": [
          "قد تعمل بعض الحسابات شهرًا كاملًا أو تتوقف بعد نحو 14 يومًا؛ الضمان الكامل يغطي العرض حسب شروط المتجر."
        ]
      },
      {
        "name": "Zoom Pro — 3 شهور",
        "duration": "3 شهور",
        "price": 550,
        "activation": "تسليم حساب جاهز",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      },
      {
        "name": "Zoom Pro — سنة",
        "duration": "12 شهر",
        "price": 1800,
        "activation": "تسليم حساب جاهز",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      },
      {
        "name": "Zoom Pro — شهر على بريدك",
        "duration": "1 شهر",
        "price": 300,
        "activation": "تفعيل على بريد العميل.",
        "account": "حساب العميل",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "stealth-writer",
    "name": "Stealth Writer",
    "category": "الإنتاجية",
    "logo": "stealthwriter",
    "status": "available",
    "description": "خدمة Humanize وإعادة صياغة النصوص.",
    "plans": [
      {
        "name": "شهر",
        "duration": "1 شهر",
        "price": 400,
        "activation": "تسليم حساب",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل",
        "credits": "حتى 10 Humanize يوميًا، وحتى 5,000 كلمة للعملية",
        "notes": [
          "لا يوجد ضمان 100% لتجاوز كل أدوات كشف المحتوى بالذكاء الاصطناعي."
        ]
      }
    ],
  },
  {
    "id": "icloud",
    "name": "iCloud 4TB",
    "category": "الإنتاجية",
    "logo": "icloud",
    "logoUrl": "https://cdn.simpleicons.org/icloud",
    "status": "available",
    "description": "عرض مساحة iCloud إجمالية 4TB.",
    "plans": [
      {
        "name": "4TB",
        "duration": "1 شهر",
        "price": 1450,
        "activation": "دعوة Apple ID عبر المشاركة العائلية.",
        "account": "مشاركة عائلية",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "surfshark",
    "name": "Surfshark",
    "category": "VPN والحماية",
    "logo": "surfshark",
    "logoUrl": "https://cdn.simpleicons.org/surfshark",
    "status": "available",
    "description": "كوبون Surfshark لمدة شهرين.",
    "plans": [
      {
        "name": "كوبون شهرين",
        "duration": "2 شهر",
        "price": 200,
        "activation": "تفعيل كوبون ويتطلب بطاقة.",
        "account": "حساب العميل",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "nordvpn",
    "name": "NordVPN",
    "category": "VPN والحماية",
    "logo": "nordvpn",
    "logoUrl": "https://cdn.simpleicons.org/nordvpn",
    "status": "available",
    "description": "اشتراك NordVPN لمدة 3 شهور.",
    "plans": [
      {
        "name": "3 شهور",
        "duration": "3 شهور",
        "price": 300,
        "activation": "تسليم حساب جاهز — لا يحتاج بطاقة",
        "account": "إيميل وكلمة مرور",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "proton-vpn",
    "name": "Proton VPN",
    "category": "VPN والحماية",
    "logo": "protonvpn",
    "logoUrl": "https://cdn.simpleicons.org/protonvpn",
    "status": "available",
    "description": "حساب Proton VPN لمدة سنة لجهاز واحد.",
    "plans": [
      {
        "name": "سنة",
        "duration": "12 شهر",
        "price": 800,
        "activation": "تسليم بريد/حساب جاهز مع كود يقدمه المتجر عند الحاجة.",
        "account": "حساب جاهز — جهاز واحد",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "hma-vpn",
    "name": "HMA VPN",
    "category": "VPN والحماية",
    "logo": "hma",
    "status": "available",
    "description": "عرض HMA قصير المدة.",
    "plans": [
      {
        "name": "عرض HMA",
        "duration": "30 يوم",
        "price": 100,
        "activation": "تسليم حساب جاهز.",
        "account": "إيميل وكلمة مرور",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "expressvpn",
    "name": "ExpressVPN",
    "category": "VPN والحماية",
    "logo": "expressvpn",
    "logoUrl": "https://cdn.simpleicons.org/expressvpn",
    "status": "available",
    "description": "اشتراك ExpressVPN قصير المدة.",
    "plans": [
      {
        "name": "Basic",
        "duration": "3 أيام",
        "price": 50,
        "activation": "تفعيل",
        "account": "حسب العرض",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "spotify",
    "name": "Spotify Premium",
    "category": "الترفيه",
    "logo": "spotify",
    "logoUrl": "https://cdn.simpleicons.org/spotify",
    "status": "available",
    "description": "تفعيل Spotify Premium على حساب العميل الشخصي.",
    "plans": [
      {
        "name": "3 شهور",
        "duration": "3 شهور",
        "price": 100,
        "activation": "رابط تفعيل على حساب العميل.",
        "account": "حساب شخصي",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "youtube",
    "name": "YouTube Premium",
    "category": "الترفيه",
    "logo": "youtube",
    "logoUrl": "https://cdn.simpleicons.org/youtube",
    "status": "available",
    "description": "تفعيل YouTube Premium على حسابك الشخصي.",
    "plans": [
      {
        "name": "3 شهور",
        "duration": "3 شهور",
        "price": 200,
        "activation": "رابط تفعيل ويتطلب بطاقة.",
        "account": "حساب شخصي",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "kling",
    "name": "Kling AI",
    "category": "AI Tools",
    "logo": "kling",
    "status": "out",
    "description": "المخزون منتهٍ حاليًا.",
    "plans": []
  },
  {
    "id": "grammarly",
    "name": "Grammarly Premium",
    "category": "الإنتاجية",
    "logo": "grammarly",
    "logoUrl": "https://cdn.simpleicons.org/grammarly",
    "status": "available",
    "description": "اشتراك Grammarly Premium بمميزات الكتابة المتقدمة والتصحيح والصياغة وأدوات الذكاء الاصطناعي المتاحة في الخطة.",
    "features": [
      "تصحيح الأخطاء الإملائية والنحوية باحترافية",
      "تحسين أسلوب الكتابة والصياغة",
      "اقتراحات متقدمة للكلمات والجمل",
      "أدوات الذكاء الاصطناعي المتاحة في الخطة",
      "مناسب للدراسة والعمل والكتابة الاحترافية",
      "تفعيل سريع ودعم أثناء فترة الاشتراك"
    ],
    "plans": [
      {
        "name": "شهر واحد",
        "duration": "1 شهر",
        "price": 300,
        "oldPrice": 1500,
        "activation": "تفعيل سريع وتسليم التفاصيل بعد تأكيد الطلب.",
        "account": "حسب العرض المتوفر",
        "warranty": "ضمان كامل"
      },
      {
        "name": "شهرين",
        "duration": "2 شهر",
        "price": 450,
        "oldPrice": 3000,
        "activation": "تفعيل سريع وتسليم التفاصيل بعد تأكيد الطلب.",
        "account": "حسب العرض المتوفر",
        "warranty": "ضمان كامل"
      },
      {
        "name": "3 أشهر",
        "duration": "3 شهور",
        "price": 750,
        "oldPrice": 4500,
        "activation": "تفعيل سريع وتسليم التفاصيل بعد تأكيد الطلب.",
        "account": "حسب العرض المتوفر",
        "warranty": "ضمان كامل"
      },
      {
        "name": "6 أشهر",
        "duration": "6 شهور",
        "price": 1100,
        "oldPrice": 9000,
        "activation": "تفعيل سريع وتسليم التفاصيل بعد تأكيد الطلب.",
        "account": "حسب العرض المتوفر",
        "warranty": "ضمان كامل"
      },
      {
        "name": "12 شهر — سنة كاملة",
        "duration": "12 شهر",
        "price": 1700,
        "oldPrice": 18000,
        "activation": "تفعيل سريع وتسليم التفاصيل بعد تأكيد الطلب.",
        "account": "حسب العرض المتوفر",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "quillbot",
    "name": "QuillBot Premium",
    "category": "الإنتاجية",
    "logo": "quillbot",
    "status": "soon",
    "description": "قريبًا في MASTER STORE.",
    "plans": []
  },
  {
    "id": "envato",
    "name": "Envato Elements",
    "category": "التصميم",
    "logo": "envato",
    "logoUrl": "https://cdn.simpleicons.org/envato",
    "status": "soon",
    "description": "قريبًا في MASTER STORE.",
    "plans": []
  },
  {
    "id": "motion-array",
    "name": "Motion Array",
    "category": "التصميم",
    "logo": "motionarray",
    "status": "soon",
    "description": "قريبًا في MASTER STORE.",
    "plans": [],
  },
  {
    "id": "suno",
    "name": "Suno AI Pro",
    "category": "AI Tools",
    "logo": "suno",
    "logoUrl": "https://cdn.simpleicons.org/suno",
    "status": "soon",
    "description": "قريبًا في MASTER STORE.",
    "plans": []
  },
  {
    "id": "murf",
    "name": "Murf AI",
    "category": "AI Tools",
    "logo": "murf",
    "status": "soon",
    "description": "قريبًا في MASTER STORE.",
    "plans": []
  },
  {
    "id": "discord",
    "name": "Discord Nitro",
    "category": "الترفيه",
    "logo": "discord",
    "logoUrl": "https://cdn.simpleicons.org/discord",
    "status": "soon",
    "description": "قريبًا في MASTER STORE.",
    "plans": []
  },
  {
    "id": "midjourney",
    "name": "Midjourney",
    "category": "AI Tools",
    "logo": "midjourney",
    "status": "out",
    "description": "الخدمة غير متوفرة حاليًا.",
    "plans": []
  },
  {
    "id": "leonardo-ai",
    "name": "Leonardo AI",
    "category": "AI Tools",
    "logo": "leonardo",
    "status": "out",
    "description": "الخدمة غير متوفرة حاليًا.",
    "plans": []
  },
  {
    "id": "manus",
    "name": "Manus",
    "category": "AI Tools",
    "logo": "manus",
    "status": "available",
    "description": "وكيل ذكاء اصطناعي لتنفيذ المهام والبحث وتنظيم سير العمل.",
    "plans": [
      {
        "name": "خطة سنوية",
        "duration": "12 شهر",
        "price": 2250,
        "activation": "تسليم حساب خاص.",
        "account": "حساب خاص — يُفضل عدم تغيير البيانات",
        "warranty": "ضمان كامل",
        "credits": "4,000 Credit شهريًا"
      }
    ]
  },
  {
    "id": "gumloop",
    "name": "Gumloop",
    "category": "AI Tools",
    "logo": "gumloop",
    "status": "available",
    "description": "أتمتة سير العمل وربط المهام المدعومة بالذكاء الاصطناعي.",
    "plans": [
      {
        "name": "20,000 Credits",
        "duration": "حسب الرصيد",
        "price": 350,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل",
        "credits": "20,000 Credits"
      }
    ]
  },
  {
    "id": "magic-patterns",
    "name": "Magic Patterns",
    "category": "AI Tools",
    "logo": "magicpatterns",
    "status": "available",
    "description": "إنشاء واجهات وتجارب رقمية من الأوصاف النصية.",
    "plans": [
      {
        "name": "Starter",
        "duration": "12 شهر",
        "price": 450,
        "activation": "دعوة أو حساب جاهز.",
        "account": "حسب المتوفر",
        "warranty": "ضمان كامل"
      }
    ],
  },
  {
    "id": "factory-pro",
    "name": "Factory Pro",
    "category": "AI Tools",
    "logo": "factory",
    "status": "available",
    "description": "خطة للمطورين والفرق لبناء البرمجيات بمساعدة الذكاء الاصطناعي.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 1850,
        "activation": "Workspace.",
        "account": "احتفظ بالبيانات الأصلية",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "framer-pro",
    "name": "Framer Pro",
    "category": "AI Tools",
    "logo": "framer",
    "logoUrl": "https://cdn.simpleicons.org/framer",
    "status": "available",
    "description": "تصميم ونشر المواقع التفاعلية بسرعة ومن دون تعقيد.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 600,
        "activation": "دعوة أو حساب.",
        "account": "حسب المتوفر",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "supabase-pro",
    "name": "Supabase Pro",
    "category": "AI Tools",
    "logo": "supabase",
    "logoUrl": "https://cdn.simpleicons.org/supabase",
    "status": "available",
    "description": "قواعد بيانات ومصادقة وبنية خلفية للمشاريع الرقمية.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 1550,
        "activation": "حساب أو Organization.",
        "account": "احتفظ بالبيانات الأصلية",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "railway-hobby",
    "name": "Railway Hobby",
    "category": "الإنتاجية",
    "logo": "railway",
    "logoUrl": "https://cdn.simpleicons.org/railway",
    "status": "available",
    "description": "خطة Hobby لتشغيل ونشر المشاريع والتطبيقات.",
    "plans": [
      {
        "name": "Hobby",
        "duration": "12 شهر",
        "price": 650,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "pangram-pro",
    "name": "Pangram Pro",
    "category": "الإنتاجية",
    "logo": "pangram",
    "status": "available",
    "description": "أدوات احترافية لتحليل المحتوى والعمل على النصوص.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 650,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ],
  },
  {
    "id": "supercut-pro",
    "name": "Supercut Pro",
    "category": "الإنتاجية",
    "logo": "supercut",
    "status": "available",
    "description": "خطة Pro لأدوات صناعة وتحرير المحتوى.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 600,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ],
  },
  {
    "id": "wispr-flow-pro",
    "name": "Wispr Flow Pro",
    "category": "الإنتاجية",
    "logo": "wispr",
    "status": "available",
    "description": "إملاء صوتي ذكي وتحويل الكلام إلى نص أثناء العمل.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 800,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "mobbin-team",
    "name": "Mobbin Team",
    "category": "الإنتاجية",
    "logo": "mobbin",
    "status": "available",
    "description": "مكتبة مراجع لتصميم واجهات وتجارب المستخدم.",
    "plans": [
      {
        "name": "Team",
        "duration": "12 شهر",
        "price": 600,
        "activation": "دعوة إلى Team.",
        "account": "احتفظ بإعدادات الفريق",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "granola-business",
    "name": "Granola Business",
    "category": "الإنتاجية",
    "logo": "granola",
    "status": "available",
    "description": "تدوين وتنظيم ملاحظات الاجتماعات بمساعدة الذكاء الاصطناعي.",
    "plans": [
      {
        "name": "Business",
        "duration": "12 شهر",
        "price": 300,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ],
  },
  {
    "id": "jam-team",
    "name": "Jam Team",
    "category": "الإنتاجية",
    "logo": "jam",
    "status": "available",
    "description": "تسجيل ومشاركة مشكلات المواقع والتعاون عليها مع الفريق.",
    "plans": [
      {
        "name": "Team",
        "duration": "12 شهر",
        "price": 1550,
        "activation": "دعوة إلى Team.",
        "account": "احتفظ بالبيانات الأصلية",
        "warranty": "ضمان كامل"
      }
    ],
  },
  {
    "id": "readwise-reader",
    "name": "Readwise + Reader",
    "category": "الإنتاجية",
    "logo": "readwise",
    "status": "available",
    "description": "حفظ وتنظيم ومراجعة المقالات والكتب والملاحظات.",
    "plans": [
      {
        "name": "Readwise + Reader",
        "duration": "12 شهر",
        "price": 650,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "waking-up",
    "name": "Waking Up",
    "category": "الإنتاجية",
    "logo": "wakingup",
    "status": "available",
    "description": "اشتراك كامل في تطبيق Waking Up.",
    "plans": [
      {
        "name": "اشتراك كامل",
        "duration": "12 شهر",
        "price": 650,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "linear-business",
    "name": "Linear Business",
    "category": "الإنتاجية",
    "logo": "linear",
    "logoUrl": "https://cdn.simpleicons.org/linear",
    "status": "available",
    "description": "إدارة المشاريع والمهام للفرق بخطة Business.",
    "plans": [
      {
        "name": "Business",
        "duration": "5 شهور",
        "price": 600,
        "activation": "دعوة أو حساب.",
        "account": "حسب المتوفر",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "posthog-scale",
    "name": "PostHog Scale",
    "category": "الإنتاجية",
    "logo": "posthog",
    "logoUrl": "https://cdn.simpleicons.org/posthog",
    "status": "available",
    "description": "تحليلات المنتجات وسلوك المستخدمين وفق خطة Scale.",
    "plans": [
      {
        "name": "Scale",
        "duration": "12 شهر",
        "price": 1200,
        "activation": "تسليم حساب.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ]
  },
  {
    "id": "customerio-essentials",
    "name": "Customer.io Essentials",
    "category": "الإنتاجية",
    "logo": "customerio",
    "status": "available",
    "description": "أدوات الرسائل والتواصل الآلي مع العملاء.",
    "plans": [
      {
        "name": "Essentials",
        "duration": "12 شهر",
        "price": 650,
        "activation": "تسليم حساب.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل"
      }
    ]
  }
];


const categoryOrder = ["AI Tools","التصميم","التعليم","الإنتاجية","VPN والحماية","الترفيه"];
function getProduct(id){ return products.find(p => p.id === id); }
function formatPrice(value){ return Number(value).toLocaleString("en-US") + " ج"; }
function startingPrice(product){
  if(!product.plans || !product.plans.length) return "—";
  const nums = product.plans.map(p => Number(p.price)).filter(Number.isFinite);
  if(!nums.length) return "—";
  return formatPrice(Math.min(...nums));
}
function statusLabel(status){
  return status === "available" ? "متاح" : status === "soon" ? "قريبًا" : "غير متوفر";
}
window.MasterCatalog={products,categoryOrder,getProduct,formatPrice,startingPrice,statusLabel};
