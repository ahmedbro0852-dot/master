import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadDraft,saveDraft,clearDraft,DRAFT_KEY} from '../lib/draft.mjs';

function storage(){const records=new Map();return {getItem:key=>records.get(key)||null,setItem:(key,value)=>records.set(key,value),removeItem:key=>records.delete(key)};}
test('local draft restores prompt, selected model, format and duration after refresh',()=>{
 const browser=storage();const input={prompt:'Cinematic waves',model:'veo-test',ratio:'portrait',duration:10,imageMode:false,image:''};
 assert.equal(saveDraft(input,browser,1000),true);
 const restored=loadDraft(browser,1100);
 assert.equal(restored.prompt,input.prompt);
 assert.equal(restored.model,input.model);
 assert.equal(restored.ratio,input.ratio);
 assert.equal(restored.duration,input.duration);
});
test('base64 uploads and user credentials are never written to draft storage',()=>{
 const browser=storage();
 saveDraft({prompt:'waterfall',image:'data:image/jpeg;base64,SECRET_FRAME',code:'MF-SECRET',token:'PRIVATE',model:'veo'},browser,1000);
 const raw=browser.getItem(DRAFT_KEY);
 assert.ok(!raw.includes('SECRET_FRAME'));
 assert.ok(!raw.includes('MF-SECRET'));
 assert.ok(!raw.includes('PRIVATE'));
 assert.equal(loadDraft(browser,1200).imageUrl,'');
});
test('HTTPS image links persist but oversized or non-https URLs do not',()=>{
 const browser=storage();
 saveDraft({prompt:'waves',image:'https://static.example.test/frame.jpg',imageMode:true},browser,1000);
 assert.equal(loadDraft(browser,1100).imageUrl,'https://static.example.test/frame.jpg');
 saveDraft({prompt:'waves',image:'http://unsafe.example.test/frame.jpg'},browser,1200);
 assert.equal(loadDraft(browser,1300).imageUrl,'');
});
test('corrupted and old draft entries safely fall back to empty editor',()=>{
 const browser=storage();browser.setItem(DRAFT_KEY,'wrong-json');
 assert.equal(loadDraft(browser,1100),null);
 saveDraft({prompt:'never store forever'},browser,1000);
 assert.equal(loadDraft(browser,90*24*60*60*1000+2000),null);
 clearDraft(browser);assert.equal(browser.getItem(DRAFT_KEY),null);
});
test('editor handles disabled connection and offers manual clear and recovery',()=>{
 const app=readFileSync(new URL('../src.jsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../public/premium.css',import.meta.url),'utf8');
 assert.match(app,/const initialDraft=useRef\(null\)/);
 assert.match(app,/\[prompt,P\]=useState\(saved.prompt\|\|''\)/);
 assert.match(app,/setTimeout\(\(\)=>saveDraft/);
 assert.match(app,/window.addEventListener\('offline'/);
 assert.match(app,/window.addEventListener\('online'/);
 assert.match(app,/disabled=\{busy\|\|uploading\|\|!online\|\|catalogStale/);
 assert.match(app,/className="draft-toolbar"/);
 assert.match(app,/className="network-banner"/);
 assert.match(css,/\.draft-toolbar/);
 assert.match(css,/\.network-banner/);
});
