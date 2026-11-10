'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class Node {
 constructor(){this.listeners={};this.attrs={};this.children=[];this.hidden=true;this.value='';this.dataset={};this.classList={toggle(){}};}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 dispatchEvent(event){for(const fn of this.listeners[event.type]||[])fn(event);}
 setAttribute(key,value){this.attrs[key]=value;}
 removeAttribute(key){delete this.attrs[key];}
 append(...children){this.children.push(...children);}
 replaceChildren(){this.children=[];}
 contains(node){return node===this||this.children.some(child=>child.contains(node));}
 querySelectorAll(){return this.children.filter(n=>n.className==='master-suggest-option');}
}
(async()=>{
 const groups=['hero','catalog'].map(name=>{const group=new Node(),input=new Node(),panel=new Node(),clear=new Node();panel.id=name+'-suggestions';group.dataset.masterSearch=name;group.children=[input,panel,clear];input.blurs=0;input.blur=()=>{input.blurs++;};input.closest=()=>group;input.focus=()=>input.dispatchEvent({type:'focus'});group.querySelector=q=>q==='input[type=search]'?input:q==='.master-search-suggestions'?panel:q==='[data-search-clear]'?clear:null;group.querySelectorAll=()=>panel.querySelectorAll();return {group,input,panel,clear};});
 const products=['One','Two','Three'].map((name,i)=>({id:String(i),name,status:'available',href:'products/'+i+'.html'}));
 const cards=products.map(p=>({dataset:{productId:p.id,search:p.name},querySelector:q=>q==='a.card-btn[href]'?{getAttribute:()=>p.href}:null}));
 const document=new Node();document.documentElement={lang:'en'};document.getElementById=id=>id==='search'?groups[1].input:id==='heroCatalogSearch'?groups[0].input:id==='grid'?{querySelectorAll:()=>cards}:null;document.querySelector=()=>null;document.querySelectorAll=q=>q==='[data-master-search]'?groups.map(g=>g.group):[];document.createElement=()=>new Node();
 const window={MasterCatalogReady:Promise.resolve(),MasterCatalog:{getProduct:id=>products.find(p=>p.id===id)}};
 vm.runInNewContext(fs.readFileSync('store-search.js','utf8'),{window,document,matchMedia:()=>({matches:true}),Event:class{constructor(type){this.type=type;}},console});await new Promise(setImmediate);
 assert.equal(groups[1].input.attrs.enterkeyhint,'search');
 assert.equal(groups[1].clear.attrs['aria-label'],'Clear search');
 const hero=groups[0];hero.input.dispatchEvent({type:'focus'});assert.equal(hero.panel.hidden,false);
 hero.input.dispatchEvent({type:'keydown',key:'ArrowUp',preventDefault(){}});assert.equal(hero.input.attrs['aria-activedescendant'],'hero-option-2','ArrowUp starts at the last suggestion');
 hero.group.dispatchEvent({type:'focusout',relatedTarget:hero.panel.children[1]});assert.equal(hero.panel.hidden,false,'internal focus retains options');
 hero.group.dispatchEvent({type:'focusout',relatedTarget:null});assert.equal(hero.panel.hidden,true);assert.equal(hero.input.attrs['aria-expanded'],'false');assert.equal(hero.input.attrs['aria-activedescendant'],undefined);
 hero.input.value='missing';hero.input.dispatchEvent({type:'input'});assert.equal(groups[1].input.value,'missing');assert.equal(groups[1].clear.hidden,false);
 hero.input.dispatchEvent({type:'keydown',key:'Enter',isComposing:true,preventDefault(){throw new Error('composition must not submit');}});assert.equal(hero.input.blurs,0);
 hero.input.dispatchEvent({type:'keydown',key:'Enter',preventDefault(){}});assert.equal(hero.input.blurs,1);assert.equal(groups[1].input.blurs,1);assert.equal(hero.panel.hidden,true);
 groups[1].clear.dispatchEvent({type:'click'});assert.equal(hero.input.value,'');assert.equal(groups[1].input.value,'');assert.equal(groups[1].clear.hidden,true);
 document.dispatchEvent({type:'masterstore:searchreset'});assert.equal(hero.input.value,'');assert.equal(groups[1].input.value,'');assert.equal(hero.clear.hidden,true);assert.equal(hero.panel.hidden,true);
 console.log('PASS: reset synchronizes both search fields, clears stale suggestions, ArrowUp starts at last option, and focus dismissal preserves internal navigation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
