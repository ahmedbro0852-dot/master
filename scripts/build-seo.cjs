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
const directory='<section class="seo-directory" id="site-directory"><h2>تصفح أقسام ماستر ستور</h2><nav class="seo-category-links" aria-label="أقسام الاشتراكات">'+categoryLinks()+'</nav><details><summary>دليل الاشتراكات والخدمات</summary><nav class="seo-product-links" aria-label="كل صفحات الخدمات">'+indexed.map(p=>'<a href="'+SEO.productUrl(p)+'">'+escape(p.name)+'</a>').join('')+'</nav></details></section>';
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
  content+=ProductGuides.render(p.id,false,undefined,{product:p,catalog:catalog.products,priceRows:prices,featuresFor:plan=>sandbox.window.MasterProductFeatures.list(p,plan,false,x=>String(x||''))});
  if(WindowsGuide.match(p)){
   content=content.replace('</section><section class="plans-block">','</section>'+WindowsGuide.nav(false)+'<section class="plans-block" id="windows-plans">')+'<div id="windows-guide-root">'+WindowsGuide.render(false)+'</div>';
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
  let html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><meta name="description" content="'+escape(c.description)+'"><meta name="robots" content="index,follow"><link rel="canonical" href="'+url+'"><meta property="og:type" content="website"><meta property="og:title" content="'+escape(title)+'"><meta property="og:description" content="'+escape(c.description)+'"><meta property="og:url" content="'+url+'"><meta property="og:image" content="'+origin+'/master-store-logo.png"><meta property="og:site_name" content="MASTER STORE"><meta name="twitter:card" content="summary"><link rel="icon" href="/master-mark.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/theme.css?v=20261025-contrast1"><script src="/theme.js?v=20261021-dark1"></script><link rel="stylesheet" href="/seo-pages.css?v=20261023-seo3">'+dataScript(graph)+'<link rel="stylesheet" href="/store-assistant.css?v=20261026-actions1"></head><body class="seo-landing"><header><a href="/"><img src="/master-store-logo.svg" alt="ماستر ستور MASTER STORE" width="170" height="55"></a><a href="/#products">كل الخدمات والباقات ←</a></header><nav class="seo-breadcrumbs" aria-label="مسار التصفح"><a href="/">ماستر ستور</a><span>/</span><span>'+escape(c.name)+'</span></nav><main><h1>'+escape(c.title)+'</h1><p class="seo-intro">'+escape(c.description)+'</p><p class="seo-intro">'+list.length+' خدمة · افتح صفحة الخدمة لمراجعة الباقات والأسعار والتوفر الحالي.</p><section class="seo-card-grid">'+list.map(p=>'<article class="seo-service-card" data-product-id="'+escape(p.id)+'"><h2><a href="'+SEO.productUrl(p)+'">'+escape(p.name)+'</a></h2><p>'+escape(SEO.productDescription(p))+'</p><a class="seo-card-link" href="'+SEO.productUrl(p)+'">تفاصيل الباقات والتفعيل ←</a></article>').join('')+'</section></main><section class="seo-directory"><h2>أقسام أخرى</h2><nav class="seo-category-links">'+categoryLinks()+'</nav></section><footer><a href="/warranty.html">سياسة الضمان والاستبدال</a> · <a href="/track.html">متابعة الطلب</a> · MASTER STORE</footer><script src="/locale.js?v=20261031-eleven-500"></script><script src="/cart.js?v=20261026-actions1"></script><script src="/store-assistant.js?v=20261027-welcome1" defer></script></body></html>';
  html=html.replace('</head>','<link rel="stylesheet" href="/site-updates.css?v=20261025-review1"></head>').replace('</body>','<script src="/social-links.js?v=20261025-review1"></script><script src="/site-updates.js?v=20261025-review1" defer></script></body>').replace(' · MASTER STORE</footer>',' · MASTER STORE <a class="footer-facebook" href="'+Social.facebook+'" target="_blank" rel="noopener noreferrer">تابعنا على فيسبوك</a> <a class="footer-whatsapp-channel" href="'+Social.whatsappChannel+'" target="_blank" rel="noopener noreferrer">قناة عروض واتساب</a></footer>');
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
 const block='<!-- SEO-DIRECTORY-START -->'+directory+'<!-- SEO-DIRECTORY-END -->';
 if(html.includes('<!-- SEO-DIRECTORY-START -->'))html=html.replace(/<!-- SEO-DIRECTORY-START -->[\s\S]*?<!-- SEO-DIRECTORY-END -->/,block);else html=html.replace('  <footer>',block+'\n  <footer>');
 html=html.replace(/<noscript>[\s\S]*?<\/noscript>/,'<noscript><section><h2>اشتراكات وخدمات ماستر ستور</h2><ul>'+indexed.map(p=>'<li><a href="'+SEO.productUrl(p)+'">'+escape(p.name)+'</a> — '+escape(p.description)+'</li>').join('')+'</ul></section></noscript>');
 fs.writeFileSync(path.join(root,'index.html'),html);
}
(async()=>{
 const prices=await loadPrices();writeProducts(prices);writeCategories();writeHome();
 const urls=[origin+'/',origin+'/warranty.html',...categories.map(SEO.categoryUrl),...indexed.map(SEO.productUrl)];
 // No fabricated lastmod timestamps: catalog content can change independently of a deploy.
 fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('\n')+'\n</urlset>\n');
 console.log('SEO: '+products.length+' product pages, '+categories.length+' category pages, '+urls.length+' sitemap URLs; '+(prices?prices.length+' public price records':'no unverified prices')+'.');
})().catch(error=>{console.error(error);process.exitCode=1;});
