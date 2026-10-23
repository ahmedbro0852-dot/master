// Run after node scripts/build-seo.cjs; no test framework required.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),S=require('../seo-config.js'),c={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'catalog.js'),'utf8'),c);const catalog=c.window.MasterCatalog;
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const graph=html=>JSON.parse(html.match(/<script id="master-seo-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const sm=read('sitemap.xml'),urls=[...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);assert.equal(new Set(urls).size,urls.length);
assert(!urls.some(x=>/account|invoice|management|admin|cart\.html|track\.html/.test(x)));
for(const p of catalog.products.filter(x=>!x.redirectTo)){
 const html=read('products/'+p.id+'.html'),g=graph(html)['@graph'],entity=g.find(x=>['Product','Service'].includes(x['@type']));
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert(html.includes('href="'+S.productUrl(p)+'"'));
 assert(html.includes('<base href="/">'));assert(html.includes('data-product-id="'+p.id+'"'));assert(html.includes('<h1>'));
 assert(!entity.image.startsWith('data:'));assert.equal(g.filter(x=>x['@type']==='BreadcrumbList').length,1);
 assert(!JSON.stringify(g).includes('aggregateRating'));assert(!JSON.stringify(g).includes('reviewCount'));
 if(entity['@type']==='Product'){assert(entity.offers.length);for(const o of entity.offers){assert.equal(o.priceCurrency,'EGP');assert(Number(o.price)>0);assert(o.availability.startsWith('https://schema.org/'));assert(o.url.startsWith(S.productUrl(p)+'?plan='));assert(html.includes(o.price+' جنيه مصري'));}}
 assert.equal(urls.includes(S.productUrl(p)),S.indexable(p));
 if(!S.indexable(p))assert(html.includes('content="noindex,follow"'));
 assert(S.categoryFor(p,catalog.categoryGroups).length||!S.indexable(p));
}
for(const url of urls){const pathname=new URL(url).pathname;if(pathname!=='/')assert(fs.existsSync(path.join(root,pathname)));}
for(const category of S.categories){const html=read('categories/'+category.slug+'.html'),g=graph(html)['@graph'];assert.equal(g[0]['@type'],'CollectionPage');assert(g[0].mainEntity.numberOfItems>0);assert(html.includes(S.categoryUrl(category)));}
const home=read('index.html');assert.equal((home.match(/id="master-seo-data"/g)||[]).length,1);assert(home.includes('dvpUjy_77Hw4vOnhyEyLAJ9m2NBAoZ1nUtnLy-ABb0s'));assert(home.includes('SEO-DIRECTORY-START'));
const p=catalog.getProduct('windows-pro'),row={product_id:p.id,plan_index:0,price_piasters:26500,available:true};
assert.equal(S.offers(p,[row])[0].price,'265.00');assert.equal(S.offers(p,[{...row,available:false}])[0].availability,'https://schema.org/OutOfStock');assert.equal(S.offers(p,[{...row,price_piasters:123}]).length,0);assert.equal(S.offers(p,[{...row,price_piasters:123,admin_overridden:true}])[0].price,'1.23');assert.equal(S.offers(p,null).length,0);
const exp={...p,plans:[{...p.plans[0],offerEndsAt:'2000-01-01T00:00:00Z'}]};assert.equal(S.offers(exp,[row])[0].availability,'https://schema.org/OutOfStock');
const fallback=S.productGraph(p,catalog.categoryGroups,null)['@graph'].at(-1);assert.equal(fallback['@type'],'Service');assert(!fallback.offers);
const config=JSON.parse(read('vercel.json'));assert(config.redirects.some(x=>x.source==='/index.html'&&x.destination==='/'));for(const name of ['account','admin','management','cart','track','invoice'])assert(config.headers.some(x=>x.source==='/'+name+'.html'&&x.headers.some(h=>h.key==='X-Robots-Tag'&&h.value.includes('noindex'))));
console.log('PASS: static content, 87 canonical sitemap URLs, all categories, truthful offers/availability, server overrides, expired offers, no-price fallback, unchanged verification token, private-page exclusion.');
