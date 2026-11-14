import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const cat=readFileSync(new URL('../StudioCat.jsx',import.meta.url),'utf8');
const styles=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src.jsx',import.meta.url),'utf8');

test('waiting screen renders interactive natural companion with accessible input',()=>{
 assert.match(app,/import StudioCat from '\.\/StudioCat\.jsx'/);
 assert.match(app,/<StudioCat paused=\{paused\} stage=\{job\.status\}/);
 assert.match(cat,/<button className="cat-play-button" type="button"/);
 assert.match(cat,/onClick=\{\(\)=>playAgain/);
});
test('cat has independent natural gestures without remote image assets',()=>{
 for(const motion of ['cat-natural-blink','cat-head-look','cat-tail-natural','cat-ear-flick','cat-chest','cat-paw-play','cat-eye-track','cat-ball-roll'])
  assert.ok(styles.includes('@keyframes '+motion),'missing motion '+motion);
 assert.ok(!/https?:\/\//.test(cat),'cat should be local and zero network');
});
test('reduced motion and user pause stop animation',()=>{
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(styles,/\.cat-lounge-natural \*\{animation:none!important/);
 assert.match(app,/className=\{'wait-journey '\+\(done\?'done '\:''\)\+\(paused\?'paused':''\)\}/);
});
test('browser refreshes single account only while jobs are active',()=>{
 assert.match(app,/if\(!active\.length\)return/);
 assert.match(app,/document\.hidden/);
 assert.match(app,/const a=await api\('account'\)/);
 assert.match(app,/setInterval\(sync,30000\)/);
 assert.doesNotMatch(app,/Promise\.all\(jobs\.filter\(/);
});
