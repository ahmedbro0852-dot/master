// Generate useful static HTML from the same catalogue and public prices as checkout.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),SEO=require('../seo-config.js'),origin=SEO.origin;
const WindowsGuide=require('../windows-guide.js');
const Social=require('../social-links.js');
const ProductGuides=require('../product-guides.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'catalog.js'),'utf8'),sandbox);
vm.runInNewContext(fs.readFileSync(path.join(root,'product-features.js'),'utf8'),sandbox);
const catalog=sandbox.window.MasterCatalog,products=catalog.products.filter(p=>!p.redirectTo),indexed=products.filter(SEO.indexable);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const dataScript=data=>'<script id="master-seo-data" type="application/ld+json">'+json(data)+'</script>';
const categoryProducts=c=>indexed.filter(p=>SEO.categoryFor(p,catalog.categoryGroups).some(x=>x.slug===c.slug));
const categories=SEO.categories.filter(c=>categoryProducts(c).length);
const categoryLinks=()=>categories.map(c=>'<a href="'+SEO.categoryUrl(c)+'">'+escape(c.name)+'</a>').join('');

const internationalPages=[{lang:'ar',slug:'international-subscriptions',title:'اشتراكات الذكاء الاصطناعي حول العالم | ماستر ستور',description:'قارن اشتراكات ChatGPT وCanva وCapCut وGemini. دليل الطلب من الأردن وأمريكا وفلسطين وسوريا، والعملات والتفعيل وشروط الضمان.'},{lang:'en',slug:'ai-subscriptions-international',title:'AI Subscriptions: ChatGPT, Canva & CapCut | MASTER STORE',description:'Compare AI and creative subscription plans, activation options, payment enquiries and warranty terms at MASTER STORE.'}];
const internationalUrl=p=>origin+'/categories/'+p.slug+'.html';
const internationalLinks=()=>internationalPages.map(p=>'<a lang="'+p.lang+'" href="'+internationalUrl(p)+'">'+(p.lang==='ar'?'الاشتراكات خارج مصر':'International AI subscriptions (English)')+'</a>').join('');
function writeInternational(){
 const selected=[
 ['chatgpt-plus','ChatGPT Plus','للعمل والكتابة وتحليل الملفات؛ راجع حدود الباقة ونوع الحساب.','For writing, work and file analysis; check plan limits and account type.'],
 ['canva-pro','Canva Pro','للتصميم والعروض والمحتوى المرئي؛ قارن نوع العضوية ومدة الوصول.','For design, presentations and visual content; compare membership types and access duration.'],
 ['capcut-pro','CapCut Pro','للمونتاج والفيديو؛ تأكد من توافق الجهاز وطريقة التفعيل.','For video editing; check device compatibility and activation method.'],
 ['gemini-pro','Google Gemini','للمهام البحثية والإنتاجية؛ راجع مزايا كل باقة وأهليتها.','For research and productivity; review plan features and eligibility.'],
 ['gamma-plus','Gamma','لإنشاء العروض والمستندات؛ راجع الرصيد والمدة.','For presentations and documents; review credits and duration.'],
 ['elevenlabs','ElevenLabs','للتعليق الصوتي وتحويل النص لصوت؛ قارن الرصيد والاستخدامات.','For voiceovers and text-to-speech; compare credits and use cases.']
 ].filter(item=>indexed.some(p=>p.id===item[0]));
 for(const page of internationalPages){
  const en=page.lang==='en',url=internationalUrl(page),other=internationalPages.find(p=>p.lang!==page.lang);
  const intro=en?'Browse digital subscription options from MASTER STORE. Before ordering, check the plan, account type, duration, activation method and warranty. Availability depends on your country and the service provider.':'لو بتبحث عن اشتراكات رقمية من خارج مصر، قارن الباقات حسب نوع الحساب والمدة وطريقة التفعيل والضمان. توفر كل خدمة يعتمد على بلدك وشروط مزود الخدمة.';
  const countries=en?'<h2>Ordering from abroad</h2><h3>Jordan</h3><p>Choose Jordan in the store currency selector to view JOD estimates. Confirm the final amount and payment method with support before paying.</p><h3>United States and other international markets</h3><p>Choose International (USD) and English in the store selector. Ask support to confirm the plan is available in your location and which payment methods apply.</p><h3>Palestine and Syria</h3><p>Contact support to check whether the specific service and payment method are available in your location. Do not assume every plan is supported; service-provider restrictions apply.</p>':'<h2>الطلب من خارج مصر</h2><h3>الأردن</h3><p>اختر الأردن من قائمة الدول في المتجر لعرض تقديرات الأسعار بالدينار الأردني. أكد المبلغ النهائي وطريقة الدفع مع الدعم قبل التحويل.</p><h3>الولايات المتحدة والأسواق الدولية</h3><p>اختر دولي (USD) من قائمة الدول، ويمكنك اختيار الإنجليزية من قائمة اللغة. استفسر من الدعم عن توفر الباقة وطريقة الدفع في بلدك.</p><h3>فلسطين وسوريا</h3><p>تواصل مع الدعم للتأكد من إمكانية توفير الخدمة وطريقة الدفع المناسبة لبلدك. لا تفترض إتاحة كل الباقات؛ تسري شروط وقيود مزود الخدمة.</p>';
  const checks=en?'<h2>Before you pay</h2><ol><li>Compare the available plans on the product page.</li><li>Check whether the plan uses your own account or a provided account, and review the warranty.</li><li>Confirm current availability, final price, payment and delivery terms with support.</li></ol>':'<h2>قبل الدفع</h2><ol><li>قارن الباقات المتاحة في صفحة المنتج.</li><li>راجع نوع الحساب والضمان، سواء كان التفعيل على حسابك أو حسابًا جاهزًا.</li><li>أكد التوفر والسعر النهائي والدفع والتسليم مع الدعم.</li></ol>';
  const cards=selected.map(([id,name,ar,eng])=>'<article class="seo-service-card"><h2><a href="'+SEO.productUrl({id})+'">'+escape(name)+'</a></h2><p>'+escape(en?eng:ar)+'</p><a class="seo-card-link" href="'+SEO.productUrl({id})+'">'+(en?'View plans (language selector available)':'عرض الباقات والتفعيل')+'</a></article>').join('');
  const alternate=internationalPages.map(p=>'<link rel="alternate" hreflang="'+p.lang+'" href="'+internationalUrl(p)+'">').join('');
  const html='<!doctype html><html lang="'+page.lang+'" dir="'+(en?'ltr':'rtl')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(page.title)+'</title><meta name="description" content="'+escape(page.description)+'"><meta name="robots" content="index,follow"><link rel="canonical" href="'+url+'">'+alternate+'<meta property="og:title" content="'+escape(page.title)+'"><meta property="og:description" content="'+escape(page.description)+'"><meta property="og:url" content="'+url+'"><meta property="og:type" content="website"><link rel="icon" href="/master-mark.svg"><link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/seo-pages.css"><style>main{max-width:1100px;margin:auto;padding:24px 16px}main>section:not(.seo-card-grid){margin:32px 0;line-height:1.85}.seo-landing main{text-align:start}</style></head><body class="seo-landing"><header><a href="/"><img src="/master-store-logo.svg" alt="MASTER STORE" width="170" height="55"></a><a href="'+internationalUrl(other)+'" lang="'+other.lang+'">'+(en?'العربية':'English')+'</a><a href="/#products">'+(en?'Browse store':'تصفح المتجر')+'</a></header><main><h1>'+escape(en?'AI subscriptions for international customers':'اشتراكات الذكاء الاصطناعي للعملاء حول العالم')+'</h1><p class="seo-intro">'+escape(intro)+'</p><section class="seo-card-grid">'+cards+'</section><section>'+countries+'</section><section>'+checks+'<p><a href="https://wa.me/201500950624" target="_blank" rel="noopener noreferrer">'+(en?'Contact support on WhatsApp':'تواصل مع الدعم عبر واتساب')+'</a></p></section></main><footer><a href="/warranty.html">'+(en?'Warranty and terms':'سياسة الضمان والشروط')+'</a> · MASTER STORE</footer></body></html>';
  fs.writeFileSync(path.join(root,'categories',page.slug+'.html'),html);
 }
}


const buyingGuides=[
 {slug:'compare-chatgpt-plus-go-gemini',title:'مقارنة اشتراكات ChatGPT Plus وGo وGemini',description:'قارن طرق التفعيل ومدد الباقات والضمان في ماستر ستور واختر الاشتراك المناسب لحسابك واستخدامك.',intro:'اختيار مساعد ذكاء اصطناعي لا يعتمد على السعر فقط. حدد هل تريد الاحتفاظ بحسابك الحالي، وما المدة التي تحتاجها، وهل تحتاج رصيدًا منفصلًا أو تقبل باقة عائلية. المقارنة التالية تخص عروض ماستر ستور، لا جميع الخطط الرسمية.',items:[
 ['chatgpt-plus','لمن يريد تفعيل Plus على حسابه الشخصي أو حسابًا خاصًا جاهزًا.','تأكد من اختيار نوع التفعيل الصحيح؛ مزايا النماذج وحدود الاستخدام تتبع الخطة.'],
 ['chatgpt-go','لمن يفضّل حسابًا جاهزًا ومدة أقصر أو أطول حسب الباقات المعروضة.','ضمان الاستبدال في باقة الثلاثة شهور ليس ضمانًا يغطي المدة كلها؛ راجع شرط 70 يومًا.'],
 ['gemini-pro','لمن يفضّل استخدام بريد Google الشخصي ضمن عرض الدعوة العائلية.','تحقق من أهلية البلد والعائلة؛ الرصيد المشترك يتأثر باستخدام المجموعة.'],
 ['google-ai-plus','لمن يريد خطة Google AI Plus على حسابه الشخصي.','لا تفترض أنها تشمل كل مزايا Pro أو Ultra؛ تحقق من الأهلية والرصيد قبل الدفع.']
 ],checks:['إذا كان الحفاظ على محادثاتك وإعداداتك مهمًا، راجع الباقات المخصصة لحسابك الحالي بدل الحساب الجاهز.','إذا كنت ستستخدم أدوات الفيديو أو الصور بكثرة، تحقق من الرصيد والحدود الخاصة بالأداة المطلوبة قبل الدفع.','إذا كنت خارج مصر، أكد أهلية بلدك وطريقة الدفع والعملة مع الدعم.']},
 {slug:'compare-canva-capcut',title:'Canva Pro أم CapCut Pro؟ اختيار اشتراك التصميم والمونتاج',description:'دليل اختيار Canva Pro للتصميم والعروض أو CapCut Pro للمونتاج، مع مقارنة طرق التفعيل والكريدت والضمان.',intro:'لو هدفك إنتاج محتوى للسوشيال ميديا، حدد نوع العمل أولًا: تصميم بوستر أو عرض تقديمي، أم تحرير فيديو وقص المشاهد؟ قد تحتاج الأداتين في مشروع واحد، لكن لا تحتاج بالضرورة شراء الاثنين.',items:[
 ['canva-pro','لإنشاء التصميمات والمنشورات والعروض المرئية.','تحقق من نوع العضوية والتفعيل على بريدك وما تشمل الباقة من خصائص قبل الشراء.'],
 ['capcut-pro','لتحرير الفيديو وترتيب المقاطع وإعداد محتوى مرئي متحرك.','قارن الباقات الجاهزة والتفعيل على بريدك، والرصيد المحدد؛ باقة الأسبوع لا تتضمن ضمان وجود كريدت.']
 ],checks:['لتصميم إعلان ثابت، ابدأ بأداة التصميم وقارن القوالب والتصدير المطلوب.','لمونتاج فيديو قصير، جرّب سير العمل المطلوب وتحقق من توفر الخصائص على جهازك.','إذا كنت تعتمد على خصائص تعمل بالكريدت، اختر الرصيد حسب احتياجك، لا حسب مدة الاشتراك فقط.']}
];
const buyingUrl=g=>origin+'/categories/'+g.slug+'.html';
const buyingLinks=()=>buyingGuides.map(g=>'<a href="'+buyingUrl(g)+'">'+escape(g.title)+'</a>').join('');
function writeBuyingGuides(){
 for(const g of buyingGuides){
 const url=buyingUrl(g),title=g.title+' | ماستر ستور';
 const cards=g.items.map(([id,use,check])=>{const p=indexed.find(x=>x.id===id);if(!p)return '';const plans=(p.plans||[]).filter(x=>!x.hidden&&x.available!==false);return '<article class="seo-service-card"><h2><a href="'+SEO.productUrl(p)+'">'+escape(p.name)+'</a></h2><p>'+escape(use)+'</p><h3>الباقات المدرجة</h3><ul>'+plans.map(x=>'<li>'+escape(x.name)+' · '+escape(x.duration||'راجع المدة')+' · '+escape(x.warranty||'راجع الضمان')+'</li>').join('')+'</ul><p>'+escape(check)+'</p><a class="seo-card-link" href="'+SEO.productUrl(p)+'">راجع السعر والتفعيل والتوفر الحالي ←</a></article>';}).join('');
 const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><meta name="description" content="'+escape(g.description)+'"><meta name="robots" content="index,follow"><link rel="canonical" href="'+url+'"><link rel="icon" href="/master-mark.svg"><link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/seo-pages.css"></head><body class="seo-landing"><header><a href="/"><img src="/master-store-logo.svg" alt="MASTER STORE" width="170" height="55"></a><a href="/#products">تصفح المتجر</a></header><main><h1>'+escape(g.title)+'</h1><p class="seo-intro">'+escape(g.intro)+'</p><section class="seo-card-grid">'+cards+'</section><section><h2>كيف تختار قبل الدفع؟</h2><ol>'+g.checks.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ol><p>تتغير الأسعار والتوفر والحدود حسب الباقة والمنطقة؛ راجع الصفحة الخاصة بالمنتج وشروط مزود الخدمة قبل الطلب.</p><p><a href="/common-problems.html">دليل حل مشاكل الاشتراكات</a> · <a href="/warranty.html">شروط الضمان</a> · <a href="/categories/international-subscriptions.html">الطلب من خارج مصر</a></p></section></main><footer>MASTER STORE · <a href="/">الصفحة الرئيسية</a></footer></body></html>';
 fs.writeFileSync(path.join(root,'categories',g.slug+'.html'),html);
 }
}

const directory='<section class="seo-directory" id="site-directory"><h2>تصفح أقسام ماستر ستور</h2><nav class="seo-category-links" aria-label="أقسام الاشتراكات">'+categoryLinks()+internationalLinks()+buyingLinks()+'</nav><details><summary>دليل الاشتراكات والخدمات</summary><nav class="seo-product-links" aria-label="كل صفحات الخدمات">'+indexed.map(p=>'<a href="'+SEO.productUrl(p)+'">'+escape(p.name)+'</a>').join('')+'</nav></details></section>';
async function loadPrices(){
 if(process.env.MASTER_SEO_OFFLINE==='1')return null;
 try{
  // Reuse public (not service-role) access already used by the storefront.
  const source=fs.readFileSync(path.join(root,'catalog-live.js'),'utf8');
  const url=new URL(source.match(/fetch\('([^']+)'/)[1]);url.searchParams.set('select','product_id,plan_index,price_piasters,available,admin_overridden,previous_price_piasters');
  const key=source.match(/apikey:'([^']+)'/)[1];
  const response=await fetch(url,{headers:{apikey:key},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('catalog prices');const rows=await response.json();
  if(!Array.isArray(rows)||!rows.length)throw Error('empty prices');return rows;
 }catch{console.warn('SEO: public price snapshot unavailable; generating service data without unverified prices.');return null;}
}
function breadcrumbs(p){const category=SEO.categoryFor(p,catalog.categoryGroups)[0];return '<nav class="seo-breadcrumbs" aria-label="مسار التصفح"><a href="/">ماستر ستور</a><span aria-hidden="true">/</span>'+(category?'<a href="'+SEO.categoryUrl(category)+'">'+escape(category.name)+'</a><span aria-hidden="true">/</span>':'')+'<span>'+escape(p.name)+'</span></nav>';}
function related(p){const category=SEO.categoryFor(p,catalog.categoryGroups)[0];const list=category?categoryProducts(category).filter(x=>x.id!==p.id).slice(0,6):[];return list.length?'<section class="seo-related"><h2>خدمات من نفس القسم</h2><ul>'+list.map(x=>'<li><a href="'+SEO.productUrl(x)+'">'+escape(x.name)+'</a></li>').join('')+'</ul></section>':'';}
function writeProducts(prices){
 const template=fs.readFileSync(path.join(root,'product.html'),'utf8'),out=path.join(root,'products');fs.mkdirSync(out,{recursive:true});
 for(const file of fs.readdirSync(out))if(file.endsWith('.html'))fs.unlinkSync(path.join(out,file));
 for(const p of products){
  if(!/^[a-z0-9-]+$/.test(p.id))throw Error('Invalid product id');
  const url=SEO.productUrl(p),title=SEO.productTitle(p),description=SEO.productDescription(p),offers=SEO.offers(p,prices);
  const features=sandbox.window.MasterProductFeatures;
  let content='<section class="product-hero"><h1 dir="auto">'+escape(p.name)+'</h1><p>'+escape(p.description||p.name)+'</p></section><section class="plans-block"><h2>الباقات والتفعيل والضمان</h2>'+(p.plans||[]).map((plan,i)=>{
   if(plan.hidden)return '';
   const offer=offers.find(x=>x.url.endsWith('?plan='+i));
   const details=features.list(p,plan,false,x=>String(x||''));
   const historyRow=prices?.find(x=>x.product_id===p.id&&Number(x.plan_index)===i),former=Number(historyRow&&Object.prototype.hasOwnProperty.call(historyRow,'previous_price_piasters')?historyRow.previous_price_piasters:Number(plan.previousStorePrice||(!plan.officialPrice?plan.oldPrice:0))*100);
   const before=offer&&former>Number(offer.price)*100?'<span class="plan-previous-price"><small>السعر السابق</small><del>'+escape((former/100).toLocaleString('en-US'))+' ج</del></span>':'';
   return '<article class="account-panel"><h3>'+escape(plan.name)+'</h3>'+(offer?'<p><strong>السعر: '+escape(offer.price)+' جنيه مصري</strong> · '+(offer.availability.endsWith('/InStock')?'متاح للطلب':'غير متاح حاليًا')+'</p>':'')+before+'<p>المدة: '+escape(plan.duration||'راجع تفاصيل الباقة')+'</p><p>'+escape(plan.activation)+'</p><p>الضمان: '+escape(plan.warranty||'يُؤكد مع الدعم')+'</p>'+(details.length?'<ul>'+details.map(f=>'<li>'+escape(f)+'</li>').join('')+'</ul>':'')+(plan.notes?.length?'<ul>'+plan.notes.map(n=>'<li>'+escape(n)+'</li>').join('')+'</ul>':'')+'</article>';
  }).join('')+'<p>راجع السعر والتوفر الحاليين عند الطلب؛ يتم تأكيد الدفع والتسليم وفق تفاصيل الباقة.</p><a href="/product.html?id='+encodeURIComponent(p.id)+'">اختيار الباقة والطلب</a></section>';
  const relevantGuides=buyingGuides.filter(g=>g.items.some(item=>item[0]===p.id));if(relevantGuides.length)content+='<section class="seo-related"><h2>دليل اختيار الاشتراك</h2><ul>'+relevantGuides.map(g=>'<li><a href="'+buyingUrl(g)+'">'+escape(g.title)+'</a></li>').join('')+'</ul></section>';
  content+=ProductGuides.render(p.id,false,undefined,{product:p,catalog:catalog.products,priceRows:prices,featuresFor:plan=>sandbox.window.MasterProductFeatures.list(p,plan,false,x=>String(x||''))});
  if(WindowsGuide.match(p)){
   content=content.replace('</section><section class="plans-block">','</section>'+WindowsGuide.nav(false)+'<section class="plans-block" id="windows-plans">')+'<div id="windows-guide-root">'+WindowsGuide.render(false,p)+'</div>';
  }
  let html=template.replace('<head>','<head>\n  <base href="/">\n  <link rel="canonical" href="'+url+'">')
   .replace(/<title>[^<]*<\/title>/,'<title>'+escape(title)+'</title>')
   .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*(")/g,(_,a,b)=>a+escape(description)+b)
   .replace(/(<meta property="og:title" content=")[^"]*(")/,(_,a,b)=>a+escape(title)+b)
   .replace(/(<meta name="robots" content=")[^"]*(")/,(_,a,b)=>a+(SEO.indexable(p)?'index,follow':'noindex,follow')+b)
   .replace('<body>','<body data-product-id="'+p.id+'">')
   .replace(/(<main id="productPage"[^>]*>)[\s\S]*?<\/main>/,(_,open)=>breadcrumbs(p)+open+content+'</main>'+related(p))
   .replace('</head>','<meta property="og:url" content="'+url+'">\n<meta property="og:image" content="'+escape(SEO.image(p))+'">\n<meta property="og:locale" content="ar_EG">\n'+dataScript(SEO.productGraph(p,catalog.categoryGroups,prices))+'\n</head>');
  fs.writeFileSync(path.join(out,p.id+'.html'),html);
 }
}
function writeCategories(){
 const out=path.join(root,'categories');fs.mkdirSync(out,{recursive:true});
 for(const f of fs.readdirSync(out))if(f.endsWith('.html'))fs.unlinkSync(path.join(out,f));
 for(const c of categories){
  const list=categoryProducts(c),url=SEO.categoryUrl(c),title=c.title+' | ماستر ستور';
  const graph={'@context':'https://schema.org','@graph':[
   {'@type':'CollectionPage','@id':url+'#page',url,name:title,description:c.description,inLanguage:'ar',mainEntity:{'@type':'ItemList',numberOfItems:list.length,itemListElement:list.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:SEO.productUrl(p)}))}},
   {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'ماستر ستور',item:origin+'/'},{'@type':'ListItem',position:2,name:c.name,item:url}]}
  ]};
  let html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><meta name="description" content="'+escape(c.description)+'"><meta name="robots" content="index,follow"><link rel="canonical" href="'+url+'"><meta property="og:type" content="website"><meta property="og:title" content="'+escape(title)+'"><meta property="og:description" content="'+escape(c.description)+'"><meta property="og:url" content="'+url+'"><meta property="og:image" content="'+origin+'/master-store-logo.png"><meta property="og:site_name" content="MASTER STORE"><meta name="twitter:card" content="summary"><link rel="icon" href="/master-mark.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/theme.css?v=20261025-contrast1"><script src="/theme.js?v=20261021-dark1"></script><link rel="stylesheet" href="/seo-pages.css?v=20261023-seo3">'+dataScript(graph)+'<link rel="stylesheet" href="/store-assistant.css?v=20261026-actions1"></head><body class="seo-landing"><header><a href="/"><img src="/master-store-logo.svg" alt="ماستر ستور MASTER STORE" width="170" height="55"></a><a href="/warranty.html">سياسة الضمان</a><a href="/#products">كل الاشتراكات والباقات ←</a></header><nav class="seo-breadcrumbs" aria-label="مسار التصفح"><a href="/">ماستر ستور</a><span>/</span><span>'+escape(c.name)+'</span></nav><main><h1>'+escape(c.title)+'</h1><p class="seo-intro">'+escape(c.description)+'</p><p class="seo-intro">'+list.length+' خدمة · افتح صفحة الخدمة لمراجعة الباقات والأسعار والتوفر الحالي.</p><section class="seo-card-grid">'+list.map(p=>'<article class="seo-service-card" data-product-id="'+escape(p.id)+'"><h2><a href="'+SEO.productUrl(p)+'">'+escape(p.name)+'</a></h2><p>'+escape(SEO.productDescription(p))+'</p><a class="seo-card-link" href="'+SEO.productUrl(p)+'">تفاصيل الباقات والتفعيل ←</a></article>').join('')+'</section></main><section class="seo-directory"><h2>أقسام أخرى</h2><nav class="seo-category-links">'+categoryLinks()+'</nav></section><footer><a href="/warranty.html">سياسة الضمان والاستبدال</a> · <a href="/track.html">متابعة الطلب</a> · MASTER STORE</footer><script src="/locale.js?v=20261102-vercel-pro1"></script><script src="/cart.js?v=20261101-order-inbox1"></script><script src="/store-assistant.js?v=20261027-welcome1" defer></script></body></html>';
  html=html.replace('</head>','<link rel="stylesheet" href="/site-updates.css?v=20261110-mobile-comfort1"></head>').replace('</body>','<script src="/social-links.js?v=20261025-review1"></script><script src="/site-updates.js?v=20261110-mobile-comfort1" defer></script></body>').replace(' · MASTER STORE</footer>',' · MASTER STORE <a class="footer-facebook" href="'+Social.facebook+'" target="_blank" rel="noopener noreferrer">تابعنا على فيسبوك</a> <a class="footer-whatsapp-channel" href="'+Social.whatsappChannel+'" target="_blank" rel="noopener noreferrer">قناة عروض واتساب</a></footer>');
  fs.writeFileSync(path.join(out,c.slug+'.html'),html);
 }
}
function writeHome(){
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 html=html.replace(/<title>[^<]*<\/title>/,'<title>ماستر ستور | اشتراكات الذكاء الاصطناعي والبرامج وتفعيل ويندوز</title>');
 const description='قارن باقات ChatGPT وGemini وأدوات الصور والفيديو والتعليم والإنتاجية وتفعيل ويندوز في ماستر ستور. تفاصيل واضحة للتفعيل والمدة والضمان ودعم قبل الطلب.';
 html=html.replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*(")/g,(_,a,b)=>a+description+b);
 html=html.replace(/(<meta property="og:title" content=")[^"]*(")/,(_,a,b)=>a+'ماستر ستور | اشتراكات وخدمات رقمية'+b);
 html=html.replace(/\n*<script id="master-seo-data" type="application\/ld\+json">[\s\S]*?<\/script>\n*/,'\n');
 html=html.replace('</head>',dataScript(SEO.homeGraph)+'\n</head>');

 const priorityIds=['chatgpt-plus','chatgpt-go','capcut-pro','gamma-plus','perplexity-pro','adobe-cc','adobe-express','coursera-plus-trial-7d'];
 const priorityLinks=priorityIds.map(id=>indexed.find(p=>p.id===id)).filter(Boolean).map(p=>'<a href="'+SEO.productUrl(p)+'" lang="en">'+escape(p.name)+'</a>').join('');
 const priorityBlock='<!-- SEO-PRIORITY-START --><nav class="seo-category-links" aria-label="روابط سريعة للاشتراكات ودليل المساعدة" style="margin:12px 0 18px;gap:10px 18px;font-size:14px">'+priorityLinks+'<a href="/common-problems.html">دليل حل المشكلات</a>'+internationalLinks()+'</nav><!-- SEO-PRIORITY-END -->';
 if(html.includes('<!-- SEO-PRIORITY-START -->'))html=html.replace(/<!-- SEO-PRIORITY-START -->[\s\S]*?<!-- SEO-PRIORITY-END -->/,priorityBlock);else html=html.replace('<section id="recentServices"',priorityBlock+'\n      <section id="recentServices"');
 const block='<!-- SEO-DIRECTORY-START -->'+directory+'<!-- SEO-DIRECTORY-END -->';
 if(html.includes('<!-- SEO-DIRECTORY-START -->'))html=html.replace(/<!-- SEO-DIRECTORY-START -->[\s\S]*?<!-- SEO-DIRECTORY-END -->/,block);else html=html.replace('  <footer>',block+'\n  <footer>');
 html=html.replace(/<noscript>[\s\S]*?<\/noscript>/,'<noscript><section><h2>اشتراكات وخدمات ماستر ستور</h2><ul>'+indexed.map(p=>'<li><a href="'+SEO.productUrl(p)+'">'+escape(p.name)+'</a> — '+escape(p.description)+'</li>').join('')+'</ul></section></noscript>');
 fs.writeFileSync(path.join(root,'index.html'),html);
}
(async()=>{
 const prices=await loadPrices();writeProducts(prices);writeCategories();writeInternational();writeBuyingGuides();writeHome();
 const urls=[origin+'/',origin+'/warranty.html',origin+'/common-problems.html',origin+'/categories.html',...categories.map(SEO.categoryUrl),...internationalPages.map(internationalUrl),...buyingGuides.map(buyingUrl),...indexed.map(SEO.productUrl)];
 // No fabricated lastmod timestamps: catalog content can change independently of a deploy.
 fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('\n')+'\n</urlset>\n');
 console.log('SEO: '+products.length+' product pages, '+categories.length+' category pages, '+urls.length+' sitemap URLs; '+(prices?prices.length+' public price records':'no unverified prices')+'.');
})().catch(error=>{console.error(error);process.exitCode=1;});
