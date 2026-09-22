(function(){
  'use strict';

  var catalog = typeof products !== 'undefined' && Array.isArray(products) ? products : [];
  var SUPPORT_URL = 'https://wa.me/201500950624';
  var API_ENDPOINT = (window.MASTER_AI_ENDPOINT || '/api/ai').trim();

  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/[أإآ]/g,'ا')
      .replace(/ة/g,'ه')
      .replace(/ى/g,'ي')
      .replace(/[ًٌٍَُِّْـ]/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];
    });
  }

  function numberFromText(s){
    var m = String(s || '').replace(/,/g,'').match(/(\d{2,5})\s*(?:ج|جنيه|egp)?/i);
    return m ? Number(m[1]) : null;
  }

  function priceNumber(p){
    var m = String(p.price || '').replace(/,/g,'').match(/\d+/);
    return m ? Number(m[0]) : null;
  }

  function available(p){
    return norm(p.status).indexOf('متاح') !== -1 && norm(p.status).indexOf('غير متاح') === -1;
  }

  function productTokens(p){
    return norm([p.name,p.category,p.description,p.duration,p.price].join(' ')).split(' ').filter(function(x){return x.length > 2;});
  }

  function findProduct(q){
    var nq = norm(q);
    var direct = catalog.find(function(p){ return nq.indexOf(norm(p.name)) !== -1; });
    if(direct) return direct;

    var best = null, score = 0;
    catalog.forEach(function(p){
      var s = 0;
      productTokens(p).forEach(function(t){
        if(nq.indexOf(t) !== -1) s++;
      });
      if(s > score){ score = s; best = p; }
    });
    return score >= 2 ? best : null;
  }

  function productAnswer(p, detailed){
    var lines = [];
    lines.push('**' + p.name + '**');
    lines.push('السعر: ' + (p.price || 'غير محدد'));
    lines.push('المدة: ' + (p.duration || 'غير محددة'));
    lines.push('الحالة: ' + (p.status || 'غير محددة'));
    if(p.activation) lines.push('التفعيل/التسليم: ' + p.activation);
    if(p.account) lines.push('نوع الحساب: ' + p.account);
    if(p.warranty) lines.push('الضمان: ' + p.warranty);

    if(Array.isArray(p.plans) && p.plans.length){
      lines.push('');
      lines.push('الخطط المتاحة:');
      p.plans.slice(0,8).forEach(function(x){
        lines.push('• ' + (x.name || x.duration || 'خطة') + ' — ' + (x.price || p.price || 'السعر غير محدد'));
      });
    }

    if(detailed){
      if(p.description) lines.push('', p.description);
      if(p.deep && Array.isArray(p.deep.features) && p.deep.features.length){
        lines.push('', 'أهم المزايا:');
        p.deep.features.slice(0,5).forEach(function(x){ lines.push('• ' + x); });
      }
      if(p.deep && Array.isArray(p.deep.notes) && p.deep.notes.length){
        lines.push('', 'ملاحظات مهمة:');
        p.deep.notes.slice(0,5).forEach(function(x){ lines.push('• ' + x); });
      }
    }

    if(!available(p)) lines.push('', 'الخدمة غير متاحة للطلب حاليًا. أقدر أقترح بديل متاح.');
    return lines.join('\n');
  }

  function recommendByNeed(q){
    var nq = norm(q);
    var names = [];

    if(/فيديو|مونتاج|ريلز|reels|shorts|افاتر|avatar/.test(nq)){
      names = ['HeyGen AI','CapCut Pro','Runway Pro'];
    } else if(/صور|تصميم|جرافيك|logo|لوجو|واجهات|ui|ux/.test(nq)){
      names = ['Canva Pro','Figma Pro','Magic Patterns','Freepik'];
    } else if(/كتابه|كتابة|بحث|مساعد|شات|chat|تلخيص|ملفات/.test(nq)){
      names = ['ChatGPT Plus','Claude Pro','Perplexity Pro'];
    } else if(/برمجه|برمجة|كود|developer|مطور|backend|استضافه|استضافة/.test(nq)){
      names = ['ChatGPT Plus','Claude Pro','Factory Pro','Supabase Pro','Railway Hobby'];
    } else if(/تعلم|تعليم|لغه|لغة|انجليزي|english|كورسات|دورات/.test(nq)){
      names = ['Duolingo Super','ELSA Speak','Coursera Plus','Wordwall Pro'];
    } else if(/vpn|حمايه|حماية|خصوصيه|خصوصية/.test(nq)){
      names = ['NordVPN','Proton VPN','Surfshark','ExpressVPN'];
    } else if(/موسيقي|موسيقى|يوتيوب|youtube|spotify/.test(nq)){
      names = ['Spotify Premium','YouTube Premium'];
    } else if(/انتاجيه|إنتاجية|اوفيس|office|اجتماعات|zoom|notion/.test(nq)){
      names = ['Microsoft 365','Notion Plus / Business','Zoom Pro'];
    }

    var budget = numberFromText(q);
    var picks = names.map(function(n){ return catalog.find(function(p){return p.name === n;}); }).filter(Boolean);
    picks = picks.filter(available);

    if(budget){
      var within = picks.filter(function(p){var x=priceNumber(p); return x !== null && x <= budget;});
      if(within.length) picks = within;
    }

    if(!picks.length) return null;

    var out = ['حسب استخدامك، الخيارات المتاحة عندنا:'];
    picks.slice(0,4).forEach(function(p){
      out.push('• **' + p.name + '** — ' + p.price + ' — ' + p.duration);
    });
    out.push('', 'لو تقولي استخدامك بالتحديد وميزانيتك، أضيّق لك الاختيار أكتر.');
    return out.join('\n');
  }

  function listAvailable(q){
    var nq = norm(q);
    var category = null;
    ['AI Tools','التصميم','التعليم','الإنتاجية','VPN والحماية','الترفيه'].forEach(function(c){
      if(nq.indexOf(norm(c)) !== -1) category = c;
    });
    var list = catalog.filter(function(p){return available(p) && (!category || p.category === category);});
    if(!list.length) return 'مفيش منتجات متاحة مطابقة للطلب ده حاليًا.';
    return 'المتاح حاليًا' + (category ? ' في ' + category : '') + ':\n' +
      list.slice(0,12).map(function(p){return '• **' + p.name + '** — ' + p.price;}).join('\n') +
      (list.length > 12 ? '\n\nفيه منتجات أكتر؛ اكتب اسم القسم أو استخدامك.' : '');
  }

  function localReply(q){
    var nq = norm(q);

    if(!nq) return 'اكتب سؤالك وأنا أساعدك في منتجات وخدمات MASTER STORE.';

    if(/^(اهلا|اهلاً|السلام|سلام|هاي|hello|hi|مرحبا)/.test(nq)){
      return 'أهلاً بيك في **MASTER STORE** 👋\nأقدر أساعدك تختار منتج، تعرف السعر والمدة، التفعيل، الضمان، أو حالة التوفر.';
    }

    if(/شكرا|تسلم|تمام|ماشي|حبيبي/.test(nq) && nq.length < 25){
      return 'تحت أمرك 🤝 لو محتاج أي تفاصيل عن منتجات MASTER STORE اسألني.';
    }

    if(/طريقه الدفع|طريقة الدفع|الدفع|ادفع|تحويل/.test(nq)){
      return 'طرق الدفع الظاهرة حاليًا في المتجر: **WE Pay** و **Binance Pay**. اختار المنتج والباقة الأول، وبعدها تظهر لك بيانات الدفع الخاصة بالطلب.';
    }

    if(/الضمان|ضمان/.test(nq) && !findProduct(q)){
      return 'الضمان بيختلف حسب المنتج والباقة. اكتب اسم المنتج وأنا أقولك مدة وشروط الضمان المسجلة عندنا.';
    }

    if(/متاح|المخزون|متوفر|المنتجات/.test(nq) && !findProduct(q)){
      return listAvailable(q);
    }

    var p = findProduct(q);
    if(p){
      var detailed = /تفاصيل|مميزات|مزايا|شروط|كل حاجه|كل حاجة|اشرح/.test(nq);
      return productAnswer(p, detailed);
    }

    var rec = recommendByNeed(q);
    if(rec) return rec;

    var storeScope = /master|متجر|اشتراك|اشتراكات|سعر|اسعار|أسعار|مده|مدة|تفعيل|حساب|كود|otp|بطاقه|بطاقة|ضمان|طلب|باقة|باقه|رصيد|credits|credit|خدمه|خدمة|منتج/.test(nq);
    if(storeScope){
      return 'المعلومة دي مش واضحة عندي من قاعدة المتجر الحالية. اكتب اسم المنتج أو تفاصيل احتياجك، ولو محتاج دعم بشري استخدم واتساب.';
    }

    return 'أنا **MASTER AI** ومخصص لمساعدة عملاء MASTER STORE فقط. أقدر أساعدك في المنتجات، الأسعار، الباقات، التفعيل، الضمان، المخزون وطريقة الطلب.';
  }

  async function remoteReply(q){
    if(!API_ENDPOINT) return null;
    try{
      var controller = new AbortController();
      var timer = setTimeout(function(){controller.abort();},12000);
      var p = findProduct(q);
      var context = p ? {
        name:p.name, category:p.category, duration:p.duration, price:p.price,
        activation:p.activation, account:p.account, warranty:p.warranty,
        status:p.status, description:p.description, plans:p.plans || []
      } : null;
      var res = await fetch(API_ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:q, productContext:context}),
        signal:controller.signal
      });
      clearTimeout(timer);
      if(!res.ok) return null;
      var data = await res.json();
      return data.answer || data.output || data.message || null;
    }catch(e){
      return null;
    }
  }

  function md(text){
    var safe = escapeHtml(text);
    safe = safe.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    safe = safe.replace(/\n/g,'<br>');
    return safe;
  }

  var style = document.createElement('style');
  style.textContent =
    '.master-ai-launch{position:fixed;left:20px;bottom:20px;z-index:80;border:0;background:#1f5eff;color:#fff;border-radius:999px;padding:13px 18px;font-family:Cairo,Arial,sans-serif;font-weight:800;box-shadow:0 12px 32px rgba(31,94,255,.28);cursor:pointer;display:flex;align-items:center;gap:9px}' +
    '.master-ai-launch .dot{width:9px;height:9px;border-radius:50%;background:#f3b827}' +
    '.master-ai-panel{position:fixed;left:20px;bottom:78px;z-index:90;width:min(390px,calc(100vw - 28px));height:min(600px,calc(100vh - 110px));background:#fff;border:1px solid #e7eaf0;border-radius:20px;box-shadow:0 24px 70px rgba(7,20,48,.22);display:none;overflow:hidden;font-family:Cairo,Arial,sans-serif;direction:rtl}' +
    '.master-ai-panel.open{display:flex;flex-direction:column}' +
    '.master-ai-head{padding:15px 16px;background:#071430;color:#fff;display:flex;align-items:center;gap:11px}' +
    '.master-ai-avatar{width:38px;height:38px;border-radius:12px;background:#1f5eff;display:grid;place-items:center;font-weight:900}' +
    '.master-ai-head div:nth-child(2){flex:1}.master-ai-head b,.master-ai-head small{display:block}.master-ai-head small{color:#b9c5dc;font-size:10px;margin-top:2px}' +
    '.master-ai-close{border:0;background:rgba(255,255,255,.1);color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:20px}' +
    '.master-ai-messages{flex:1;overflow:auto;padding:15px;background:#f7f9fc;display:flex;flex-direction:column;gap:10px}' +
    '.master-ai-msg{max-width:88%;padding:10px 12px;border-radius:14px;font-size:12px;line-height:1.85;word-break:break-word}' +
    '.master-ai-msg.bot{align-self:flex-start;background:#fff;border:1px solid #e7eaf0;color:#253047}' +
    '.master-ai-msg.user{align-self:flex-end;background:#1f5eff;color:#fff}' +
    '.master-ai-quick{display:flex;gap:6px;overflow:auto;padding:9px 12px;border-top:1px solid #edf0f5;background:#fff}' +
    '.master-ai-quick button{border:1px solid #dfe5ef;background:#fff;color:#344054;border-radius:999px;padding:7px 10px;white-space:nowrap;font-family:inherit;font-size:10px;cursor:pointer}' +
    '.master-ai-form{display:grid;grid-template-columns:1fr auto;gap:8px;padding:11px;background:#fff;border-top:1px solid #edf0f5}' +
    '.master-ai-form input{border:1px solid #dfe5ef;border-radius:11px;padding:10px 11px;font-family:inherit;outline:none;min-width:0}' +
    '.master-ai-form input:focus{border-color:#1f5eff;box-shadow:0 0 0 3px rgba(31,94,255,.08)}' +
    '.master-ai-form button{border:0;border-radius:11px;background:#1f5eff;color:#fff;padding:0 15px;font-family:inherit;font-weight:800;cursor:pointer}' +
    '.master-ai-foot{font-size:9px;color:#7a8494;text-align:center;padding:0 10px 9px;background:#fff}' +
    '@media(max-width:560px){.master-ai-launch{left:12px;bottom:12px}.master-ai-panel{left:7px;right:7px;bottom:68px;width:auto;height:min(640px,calc(100vh - 82px));border-radius:17px}}';
  document.head.appendChild(style);

  var launch = document.createElement('button');
  launch.className = 'master-ai-launch';
  launch.type = 'button';
  launch.setAttribute('aria-label','فتح مساعد MASTER STORE');
  launch.innerHTML = '<span class="dot"></span><span>اسأل MASTER AI</span>';

  var panel = document.createElement('section');
  panel.className = 'master-ai-panel';
  panel.setAttribute('aria-label','MASTER AI Assistant');
  panel.innerHTML =
    '<div class="master-ai-head"><div class="master-ai-avatar">M</div><div><b>MASTER AI</b><small>مساعد منتجات MASTER STORE</small></div><button class="master-ai-close" type="button" aria-label="إغلاق">×</button></div>' +
    '<div class="master-ai-messages" aria-live="polite"></div>' +
    '<div class="master-ai-quick"><button type="button">عايز أداة AI للكتابة</button><button type="button">أفضل أداة للفيديو</button><button type="button">إيه المتاح؟</button><button type="button">طرق الدفع</button></div>' +
    '<form class="master-ai-form"><input maxlength="400" autocomplete="off" placeholder="اسأل عن منتج، سعر، ضمان..." aria-label="اكتب سؤالك"><button type="submit">إرسال</button></form>' +
    '<div class="master-ai-foot">المساعد يجيب من بيانات المتجر فقط. للمشاكل الخاصة بالطلبات تواصل مع الدعم.</div>';

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  var messages = panel.querySelector('.master-ai-messages');
  var input = panel.querySelector('input');

  function add(text, who){
    var m = document.createElement('div');
    m.className = 'master-ai-msg ' + who;
    m.innerHTML = md(text);
    messages.appendChild(m);
    messages.scrollTop = messages.scrollHeight;
  }

  function openPanel(){
    panel.classList.add('open');
    launch.style.display = 'none';
    if(!messages.children.length){
      add('أهلاً بيك 👋 أنا **MASTER AI**.\nاسألني عن أي منتج في المتجر: السعر، المدة، التفعيل، الضمان، المخزون أو ترشيح حسب استخدامك.', 'bot');
    }
    setTimeout(function(){input.focus();},80);
  }

  async function ask(q){
    add(q,'user');
    input.value = '';
    input.disabled = true;

    var loading = document.createElement('div');
    loading.className = 'master-ai-msg bot';
    loading.textContent = 'ثانية واحدة...';
    messages.appendChild(loading);
    messages.scrollTop = messages.scrollHeight;

    var remote = await remoteReply(q);
    loading.remove();
    add(remote || localReply(q),'bot');
    input.disabled = false;
    input.focus();
  }

  launch.addEventListener('click',openPanel);
  panel.querySelector('.master-ai-close').addEventListener('click',function(){
    panel.classList.remove('open');
    launch.style.display = 'flex';
  });
  panel.querySelector('.master-ai-form').addEventListener('submit',function(e){
    e.preventDefault();
    var q = input.value.trim();
    if(q) ask(q);
  });
  panel.querySelectorAll('.master-ai-quick button').forEach(function(b){
    b.addEventListener('click',function(){ ask(b.textContent); });
  });
})();