const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('catalog.js','utf8'),sandbox);
vm.runInNewContext(fs.readFileSync('product-features.js','utf8'),sandbox);
const products=sandbox.window.MasterCatalog.products.filter(p=>!p.redirectTo);
const support=require('../subscription-troubleshooting.js'),common=require('../common-problems.js');
const Guides=require('../product-guides.js'),Windows=require('../windows-guide.js');
assert.equal(products.length,104,'catalog product count changed; review full support coverage');
assert.equal(common.problems.length,120,'common problems library must contain 120 entries');
assert.equal(new Set(common.problems.map(p=>p.id)).size,120,'common problem IDs must be unique');
assert(common.categories.length>=12,'expected broad support categories');
for(const p of common.problems){
 assert(p.question&&p.answer&&p.questionEn&&p.answerEn,'missing bilingual problem '+p.id);
 assert(common.categories.some(c=>c[0]===p.category),'unknown category for problem '+p.id);
}
let rendered=0,issues=0;
for(const product of products){
 const html=product.id==='windows-pro'?Windows.render(false,product):Guides.render(product.id,false,undefined,{
  product,catalog:products,
  featuresFor:plan=>sandbox.window.MasterProductFeatures.list(product,plan,false,x=>String(x||''))
 });
 assert(html.includes('id="subscription-troubleshooting"'),product.id+' has no product troubleshooting');
 const count=(html.match(/data-troubleshooting-issue=/g)||[]).length;
 assert(count>=5,product.id+' should have at least five product-specific fixes');
 const en=product.id==='windows-pro'?Windows.render(true,product):Guides.render(product.id,true,undefined,{product,catalog:products});
 assert(en.includes('id="subscription-troubleshooting"'),product.id+' missing English troubleshooting');
 rendered++;issues+=count;
}
assert(fs.readFileSync('common-problems.html','utf8').includes('id="commonProblemsApp"'));
assert(fs.readFileSync('scripts/public-assets.json','utf8').includes('"common-problems.js"'));
assert(fs.readFileSync('scripts/build-seo.cjs','utf8').includes("origin+'/common-problems.html'"));
console.log('PASS: '+common.problems.length+' bilingual common fixes; '+rendered+' of '+products.length+' product pages include '+issues+' tailored troubleshooting entries in Arabic and English.');
