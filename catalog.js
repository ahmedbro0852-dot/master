const products = [
  {
    "id": "humanizeai-standard",
    "name": "HumanizeAI Standard",
    "category": "AI Tools",
    "logo": "humanizeai",
    "logoUrl": "data:image/png;base64,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SAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAnNBdAbJ559arkOy2Lwo0rEKIAdEwDQE88/9/S7tdblEgC7zxYA9MDC0cNL3eIfAHtEAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAHpguww3A2APCQDogfX1jdUa5XQA7JG5AHph7cKlUwtHn16JUkfBjyol3pz+GAWwIwIAemTtk0srwV0tHDvyyjQCRgHsiC0AAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEIC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",
    "status": "available",
    "description": "اشتراك HumanizeAI.com بخطة Standard لمدة شهر، بحساب خاص.",
    "plans": [
      {
        "name": "Standard — حساب خاص",
        "planType": "Standard",
        "accountType": "حساب خاص",
        "duration": "1 شهر",
        "price": 943.92,
        "activation": "تسليم حساب خاص.",
        "account": "حساب خاص غير مشترك",
        "warranty": "الضمان يُؤكد قبل الدفع",
        "credits": "75,000 كلمة HumanizeAI شهريًا",
        "officialPrice": {
          "amount": 24,
          "currency": "USD",
          "months": 1,
          "source": "https://humanizeai.com/pricing/",
          "checkedAt": "2026-10-07",
          "basis": "monthly"
        },
        "features": [
          "75,000 كلمة لإعادة صياغة النص شهريًا",
          "200,000 كلمة للكتابة بالذكاء الاصطناعي شهريًا",
          "300,000 كلمة لفحص الذكاء الاصطناعي شهريًا",
          "50,000 كلمة لفحص التشابه شهريًا",
          "تدقيق لغوي وإعادة صياغة"
        ]
      }
    ]
  },
  {
    "id": "academic-pro",
    "name": "Academi Pro",
    "category": "التعليم",
    "logo": "academi",
    "logoUrl": "data:image/png;base64,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",
    "status": "available",
    "description": "اشتراك Academi.cx Pro لفحص الملفات لمدة شهر بسعر 750 جنيه، بتفعيل على حسابك الشخصي.",
    "plans": [
      {
        "name": "Pro — تفعيل على حسابك الشخصي",
        "planType": "Pro",
        "accountType": "تفعيل على حسابك الشخصي",
        "duration": "1 شهر",
        "price": 750,
        "activation": "تفعيل اشتراك Pro على حسابك الشخصي في Academi.cx.",
        "account": "حساب العميل الشخصي",
        "warranty": "الضمان يُؤكد قبل الدفع"
      }
    ]
  },
  {
    "id": "chatgpt-plus",
    "name": "ChatGPT Plus",
    "category": "AI Tools",
    "logo": "chatgpt",
    "status": "available",
    "description": "باقات ChatGPT Plus لمدة شهر: حساب بدون ضمان بـ250 جنيه، حساب جاهز بضمان كامل بـ700 جنيه، أو تفعيل على حسابك الشخصي بـ1040 جنيه.",
    "plans": [
      {
        "name": "ChatGPT Plus — بدون ضمان",
        "accountType": "حساب خاص",
        "duration": "1 شهر",
        "price": 250,
        "activation": "تسليم Gmail + كلمة المرور + بيانات التحقق الثنائي (2FA).",
        "account": "حساب خاص غير مشترك",
        "warranty": "بدون ضمان",
        "notes": [
          "هذه الباقة لمدة شهر وبدون ضمان."
        ]
      },
      {
        "name": "ChatGPT Plus — حساب جاهز",
        "accountType": "حساب جاهز",
        "duration": "1 شهر",
        "price": 700,
        "activation": "تسليم بيانات حساب جاهز.",
        "account": "حساب خاص جاهز",
        "warranty": "ضمان كامل",
        "notes": [
          "يتم تسليم حساب جاهز؛ لا يتم التفعيل على حساب العميل في هذه الباقة."
        ]
      },
      {
        "name": "ChatGPT Plus — على حسابك الشخصي",
        "duration": "1 شهر",
        "price": 1040,
        "activation": "تفعيل على حساب العميل.",
        "account": "حساب العميل الشخصي",
        "warranty": "ضمان كامل",
        "notes": ["لا يتم تخزين بيانات دخولك داخل الموقع."]
      }
    ]
  },
  {
    "id": "chatgpt-teachers-k12",
    "name": "ChatGPT للمعلمين K12",
    "category": "AI Tools",
    "logo": "chatgpt",
    "status": "available",
    "description": "باقة ChatGPT مخصصة للمعلمين K12 لمدة سنتين بـ500 جنيه، بدون ضمان.",
    "plans": [
      {
        "name": "ChatGPT للمعلمين K12 — بدون ضمان",
        "planType": "K12 Teachers",
        "duration": "24 شهر",
        "price": 500,
        "activation": "طريقة التفعيل تُؤكد قبل الدفع.",
        "account": "نوع الحساب يُؤكد قبل الدفع",
        "warranty": "بدون ضمان",
        "notes": [
          "الباقة مخصصة للمعلمين K12؛ شروط الأهلية والتفعيل تُؤكد قبل الدفع.",
          "مدة الباقة سنتان وبدون ضمان."
        ]
      }
    ]
  },
  {
    "id": "gemini-pro",
    "name": "Gemini Pro",
    "category": "AI Tools",
    "logo": "gemini",
    "logoUrl": "logos/gemini.svg",
    "status": "available",
    "description": "عرضان لمدة 18 شهر؛ الباقة العائلية تضيف 5 دعوات إضافية، ورصيد 1,000 Credit شهريًا مخصص للحساب الرئيسي فقط.",
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
        ],
        "oldPrice": 18500
      },
      {
        "name": "Gemini العائلي",
        "duration": "18 شهر",
        "price": 250,
        "activation": "نفس تفعيل Gemini Pro + 5 دعوات عائلية إضافية.",
        "account": "حساب المتحكم + 5 دعوات إضافية",
        "warranty": "ضمان كامل",
        "credits": "1,000 Credit شهريًا للحساب الرئيسي فقط",
        "features": [
          "1,000 Credit شهريًا للحساب الرئيسي فقط",
          "5 دعوات عائلية إضافية لاستخدام Gemini"
        ],
        "oldPrice": 18500
      }
    ]
  },
  {
    "id": "claude-pro",
    "name": "Claude Pro",
    "category": "AI Tools",
    "logo": "claude",
    "logoUrl": "logos/claude.svg",
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
    "logoUrl": "logos/perplexity.svg",
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
        ],
        "oldPrice": 1030
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
    "status": "available",
    "description": "اشتراك Runway Pro لمدة 12 شهر، يُفعّل على حسابك عبر كود استرداد، بضمان 6 شهور.",
    "plans": [
      {
        "name": "Runway Pro",
        "duration": "12 شهر",
        "price": 4600,
        "activation": "تفعيل على حسابك عبر كود استرداد.",
        "account": "حساب العميل الشخصي",
        "warranty": "6 شهور",
        "officialPrice": {
          "amount": 336,
          "currency": "USD",
          "months": 12,
          "source": "https://runwayml.com/pricing",
          "checkedAt": "2026-10-03",
          "basis": "annual"
        },
        "credits": "2,250 Credit شهريًا",
        "notes": [
          "الرصيد الشهري يتجدد كل دورة فوترة، ولا ينتقل الرصيد غير المستخدم للشهر التالي."
        ]
      }
    ],
    "features": [
      "إنشاء الفيديو والصور بالذكاء الاصطناعي",
      "رصيد 2,250 Credit يتجدد شهريًا",
      "رفع دقة الفيديو إلى 4K"
    ],
    "featuresEn": [
      "AI video and image generation",
      "2,250 credits refreshed each month",
      "4K video upscaling"
    ]
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
    ]
  },
  {
    "id": "grok",
    "name": "Super Grok",
    "category": "AI Tools",
    "logo": "grok",
    "status": "available",
    "description": "حساب Grok جاهز لمدة قصيرة بسعر عرض.",
    "plans": [
      {
        "name": "اشتراك واحد",
        "duration": "10 أيام",
        "price": 240,
        "oldPrice": 250,
        "activation": "بريد + كلمة مرور.",
        "account": "حساب جاهز",
        "warranty": "5 أيام"
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
    ],
    "logoUrl": "logos/gamma.svg"
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
    ],
    "logoUrl": "logos/gamma.svg"
  },
  {
    "id": "elevenlabs",
    "name": "ElevenLabs Creator",
    "category": "AI Tools",
    "logo": "elevenlabs",
    "logoUrl": "logos/elevenlabs.svg",
    "status": "available",
    "description": "باقات ElevenLabs Creator: حساب جاهز لمدة شهر، أو تفعيل لمدة 3 شهور على حسابك الشخصي بضمان كامل.",
    "plans": [
      {
        "name": "Creator — تفعيل على حسابك",
        "duration": "3 شهور",
        "price": 1500,
        "activation": "تفعيل على حساب العميل.",
        "account": "حساب العميل الشخصي",
        "warranty": "ضمان كامل",
        "credits": "131 Credit شهريًا"
      },
      {
        "name": "Creator",
        "duration": "1 شهر",
        "price": 550,
        "activation": "تسليم حساب جاهز.",
        "account": "حساب جاهز",
        "warranty": "ضمان كامل",
        "credits": "131,000 Credit",
        "oldPrice": 1140
      }
    ]
  },
  {
    "id": "heygen",
    "name": "HeyGen Creator",
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
        "warranty": "ضمان كامل",
        "oldPrice": 27770
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
    "name": "Figma Professional",
    "category": "التصميم",
    "logo": "figma",
    "logoUrl": "logos/figma.svg",
    "status": "available",
    "description": "اشتراك Figma لمدة 12 شهر.",
    "plans": [
      {
        "name": "Professional",
        "duration": "12 شهر",
        "price": 750,
        "activation": "دعوة أو حساب",
        "account": "حسب المتوفر",
        "warranty": "ضمان كامل",
        "oldPrice": 9870
      }
    ]
  },
  {
    "id": "freepik",
    "name": "Freepik Premium",
    "category": "التصميم",
    "logo": "freepik",
    "logoUrl": "logos/freepik.svg",
    "status": "available",
    "description": "Freepik Premium للتحميل فقط لمدة شهر؛ لا يشمل أدوات أو توليد الذكاء الاصطناعي.",
    "plans": [
      {
        "name": "Freepik Premium — تحميل فقط",
        "notes": ["يشمل تحميل الموارد فقط؛ لا يشمل أدوات أو توليد الذكاء الاصطناعي."],
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
    "name": "Adobe Creative Cloud Pro",
    "category": "التصميم",
    "logo": "adobe",
    "status": "available",
    "description": "اشتراك Adobe Creative Cloud Pro لمدة شهر: دعوة على حسابك الشخصي بـ450 جنيه، أو تفعيل رسمي على حسابك الشخصي بـ850 جنيه.",
    "plans": [
      {
        "name": "Creative Cloud Pro — دعوة",
        "planType": "Creative Cloud Pro",
        "accountType": "دعوة على حسابك الشخصي",
        "duration": "1 شهر",
        "price": 450,
        "activation": "دعوة تُرسل إلى حسابك الشخصي.",
        "account": "حساب العميل الشخصي",
        "warranty": "الضمان يُؤكد قبل الدفع"
      },
      {
        "name": "Creative Cloud Pro — تفعيل رسمي",
        "planType": "Creative Cloud Pro",
        "accountType": "تفعيل رسمي على حسابك الشخصي",
        "duration": "1 شهر",
        "price": 850,
        "activation": "تفعيل رسمي على حسابك الشخصي.",
        "account": "حساب العميل الشخصي",
        "warranty": "الضمان يُؤكد قبل الدفع"
      }
    ]
  },
  {
    "id": "duolingo",
    "name": "Super Duolingo",
    "category": "التعليم",
    "logo": "duolingo",
    "logoUrl": "logos/duolingo.svg",
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
    "name": "ELSA Speak Pro",
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
    "name": "Coursera Plus",
    "category": "التعليم",
    "logo": "coursera",
    "logoUrl": "logos/coursera.svg",
    "status": "available",
    "description": "خيارات Coursera بمدد وأنواع حساب مختلفة.",
    "plans": [
      {
        "name": "3 شهور — حساب خاص",
        "duration": "3 شهور",
        "price": 300,
        "activation": "تسليم حساب خاص.",
        "account": "حساب خاص",
        "warranty": "ضمان كامل",
        "oldPrice": 9100
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
        "warranty": "ضمان كامل",
        "oldPrice": 20520
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
        "warranty": "ضمان كامل",
        "oldPrice": 560
      },
      {
        "name": "سنة",
        "duration": "12 شهر",
        "price": 1050,
        "activation": "تسليم حساب جاهز",
        "account": "إيميل وكلمة مرور",
        "warranty": "ضمان كامل",
        "oldPrice": 4440
      }
    ]
  },
  {
    "id": "turnitin",
    "name": "Turnitin",
    "category": "التعليم",
    "logo": "turnitin",
    "logoUrl": "logos/turnitin.svg",
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
        "warranty": "ضمان كامل",
        "oldPrice": 2400
      }
    ]
  },
  {
    "id": "notion",
    "name": "Notion Plus / Business",
    "category": "الإنتاجية",
    "logo": "notion",
    "logoUrl": "logos/notion.svg",
    "status": "available",
    "description": "خطط Notion Plus وBusiness بمدد مختلفة.",
    "plans": [
      {
        "name": "Plus — 3 شهور",
        "duration": "3 شهور",
        "price": 400,
        "activation": "تفعيل على البريد الشخصي أو حساب جاهز؛ قد يحتاج OTP.",
        "account": "شخصي أو جاهز",
        "warranty": "ضمان كامل",
        "oldPrice": 1540
      },
      {
        "name": "Business — 6 شهور",
        "duration": "6 شهور",
        "price": 600,
        "activation": "حساب شخصي أو جاهز؛ قد يتطلب OTP",
        "account": "شخصي أو جاهز",
        "warranty": "ضمان كامل",
        "oldPrice": 6170
      },
      {
        "name": "Business — 12 شهر",
        "duration": "12 شهر",
        "price": 950,
        "activation": "حساب شخصي أو جاهز؛ قد يتطلب OTP",
        "account": "شخصي أو جاهز",
        "warranty": "ضمان كامل",
        "oldPrice": 12340
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
        ],
        "oldPrice": 6170
      }
    ]
  },
  {
    "id": "zoom",
    "name": "Zoom Pro",
    "category": "الإنتاجية",
    "logo": "zoom",
    "logoUrl": "logos/zoom.svg",
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
        ],
        "oldPrice": 870
      },
      {
        "name": "Zoom Pro — 3 شهور",
        "duration": "3 شهور",
        "price": 550,
        "activation": "تسليم حساب جاهز",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل",
        "oldPrice": 2620
      },
      {
        "name": "Zoom Pro — سنة",
        "duration": "12 شهر",
        "price": 1800,
        "activation": "تسليم حساب جاهز",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل",
        "oldPrice": 8740
      },
      {
        "name": "Zoom Pro — شهر على بريدك",
        "duration": "1 شهر",
        "price": 300,
        "activation": "تفعيل على بريد العميل.",
        "account": "حساب العميل",
        "warranty": "ضمان كامل",
        "oldPrice": 870
      }
    ]
  },
  {
    "id": "stealth-writer",
    "name": "Stealth Writer",
    "category": "الإنتاجية",
    "logo": "stealthwriter",
    "logoUrl": "logos/stealthwriter.svg",
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
    ]
  },
  {
    "id": "icloud",
    "name": "iCloud 4TB",
    "category": "الإنتاجية",
    "logo": "icloud",
    "logoUrl": "logos/icloud.svg",
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
    "logoUrl": "logos/surfshark.svg",
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
    "logoUrl": "logos/nordvpn.svg",
    "status": "available",
    "description": "اشتراك NordVPN لمدة 3 شهور.",
    "plans": [
      {
        "name": "3 شهور",
        "duration": "3 شهور",
        "price": 300,
        "activation": "تسليم حساب جاهز — لا يحتاج بطاقة",
        "account": "إيميل وكلمة مرور",
        "warranty": "ضمان كامل",
        "oldPrice": 1950
      }
    ]
  },
  {
    "id": "proton-vpn",
    "name": "Proton VPN",
    "category": "VPN والحماية",
    "logo": "protonvpn",
    "logoUrl": "logos/protonvpn.svg",
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
    ],
    "logoUrl": "logos/hma.svg"
  },
  {
    "id": "expressvpn",
    "name": "ExpressVPN Basic",
    "category": "VPN والحماية",
    "logo": "expressvpn",
    "logoUrl": "logos/expressvpn.svg",
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
    "logoUrl": "logos/spotify.svg",
    "status": "available",
    "description": "تفعيل Spotify Premium على حساب العميل الشخصي.",
    "plans": [
      {
        "name": "3 شهور",
        "duration": "3 شهور",
        "price": 100,
        "activation": "رابط تفعيل على حساب العميل.",
        "account": "حساب شخصي",
        "warranty": "ضمان كامل",
        "oldPrice": 237
      }
    ]
  },
  {
    "id": "youtube",
    "name": "YouTube Premium",
    "category": "الترفيه",
    "logo": "youtube",
    "logoUrl": "logos/youtube.svg",
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
    "status": "available",
    "description": "باقة Kling AI برصيد 1,100 كريدت بسعر 700 جنيه، بضمان 5 أيام.",
    "plans": [
      {
        "name": "Kling AI — 1,100 Credits",
        "duration": "حسب الرصيد",
        "price": 700,
        "credits": "1,100 كريدت",
        "activation": "طريقة التفعيل تُؤكد قبل الدفع.",
        "account": "نوع الحساب يُؤكد قبل الدفع",
        "warranty": "5 أيام"
      }
    ]
  },
  {
    "id": "grammarly",
    "name": "Grammarly Premium",
    "category": "الإنتاجية",
    "logo": "grammarly",
    "logoUrl": "logos/grammarly.svg",
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
    "status": "available",
    "description": "باقات QuillBot Premium لمدة شهر، 3 شهور، 6 شهور أو سنة. الباقة السنوية بـ1200 جنيه، بمتوسط 100 جنيه للشهر.",
    "plans": [
      {
        "name": "QuillBot Premium",
        "duration": "1 شهر",
        "price": 250,
        "activation": "طريقة التفعيل تُؤكد قبل الدفع.",
        "account": "نوع الحساب يُؤكد قبل الدفع",
        "warranty": "الضمان يُؤكد قبل الدفع"
      },
      {
        "name": "QuillBot Premium",
        "duration": "3 شهور",
        "price": 500,
        "activation": "طريقة التفعيل تُؤكد قبل الدفع.",
        "account": "نوع الحساب يُؤكد قبل الدفع",
        "warranty": "الضمان يُؤكد قبل الدفع",
        "oldPrice": 3000
      },
      {
        "name": "QuillBot Premium",
        "duration": "6 شهور",
        "price": 800,
        "activation": "طريقة التفعيل تُؤكد قبل الدفع.",
        "account": "نوع الحساب يُؤكد قبل الدفع",
        "warranty": "الضمان يُؤكد قبل الدفع"
      },
      {
        "name": "QuillBot Premium",
        "duration": "12 شهر",
        "price": 1200,
        "activation": "طريقة التفعيل تُؤكد قبل الدفع.",
        "account": "نوع الحساب يُؤكد قبل الدفع",
        "warranty": "الضمان يُؤكد قبل الدفع"
      }
    ]
  },
  {
    "id": "envato",
    "name": "Envato Elements",
    "category": "التصميم",
    "logo": "envato",
    "logoUrl": "logos/envato.svg",
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
    "plans": []
  },
  {
    "id": "suno",
    "name": "Suno AI Pro",
    "category": "AI Tools",
    "logo": "suno",
    "logoUrl": "logos/suno.svg",
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
    "logoUrl": "logos/discord.svg",
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
    "id": "manus-pro",
    "name": "Manus Pro",
    "category": "AI Tools",
    "logo": "manus",
    "status": "available",
    "description": "اشتراك Manus Pro لمدة 12 شهر، يُفعّل على حسابك الشخصي عبر كود تفعيل.",
    "plans": [
      {
        "name": "Manus Pro",
        "duration": "12 شهر",
        "price": 6000,
        "activation": "تفعيل على حسابك الشخصي عبر كود تفعيل.",
        "account": "حساب العميل الشخصي",
        "warranty": "يُؤكد قبل الدفع",
        "officialPrice": {
          "amount": 204,
          "currency": "USD",
          "months": 12,
          "source": "https://manus.im/blog/best-ai-app-builders",
          "checkedAt": "2026-10-03",
          "basis": "entry-reference",
          "monthlyEquivalent": 17,
          "referenceCredits": 4000
        },
        "credits": "رصيد كود التفعيل يُؤكد قبل الدفع",
        "notes": [
          "مرجع المقارنة هو خطة Manus Pro الأساسية: 4,000 Credit شهريًا، بسعر معلن 17 دولارًا شهريًا عند الدفع السنوي؛ الإجمالي المحسوب 204 دولارات.",
          "اسم Pro يشمل مستويات رصيد مختلفة؛ رصيد كود المتجر يُؤكد قبل الدفع."
        ]
      }
    ],
    "features": [
      "البحث المتقدم وجمع المعلومات",
      "إنشاء مواقع وعروض تقديمية",
      "تنفيذ مهام متعددة الخطوات"
    ],
    "featuresEn": [
      "Advanced research and information gathering",
      "Website and presentation creation",
      "Multi-step task execution"
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
    "name": "Magic Patterns Starter",
    "category": "AI Tools",
    "logo": "magicpatterns",
    "logoUrl": "logos/magicpatterns.svg",
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
    ]
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
    "logoUrl": "logos/framer.svg",
    "status": "available",
    "description": "تصميم ونشر المواقع التفاعلية بسرعة ومن دون تعقيد.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 600,
        "activation": "دعوة أو حساب.",
        "account": "حسب المتوفر",
        "warranty": "ضمان كامل",
        "oldPrice": 18720
      }
    ]
  },
  {
    "id": "supabase-pro",
    "name": "Supabase Pro",
    "category": "AI Tools",
    "logo": "supabase",
    "logoUrl": "logos/supabase.svg",
    "status": "available",
    "description": "قواعد بيانات ومصادقة وبنية خلفية للمشاريع الرقمية.",
    "plans": [
      {
        "name": "Pro",
        "duration": "12 شهر",
        "price": 1550,
        "activation": "حساب أو Organization.",
        "account": "احتفظ بالبيانات الأصلية",
        "warranty": "ضمان كامل",
        "oldPrice": 15600
      }
    ]
  },
  {
    "id": "railway-hobby",
    "name": "Railway Hobby",
    "category": "الإنتاجية",
    "logo": "railway",
    "logoUrl": "logos/railway.svg",
    "status": "available",
    "description": "خطة Hobby لتشغيل ونشر المشاريع والتطبيقات.",
    "plans": [
      {
        "name": "Hobby",
        "duration": "12 شهر",
        "price": 650,
        "activation": "تسليم حساب جاهز.",
        "account": "بيانات دخول الحساب",
        "warranty": "ضمان كامل",
        "oldPrice": 3120
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
    ]
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
    ]
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
        "warranty": "ضمان كامل",
        "oldPrice": 7490
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
    ],
    "logoUrl": "logos/mobbin.svg"
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
    "logoUrl": "logos/granola.svg"
  },
  {
    "id": "jam-team",
    "name": "Jam Team",
    "category": "الإنتاجية",
    "logo": "jam",
    "logoUrl": "logos/jam.svg",
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
    ]
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
        "warranty": "ضمان كامل",
        "oldPrice": 6230
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
        "warranty": "ضمان كامل",
        "oldPrice": 6760
      }
    ]
  },
  {
    "id": "linear-business",
    "name": "Linear Business",
    "category": "الإنتاجية",
    "logo": "linear",
    "logoUrl": "logos/linear.svg",
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
    "logoUrl": "logos/posthog.svg",
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
    ],
    "logoUrl": "logos/customerio.svg"
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
