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
const inv=read('invoice.html');assert(inv.includes('invoice.js?v=20261104-warranty1')&&inv.includes('invoice.css?v=20261104-warranty1'),'warranty invoice assets missing');
const crm=read('management.html');assert(crm.includes('management.js?v=20261104-warranty1')&&crm.includes('management.css?v=20261104-warranty1'),'warranty CRM files not deployed');
for(const file of ['admin-control-center.js','admin-control-center.css'])assert(fs.existsSync(path.join(out,file)),'advanced admin asset missing: '+file);
const adminPage=read('admin.html');assert(adminPage.includes('admin-control-center.js?v=')&&adminPage.includes('admin-control-center.css?v='),'admin control center not loaded');
assert(plus.includes('data-product-id="chatgpt-plus"'),'main product identifier missing');
assert(read('robots.txt').includes('Sitemap: '+base+'/sitemap.xml'),'robots.txt sitemap mismatch');
console.log('Verified '+urls.length+' published URLs, product canonical tags, available routes, cart and storefront.');
