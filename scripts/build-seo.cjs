// Generate crawlable product HTML from the same catalogue used by the storefront.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://master-pi-six.vercel.app';
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'catalog.js'),'utf8'), sandbox);
const products = sandbox.window.MasterCatalog.products.filter(p=>!p.redirectTo);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g,'\\u003c');
const template = fs.readFileSync(path.join(root,'product.html'),'utf8');
const out = path.join(root,'products');
fs.mkdirSync(out,{recursive:true});
for(const file of fs.readdirSync(out)) if(file.endsWith('.html')) fs.unlinkSync(path.join(out,file));
for(const p of products){
 if(!/^[a-z0-9-]+$/.test(p.id)) throw Error('Invalid product id');
 const url = origin+'/products/'+p.id+'.html';
 const image = new URL(p.logoUrl || (p.logo?'logos/'+p.logo+'.svg':'master-store-logo.png'),origin+'/').href;
 const title=p.name+' | ماستر ستور MASTER STORE';
 const description=p.description || p.name;
 const content='<section class="product-hero"><a href="/">كل الاشتراكات</a><h1>'+escape(p.name)+'</h1><p>'+escape(description)+'</p></section><section class="plans-block"><h2>مميزات الاشتراك</h2><ul>'+(p.features||[]).map(f=>'<li>'+escape(f)+'</li>').join('')+'</ul><h2>الباقات والتفعيل والضمان</h2>'+(p.plans||[]).filter(x=>!x.hidden).map(plan=>'<article><h3>'+escape(plan.name)+'</h3><p>'+escape(plan.duration)+'</p><p>'+escape(plan.activation)+'</p><p>'+escape(plan.warranty)+'</p></article>').join('')+'<p>السعر والتوفر الحالي يظهران عند تحميل الباقات، ويتم تأكيدهما قبل الدفع.</p><a href="/product.html?id='+encodeURIComponent(p.id)+'">عرض الباقات والطلب</a></section>';
 let html=template.replace('<head>','<head>\n  <base href="/">\n  <link rel="canonical" href="'+url+'">')
 .replace(/<title>[^<]*<\/title>/,'<title>'+escape(title)+'</title>')
 .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*(")/g,(_,a,b)=>a+escape(description)+b)
 .replace(/(<meta property="og:title" content=")[^"]*(")/,(_,a,b)=>a+escape(title)+b)
 .replace('<body>','<body data-product-id="'+p.id+'">')
 .replace(/(<main id="productPage"[^>]*>)[\s\S]*?<\/main>/,(_,open)=>open+content+'</main>')
 .replace('</head>','<meta property="og:url" content="'+url+'">\n<meta property="og:image" content="'+escape(image)+'">\n<script type="application/ld+json">'+json({'@context':'https://schema.org','@type':'Product','@id':url+'#product',name:p.name,description,url,image,brand:{'@type':'Brand',name:p.name}})+'</script>\n</head>');
 fs.writeFileSync(path.join(out,p.id+'.html'),html);
}
const urls=[origin+'/',origin+'/warranty.html',...products.map(p=>origin+'/products/'+p.id+'.html')];
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('\n')+'\n</urlset>\n');
let index=fs.readFileSync(path.join(root,'index.html'),'utf8');
index=index.replace(/<noscript>[\s\S]*?<\/noscript>/,'<noscript><section><h2>اشتراكات وخدمات ماستر ستور</h2><ul>'+products.map(p=>'<li><a href="/products/'+p.id+'.html">'+escape(p.name)+'</a> — '+escape(p.description)+'</li>').join('')+'</ul></section></noscript>');
fs.writeFileSync(path.join(root,'index.html'),index);
console.log('Generated '+products.length+' product pages and sitemap.');
