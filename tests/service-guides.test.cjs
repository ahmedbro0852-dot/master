const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),SEO=require('../seo-config.js'),G=require('../product-guides.js'),profiles=require('../product-guide-profiles.js');
const b={window:{}};for(const f of ['catalog.js','product-features.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),b);const products=b.window.MasterCatalog.products.filter(p=>!p.redirectTo),metas=new Set();let guides=0,planCards=0;
for(const p of products){
 const file=fs.readFileSync('products/'+p.id+'.html','utf8');
 assert.equal((file.match(/rel="canonical"/g)||[]).length,1,p.id);assert(!metas.has(SEO.productDescription(p)),p.id+' unique metadata');metas.add(SEO.productDescription(p));
 if(p.id==='windows-pro'){assert(file.includes('windows-guide-section'));continue;}
 const html=G.render(p.id,false,undefined,{product:p,catalog:products,featuresFor:plan=>b.window.MasterProductFeatures.list(p,plan,false,x=>x)});assert(html.includes('id="subscription-guide"'),p.id);assert(file.includes('id="subscription-guide"'),p.id+' SSR');assert.equal((html.match(/id="subscription-guide"/g)||[]).length,1);
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,p.id+' unique IDs');for(const m of html.matchAll(/href="[^\"]*#(guide-[^\"]+)"/g))assert(ids.includes(m[1]),p.id+' TOC target '+m[1]);
 const count=(html.match(/data-guide-plan=/g)||[]).length;if(p.id!=='chatgpt-go'){assert.equal(count,(p.plans||[]).filter(x=>!x.hidden).length,p.id+' plan indices');assert(profiles[p.id].introEn&&profiles[p.id].workflowEn&&profiles[p.id].checkEn);planCards+=count;}
 if(!p.plans?.length)assert(html.includes('لا توجد باقة قابلة للطلب حاليًا'),p.id);
 assert(!html.includes('FAQPage'));assert(!html.includes('aggregateRating'));assert(!html.includes('reviewCount'));guides++;
}
assert.equal(guides+1,products.length);console.log('PASS: '+products.length+' product routes, '+guides+' unique guides + existing Windows guide, '+planCards+' exact-tier cards, bilingual editorial coverage, unique metadata, canonical and TOC targets, no invented review/FAQ schema.');
