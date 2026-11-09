'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{randomUUID}=require('node:crypto');
const source=name=>fs.readFileSync(__dirname+'/../'+name,'utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function storage(){const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};}
function control(){return {value:'',disabled:false,isConnected:true,dataset:{},setAttribute(){},addEventListener(){},scrollIntoView(){}};}
async function cartCase({fail=false,storageFull=false}={}){
 const local=storage(),session=storage(),items=[{product_id:'fixture',plan_index:0,quantity:1}];local.setItem('master-cart-v1',JSON.stringify(items));
 const quote={items:[{...items[0],product:'Fixture',plan:'1 month',duration:'1 month',amount_piasters:10000}],amount_piasters:10000,subtotal_piasters:10000,discount_piasters:0,discount_percent:0};
 const button=control(),error=control(),root={innerHTML:'',querySelector:s=>s==='#cartError'?error:null,querySelectorAll:()=>[]};
 const form={elements:{name:{value:'Fixture'},phone:{value:'01000000001'},email:{value:'fixture@example.invalid'}},querySelector:s=>s==='button[type=submit]'?button:{value:'InstaPay'},querySelectorAll:()=>[]};
 const calls=[];let attempted=false;
 const cloud={unwrap:async p=>p,saveGuestReceipt(){if(storageFull)throw Error('Quota');},asLocalOrder:o=>({id:o.id}),errorText:e=>e.message,client:{rpc:async(name,args)=>{calls.push({name,args});if(fail&&!attempted){attempted=true;throw Error('Network');}return {cart_id:args.request_id,orders:[{id:'a-test-order',status:'pending_payment'}]};}}};
 const window={MasterCloud:cloud,MasterStore:{escapeHtml:String,formatCurrency:String,saveOrder(){if(storageFull)throw Error('Quota');},saveProfile(){if(storageFull)throw Error('Quota');}},MasterOrderDetails:{buildMessage:()=>''},MasterCatalogReady:new Promise(()=>{})};
 let code=source('cart.js').replace('Promise.resolve(window.MasterCatalogReady).then(render);','window.runCheckout=checkout;window.setQuote=(q,u)=>{quote=q;user=u;};');
 vm.runInNewContext(code,{window,document:{getElementById:id=>id==='cartError'?error:root,querySelectorAll:()=>[],addEventListener(){}},crypto:{randomUUID},localStorage:local,sessionStorage:session,console});window.setQuote(quote,null);
 await window.runCheckout({preventDefault(){},target:form});
 if(fail){assert.equal(error.textContent,'Network');assert.equal(button.disabled,false);assert.equal(JSON.parse(local.getItem('master-cart-v1')).length,1);await window.runCheckout({preventDefault(){},target:form});assert.equal(calls[0].args.request_id,calls[1].args.request_id);assert.equal(calls[0].args.receipt_token,calls[1].args.receipt_token);}
 assert(calls.every(x=>x.name==='master_store_guest_checkout'));assert.equal(calls.at(-1).args.quoted_amount,10000);assert(root.innerHTML.includes('طلبك اتسجّل عند الإدارة'));assert.equal(session.getItem('masterStoreCheckoutAttemptV1'),null);assert.equal(JSON.parse(local.getItem('master-cart-v1')).length,0);
 assert(!root.innerHTML.includes(calls.at(-1).args.receipt_token),'receipt capability leaked into HTML/URL');
}
async function adminCase(){
 const boxes=new Map();const reviewButton=control(),reviewForm={dataset:{reviewOrder:'fixture-order'},elements:{outcome:{value:'follow_up'},note:{value:'Internal note'}},querySelector:()=>reviewButton};
 function element(key){if(boxes.has(key))return boxes.get(key);const x={...control(),innerHTML:'',textContent:'',querySelector:s=>element(key+' '+s),querySelectorAll:s=>key==='#adminRows'&&s==='[data-review-order]'?[reviewForm]:[]};boxes.set(key,x);return x;}
 const root=element('root');root.querySelector=s=>element(s);root.querySelectorAll=()=>[];
 const calls=[],row={id:'fixture-order',product:'Fixture',amount_piasters:10000,quantity:1,plan:'Fixture',status:'pending_payment',customer:{name:'Test'},created_at:new Date().toISOString(),payment:'InstaPay',sales_outcome:'unreviewed',review_version:0};
 const C={ready:true,user:async()=>({id:'admin-fixture'}),unwrap:async p=>p,errorText:e=>e.message,client:{auth:{onAuthStateChange(){}},rpc:async(name,args)=>{calls.push({name,args});if(name==='master_store_admin_snapshot')return {stats:{orders:501,pending_orders:501,pending_topups:0,completed_sales:0},orders:[],customers:[],audit:[]};if(name==='master_store_order_inbox')return {orders:[row],total:501};return {};}}};
 vm.runInNewContext(source('admin.js'),{window:{MasterCloud:C,MasterStore:{escapeHtml:x=>String(x??''),formatCurrency:String}},document:{getElementById:()=>root,addEventListener(){}},location:{search:'?tab=orders'},URLSearchParams,console,confirm:()=>true,setInterval(){},clearTimeout,setTimeout});
 await flush();await flush();
 assert(boxes.get('#adminRows').innerHTML.includes('طلب ضيف'));
 assert.equal(typeof reviewForm.onsubmit,'function');reviewForm.onsubmit({preventDefault(){}});await flush();await flush();
 const mutation=calls.find(x=>x.name==='master_store_set_order_outcome');assert.deepEqual(JSON.parse(JSON.stringify(mutation.args)),{request_id:'fixture-order',outcome:'follow_up',note:'Internal note',expected_version:0});assert(!calls.some(x=>/review_order|wallet/.test(x.name)),'classification changed finance');
 boxes.get('#adminRows #inboxNext').onclick();await flush();assert.equal(calls.filter(x=>x.name==='master_store_order_inbox').at(-1).args.page_number,1);
}
(async()=>{await cartCase();await cartCase({fail:true});await cartCase({storageFull:true});await adminCase();console.log('PASS: guest server capture, retry IDs, failed request retention, storage failure after commit, private receipt token, independent purchase review and server-side pagination.');})().catch(e=>{console.error(e);process.exitCode=1});
