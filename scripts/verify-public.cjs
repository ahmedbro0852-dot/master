'use strict';
// Non-destructive deployment gate: validate the generated public tree, not customers or payments.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'_site'),base='https://master-pi-six.vercel.app';
const read=relative=>fs.readFileSync(path.join(out,relative),'utf8');
assert(fs.existsSync(out),'public build directory not found');
for(const name of ['index.html','cart.html','robots.txt','sitemap.xml','warranty.html','products/chatgpt-plus.html','categories/video-tools.html'])
 assert(fs.existsSync(path.join(out,name)),name+' missing from output');
const xml=read('sitemap.xml');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert(urls.length>20,'sitemap unexpectedly short');
assert.equal(new Set(urls).size,urls.length,'sitemap has duplicate URLs');
assert(!urls.some(u=>/\/services\.html|\/admin\.html|\/management\.html|\/cart\.html|\/account\.html/.test(u)),'private or unavailable page in sitemap');
for(const address of urls){
 const url=new URL(address);
 assert.equal(url.origin,base,'off-site URL in sitemap');
 const relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
 assert(!relative.includes('..')&&!relative.startsWith('/'),'invalid sitemap path');
 assert(fs.existsSync(path.join(out,relative)),relative+' missing from published output');
 if(relative.startsWith('products/')||relative.startsWith('categories/')){
  const html=read(relative);
  assert(html.includes('rel="canonical" href="'+address+'"'),relative+' canonical URL mismatch');
  assert(/<h1(?:\s[^>]*)?>/.test(html),relative+' missing H1');
 }
 if(relative.startsWith('categories/'))assert(!read(relative).includes('href="/services.html"'),relative+' advertises unavailable services');
}
for(const legacy of ['services.html','creative-services.css','creative-services.js'])
 assert(!fs.existsSync(path.join(out,legacy)),legacy+' must not be published');
const home=read('index.html'),cart=read('cart.html'),plus=read('products/chatgpt-plus.html');
assert(home.includes('id="products"'),'homepage catalog missing');
assert(home.includes('social-market-preview'),'coming-soon social preview missing');
assert(cart.includes('id="cartContent"')&&cart.includes('cart.js?v='),'cart checkout missing');
assert(cart.includes('site-nav.js?v=')&&!cart.includes('src="app.js?v='),'cart must load lightweight shared navigation');
assert(plus.includes('site-nav.js?v=')&&!plus.includes('src="app.js?v='),'product must load lightweight shared navigation');
assert(home.includes('src="app.js?v='),'homepage catalogue renderer must remain available');
assert(home.includes('rel="preconnect" href="https://gmysuhoebcapigdidnnv.supabase.co"'),'public price connection warm-up missing');
assert(fs.existsSync(path.join(out,'site-nav.js')),'shared navigation JS missing');
assert(home.includes('id="visual-explore"'),'visual category explorer missing');
assert(home.includes('id="heroCatalogSearch"')&&home.includes('id="catalogSearchSuggestions"'),'search entry points missing');
assert(home.includes('store-search.js?v=20261105-autocomplete1')&&home.includes('store-search.css?v=20261105-autocomplete1'),'live search scripts not wired');
for(const file of ['store-search.js','store-search.css'])assert(fs.existsSync(path.join(out,file)),'missing search asset: '+file);

assert(home.includes('store-visuals.css?v=20261104-categories1'),'new visual styling not loaded');
assert((home.match(/class="visual-explore-card/g)||[]).length===4,'four visual categories expected');
for(const art of ['ai-card.svg','video-card.svg','design-card.svg','study-card.svg']){
 const p=path.join(out,'images','showcase',art);
 assert(fs.existsSync(p),'category illustration missing: '+art);
 assert(fs.readFileSync(p,'utf8').includes('<svg'),'invalid static SVG '+art);
}
const gif=path.join(out,'images','showcase','ai-orbit.gif');
assert(fs.existsSync(gif),'animated AI illustration missing');
const animated=fs.readFileSync(gif);
assert(animated.slice(0,6).toString('ascii')==='GIF89a','GIF signature invalid');
assert(animated.length<150000,'GIF asset too large');
assert(home.includes('prefers-reduced-motion: reduce')&&home.includes('ai-card.svg'),'provide static art when motion reduced');
for(const slug of ['writing-research-tools','video-tools','image-design-tools','education-learning'])
 assert(home.includes('/categories/'+slug+'.html'),'category image link missing: '+slug);

const inv=read('invoice.html');assert(inv.includes('invoice.js?v=20261104-warranty1')&&inv.includes('invoice.css?v=20261104-warranty1'),'warranty invoice assets missing');
const crm=read('management.html');assert(crm.includes('management.js?v=20261104-paid-guard1')&&crm.includes('management.css?v=20261104-workflow2'),'warranty CRM workflow files not deployed');
const adminPage=read('admin.html');
assert(adminPage.includes('admin-bulk-pricing.js?v=20261104-bulk-price1'),'bulk pricing module not linked');
for(const file of ['admin-control-center.js','admin-control-center.css','admin-bulk-pricing.js'])assert(fs.existsSync(path.join(out,file)),'advanced admin asset missing: '+file);
assert(adminPage.includes('admin-control-center.js?v=20261104-bulk-price1')&&adminPage.includes('admin-control-center.css?v=20261104-bulk-price1'),'admin control center not loaded');
assert(plus.includes('data-product-id="chatgpt-plus"'),'main product identifier missing');
assert(read('robots.txt').includes('Sitemap: '+base+'/sitemap.xml'),'robots.txt sitemap mismatch');
console.log('Verified '+urls.length+' published URLs, product canonical tags, available routes, cart and storefront.');
