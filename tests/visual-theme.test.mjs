import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/premium.css',import.meta.url),'utf8');
const jsx=readFileSync(new URL('../src.jsx',import.meta.url),'utf8');

test('visual theme is loaded after base stylesheet so customisations win',()=>{
 assert.match(html, /href="\/style\.css"><link rel="stylesheet" href="\/premium\.css"/);
 assert.match(html, /name="theme-color" content="#0c2449"/);
});
test('hero preview is decorative and accessible with status specific labels',()=>{
 assert.match(jsx, /className="hero-art" aria-hidden="true"/);
 assert.match(jsx, /className="hero-live-dot" aria-hidden="true"/);
 assert.match(jsx, /className=\{"job-status status-"\+j\.status\}/);
 for(const state of ['processing','queued','submitting','succeeded','failed','canceled']){
  assert.ok(css.includes('status-'+state),'missing theme for '+state);
 }
});
test('premium theme handles desktop, tablet and narrow phones',()=>{
 for(const width of ['1220','900','650','385'])assert.ok(css.includes('@media(max-width:'+width+'px)'));
 assert.match(css, /\.model-cards\{display:flex;grid-template-columns:none;overflow-x:auto/);
 assert.match(css, /\.stats>div:last-child\{grid-column:1\/-1/);
 assert.match(css, /\.hero-art\{display:none\}/);
});
test('motion accessibility, focus indication and sticky navigation remain',()=>{
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/button:focus-visible,a:focus-visible/);
 assert.match(css,/\.mobile-bottom-nav/);
 assert.doesNotMatch(css,/!important\s*\}/); // no incomplete declarations
});
test('skin contains coherent balanced CSS blocks',()=>{
 let level=0;
 for(const c of css){if(c==='{')level++;if(c==='}')level--;assert.ok(level>=0,'stray closing bracket')}
 assert.equal(level,0);
});
