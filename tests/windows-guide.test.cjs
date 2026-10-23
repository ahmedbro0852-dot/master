const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const guide=require('../windows-guide.js'),root=path.resolve(__dirname,'..');
assert(guide.match({id:'windows-pro'}));
assert(!guide.match({id:'chatgpt-plus'}));
for(const en of [false,true]){
 const html=guide.render(en),nav=guide.nav(en);
 assert.equal((html.match(/<details /g)||[]).length,7);
 assert.equal((html.match(/<table /g)||[]).length,1);
 for(const id of ['windows-choose','windows-compare','windows-activation','windows-faq']){
  assert(html.includes('id="'+id+'"'));assert(nav.includes('#'+id+'"'));
 }
 assert(!html.includes('265')); // Pricing belongs to the live plans, not the guide.
 assert(html.includes('support.microsoft.com'));
 assert(html.includes('25'));
}
const windows=fs.readFileSync(path.join(root,'products/windows-pro.html'),'utf8');
assert.equal((windows.match(/id="windows-guide-root"/g)||[]).length,1);
assert.equal((windows.match(/id="windows-guide-nav"/g)||[]).length,1);
assert.equal((windows.match(/<details /g)||[]).length,7);
for(const file of fs.readdirSync(path.join(root,'products')).filter(x=>x.endsWith('.html')&&x!=='windows-pro.html'))assert(!fs.readFileSync(path.join(root,'products',file),'utf8').includes('id="windows-guide-root"'),file);
console.log('PASS: bilingual guide, navigation targets, seven FAQs, shared static rendering, isolated to the Windows group.');
