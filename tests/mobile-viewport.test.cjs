'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('site-updates.js','utf8').split('/* Keep checkout and support controls clear of the mobile keyboard. */')[1];
assert(source,'keyboard viewport controller is present');
const handlers={},viewportHandlers={},windowHandlers={},attributes=new Map(),properties=new Map();
const root={toggleAttribute:(name,on)=>on?attributes.set(name,''):attributes.delete(name),style:{setProperty:(name,value)=>properties.set(name,value),removeProperty:name=>properties.delete(name)}};
const document={documentElement:root,activeElement:{matches:()=>false},addEventListener:(name,fn)=>handlers[name]=fn};
const media={matches:true},viewport={height:780,addEventListener:(name,fn)=>viewportHandlers[name]=fn};
const window={matchMedia:()=>media,visualViewport:viewport,innerHeight:800,addEventListener:(name,fn)=>windowHandlers[name]=fn,setTimeout:fn=>fn()};
vm.runInNewContext(source,{document,window});
assert.equal(properties.get('--mobile-visible-height'),'780px');
document.activeElement={matches:()=>true};handlers.focusin();assert(attributes.has('data-mobile-editing'));
viewport.height=365;viewportHandlers.resize();assert.equal(properties.get('--mobile-visible-height'),'365px');
document.activeElement={matches:()=>false};handlers.focusout();assert(!attributes.has('data-mobile-editing'));
media.matches=false;windowHandlers.resize();assert(!properties.has('--mobile-visible-height'));
media.matches=true;window.visualViewport=undefined;windowHandlers.resize();
// A browser without VisualViewport uses the window height.
const fallbackWindow={...window,visualViewport:undefined};vm.runInNewContext(source,{document,window:fallbackWindow});assert.equal(properties.get('--mobile-visible-height'),'800px');
console.log('PASS: mobile text focus hides overlays, keyboard viewport resizes checkout, blur restores controls, desktop clears overrides, and older browsers fall back to window height.');
