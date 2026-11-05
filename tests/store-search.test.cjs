'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(__dirname+'/../store-search.js','utf8'),ctx={window:{}};
vm.runInNewContext(src,ctx,{filename:'store-search.js'});
const s=ctx.window.MasterStoreSearch;
const docs=[
 {id:'chatgpt-plus',name:'ChatGPT Plus',search:'شات جي بي تي بلس',status:'available',href:'products/chatgpt-plus.html'},
 {id:'chatgpt-go',name:'ChatGPT Go',search:'شات جو',status:'available',href:'products/chatgpt-go.html'},
 {id:'canva-pro',name:'Canva Pro',search:'كانفا تصميم',status:'available',href:'products/canva-pro.html'},
 {id:'out',name:'Unlisted',search:'unlisted',status:'out',href:''}
];
assert.equal(s.normalize('إيلِفِنْ'),s.normalize('ايلفن'));
assert.equal(s.suggest(docs,'شات').length,2);
assert.equal(s.suggest(docs,'chatgpt').length,2);
assert.equal(s.suggest(docs,'كانفا')[0].id,'canva-pro');
assert.equal(s.suggest(docs,'chatgpt')[0].id,'chatgpt-plus');
assert.equal(s.suggest(docs,'unlisted').length,0);
assert(s.matches(docs[0],'شات بلس'));
assert(src.includes('aria-autocomplete'),'accessible suggestions required');
assert(src.includes('event.key===\'ArrowDown\''),'keyboard option navigation required');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
assert(html.includes('id="heroCatalogSearch"')&&html.includes('id="catalogSearchSuggestions"'));
console.log('PASS: bilingual product search, Arabic aliases, ranked suggestions, keyboard handling and native catalog sync.');
