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
    'جاري تحميل المنتج...':'Loading product...','تأكيد الطلب':'Confirm order'
  };
  const exactEnToAr=Object.fromEntries(Object.entries(exactArToEn).map(([a,e])=>[e,a]));

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

  function money(value){
    const market=currentMarket();
    return formatCurrency(convertEGP(value,market.code),market.currency);
  }

  // A plan may override automatic FX conversion with:
  // marketPrices:{AE:25,LY:30} and marketOldPrices:{AE:35}
  function planAmount(plan,key){
    if(!plan)return 0;
    const k=key||'price';
    const table=k==='oldPrice'?plan.marketOldPrices:plan.marketPrices;
    if(table&&table[state.market]!=null) return Number(table[state.market])||0;
    return convertEGP(plan[k]||0);
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

  function injectSwitcher(){
    if(document.getElementById('marketSwitcher'))return;
    const header=document.querySelector('.topbar');
    if(!header)return;
    const wrap=document.createElement('div');
    wrap.className='market-switcher';
    wrap.id='marketSwitcher';
    wrap.innerHTML='<select id="marketSelect"></select><select id="languageSelect"></select>';
    const account=header.querySelector('.account-link');
    header.insertBefore(wrap,account||header.querySelector('.menu')||null);
    wrap.querySelector('#marketSelect').addEventListener('change',e=>setMarket(e.target.value,true));
    wrap.querySelector('#languageSelect').addEventListener('change',e=>setLanguage(e.target.value));
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
    const observer=new MutationObserver(()=>{
      if(applying)return;
      requestAnimationFrame(apply);
    });
    observer.observe(document.body,{childList:true,subtree:true});
    loadRates();
    detectMarket();
  }

  window.MasterLocale={
    MARKETS,getState,currentMarket,money,convertEGP,formatCurrency,planAmount,planMoney,
    setMarket,setLanguage,t,apply
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();