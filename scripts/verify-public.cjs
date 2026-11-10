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

const homeSections=[
 'class="hero hero-v2"',
 'class="store-section-links"',
 'id="best-offers"',
 'class="home-plus-offer"',
 'id="products"',
 'id="social-market"',
 'id="customer-stories"',
 'id="how"',
 'class="store-follow"',
 'class="wallet-intro"'
].map(snippet=>home.indexOf(snippet));
assert(homeSections.every((position,i)=>position!==-1&&(!i||position>homeSections[i-1])),'homepage shopping flow sections out of order');
assert(!home.includes('class="confidence-strip"')&&!home.includes('class="home-avatar-row"'),'old duplicate homepage blocks restored');
assert(home.includes('homepage-refresh.css?v=20261110-header-van1'),'new homepage layout CSS is not cache-busted');

// Regression gate: both account and checkout must ship the CSS they reference.
const mobileFix='mobile-checkout-account-fix.css';
assert(fs.existsSync(path.join(out,mobileFix)),mobileFix+' missing from public build');
assert(cart.includes('/'+mobileFix+'?v='),'cart missing mobile layout fix link');
assert(read('account.html').includes('/'+mobileFix+'?v='),'account missing mobile layout fix link');
// Category discovery is a working navigation destination, not a mockup.
const categoryPage=read('categories.html');
assert(categoryPage.includes('data-category-group="محادثة ومساعد ذكي"'),'AI assistant category missing');
assert((categoryPage.match(/data-category-group=/g)||[]).length===10,'category tile count changed');
assert(categoryPage.includes('/categories-modern.css?v=')&&categoryPage.includes('/categories-modern.js?v='),'category assets not linked');
for(const asset of ['categories-modern.css','categories-modern.js'])assert(fs.existsSync(path.join(out,asset)),'category asset missing: '+asset);
assert(categoryPage.includes('cat-hero-showcase')&&categoryPage.includes('id="categorySearch"'),'rich category hero or live search missing');
assert(categoryPage.includes('/categories-modern.css?v=20261107-premium2'),'latest category styles not linked');
assert(categoryPage.includes('/categories-modern.js?v=20261107-premium2'),'latest category interactions not linked');
assert(read('categories-modern.css').includes('.cat-art-logo'),'premium category artwork styling missing');
assert(read('categories-modern.js').includes('function filter()'),'category search functionality missing');
assert(home.includes('href="/categories.html"'),'homepage category entry missing');
assert(read('site-updates.js').includes("href:'/categories.html'"),'mobile category navigation missing');
assert(cart.includes('id="cartContent"')&&cart.includes('cart.js?v='),'cart checkout missing');
assert(cart.includes('site-nav.js?v=')&&!cart.includes('src="app.js?v='),'cart must load lightweight shared navigation');
assert(plus.includes('site-nav.js?v=')&&!plus.includes('src="app.js?v='),'product must load lightweight shared navigation');
assert(home.includes('src="app.js?v='),'homepage catalogue renderer must remain available');
assert(home.includes('rel="preconnect" href="https://gmysuhoebcapigdidnnv.supabase.co"'),'public price connection warm-up missing');
assert(fs.existsSync(path.join(out,'site-nav.js')),'shared navigation JS missing');
assert(!home.includes('id="visual-explore"')&&!home.includes('href="#visual-explore"'),'removed visual category explorer is still linked');
const lovableCatalog=read('catalog.js');assert(lovableCatalog.includes('4800')&&lovableCatalog.includes('1100'),'Lovable updated prices missing');assert(home.includes('حتى 300 كريدت خلال السنة'),'Lovable annual activation label missing');
assert(home.includes('id="heroCatalogSearch"')&&home.includes('id="catalogSearchSuggestions"'),'search entry points missing');
assert(home.includes('store-search.js?v=20261110-mobile-search2')&&home.includes('store-search.css?v=20261105-autocomplete1'),'live search scripts not wired');
for(const file of ['store-search.js','store-search.css'])assert(fs.existsSync(path.join(out,file)),'missing search asset: '+file);

assert(!home.includes('store-visuals.css')&&!home.includes('visual-explore-card'),'deleted category artwork is not loaded');

const inv=read('invoice.html');assert(inv.includes('invoice.js?v=20261104-warranty1')&&inv.includes('invoice.css?v=20261104-warranty1'),'warranty invoice assets missing');
const crm=read('management.html');
assert(crm.includes('crm-enhance.js?v=20261105-photos1')&&crm.includes('crm-enhance.css?v=20261105-photos1'),'CRM photo and follow-up UI not linked');
for(const entry of ['crm-enhance.js','crm-enhance.css'])assert(fs.existsSync(path.join(out,entry)),'CRM enhancement missing from public build: '+entry);
assert(crm.includes('management.js?v=20261105-photos1')&&crm.includes('management.css?v=20261104-workflow2'),'warranty CRM workflow files not deployed');
const adminPage=read('admin.html');
assert(adminPage.includes('admin-bulk-pricing.js?v=20261104-bulk-price1'),'bulk pricing module not linked');
for(const file of ['admin-control-center.js','admin-control-center.css','admin-bulk-pricing.js'])assert(fs.existsSync(path.join(out,file)),'advanced admin asset missing: '+file);
assert(adminPage.includes('admin-control-center.js?v=20261104-bulk-price1')&&adminPage.includes('admin-control-center.css?v=20261104-bulk-price1'),'admin control center not loaded');
assert(plus.includes('data-product-id="chatgpt-plus"'),'main product identifier missing');
assert(read('robots.txt').includes('Sitemap: '+base+'/sitemap.xml'),'robots.txt sitemap mismatch');
console.log('Verified '+urls.length+' published URLs, product canonical tags, available routes, cart and storefront.');

// Private delivery pages must publish the UI, never its database setup or an indexable receipt.
for(const name of ['delivery.html','delivery-admin.html']){
 assert(fs.existsSync(path.join(out,name)),name+' missing');
 assert(read(name).includes('noindex,nofollow,noarchive'),name+' missing privacy robots directive');
 assert(read(name).includes('name="referrer" content="no-referrer"'),name+' missing referrer protection');
 assert(!urls.some(url=>url.endsWith('/'+name)),name+' must not be indexed');
}
for(const name of ['delivery.js','delivery-admin.js','delivery.css'])assert(fs.existsSync(path.join(out,name)),name+' missing');
assert(!fs.existsSync(path.join(out,'db/delivery_links.sql')),'private delivery SQL leaked');
console.log('PASS: private delivery pages and assets published with noindex/referrer protection; database setup excluded.');
