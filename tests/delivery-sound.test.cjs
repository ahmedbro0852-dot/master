'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('delivery.js','utf8');
const sound=source.slice(source.indexOf('let muted=false'),source.indexOf('function showDelivery'));
let notes=0,contexts=0,peak=0;
class Context{
 constructor(){contexts++;this.state='running';this.currentTime=0;this.destination={};}
 resume(){return Promise.resolve();}
 createOscillator(){notes++;return{frequency:{},connect(){},start(){},stop(){},disconnect(){}};}
 createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(value){peak=Math.max(peak,value);},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
}
const box={window:{AudioContext:Context}};
vm.runInNewContext(sound+';this.test={prepareSound,playOpenSound,mute:()=>{muted=true;}};',box);
box.test.playOpenSound();assert.equal(contexts,0,'must not start audio on page load');
box.test.prepareSound();box.test.playOpenSound();assert.equal(notes,4);assert(peak<=.055,'bounded quiet chime');
box.test.mute();box.test.playOpenSound();assert.equal(notes,4,'muted sound must stay silent');
vm.runInNewContext(sound+';prepareSound();playOpenSound();',{window:{}});
console.log('PASS: silent before interaction, four-note quiet chime, mute, and browsers without audio support.');
