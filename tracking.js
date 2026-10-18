(()=>{
'use strict';
const S=window.MasterStore,C=window.MasterCloud,L=window.MasterLocale;
const form=document.getElementById('trackingForm'),input=document.getElementById('trackingId'),results=document.getElementById('trackingResults'),notice=document.getElementById('trackingNotice'),refresh=document.getElementById('trackingRefresh');
const esc=S.escapeHtml,t=(ar,en)=>L?.getState().language==='en'?en:ar;
let orders=[],user=null,busy=false,cloudError=false;
const states={pending_payment:['بانتظار تأكيد الدفع','Awaiting payment'],processing:['جاري تنفيذ الطلب','Processing'],completed:['تم التنفيذ','Completed'],cancelled:['تم الإلغاء','Cancelled']};
function card(o){
 const local=o.local,label=local?t('محفوظ على الجهاز — التأكيد مع الدعم','Saved on this device — confirm with support'):(states[o.status]?.[L?.getState().language==='en'?1:0]||t('راجع الدعم لتأكيد الحالة','Contact support for status'));
 const date=new Date(o.createdAt),when=Number.isNaN(date.getTime())?'—':date.toLocaleString(L?.getState().language==='en'?'en-GB':'ar-EG');
 const progress=!local&&['pending_payment','processing','completed'].includes(o.status)?'<ol class="tracking-progress">'+['pending_payment','processing','completed'].map((s,i)=>'<li class="'+(i<=['pending_payment','processing','completed'].indexOf(o.status)?'reached':'')+'">'+esc(states[s][L?.getState().language==='en'?1:0])+'</li>').join('')+'</ol>':'';
 const message=t('متابعة طلب MASTER STORE','MASTER STORE order follow-up')+'\n'+t('رقم الطلب: ','Order ID: ')+o.id+'\n'+o.product+'\n'+o.plan;
 return '<article class="order-card tracking-card"><div class="order-top"><div><small>'+t('رقم الطلب','Order ID')+'</small><b class="record-id" dir="ltr">'+esc(o.id)+'</b></div><span class="status '+(!local&&o.status==='completed'?'ok':'soon')+'">'+esc(label)+'</span></div><h2>'+esc(o.product)+'</h2><p>'+esc(L?.catalogText(o.plan,'planName',o.productId)||o.plan)+'</p>'+progress+'<dl class="tracking-details"><div><dt>'+t('المدة','Duration')+'</dt><dd>'+esc(L?.catalogText(o.duration,'duration',o.productId)||o.duration||'—')+'</dd></div><div><dt>'+t('الكمية','Quantity')+'</dt><dd>'+esc(o.quantity||1)+'</dd></div><div><dt>'+t('إجمالي الطلب','Order total')+'</dt><dd>'+S.orderMoney(o)+'</dd></div><div><dt>'+t('الدفع','Payment')+'</dt><dd>'+esc(o.payment==='wallet'?t('رصيد الحساب','Wallet'):o.payment||'—')+'</dd></div><div><dt>'+t('تاريخ الطلب','Order date')+'</dt><dd>'+esc(when)+'</dd></div></dl>'+(local?'<p class="tracking-local-note">'+t('ده سجل للطلب على جهازك، ومش إثبات للدفع أو التنفيذ. الحالة المؤكدة من الدعم.','This device record is not proof of payment or fulfillment. Confirm status with support.')+'</p>':'')+'<a class="order-follow" target="_blank" rel="noopener" href="https://wa.me/201500950624?text='+encodeURIComponent(message)+'">'+t('تابع الطلب مع الدعم','Contact support about this order')+' ←</a></article>';
}
function show(){
 const q=input.value.trim().toLowerCase(),list=q?orders.filter(o=>String(o.id).toLowerCase()===q):orders;
 results.innerHTML=list.length?list.map(card).join(''):'<section class="account-panel tracking-empty"><h2>'+t(q?'الطلب مش ظاهر هنا':'لسه مفيش طلبات ظاهرة',q?'Order not found here':'No orders to display')+'</h2><p>'+t('راجع رقم الطلب أو سجّل الدخول بالحساب اللي طلبت منه. لو طلبت كضيف من جهاز تاني، تواصل مع الدعم.','Check the order ID or sign in to the account used to order. For guest orders on another device, contact support.')+'</p></section>';
 notice.textContent=cloudError?t('تعذر تحديث طلبات الحساب. سجلات الجهاز ظاهرة فقط؛ جرّب تحديث الصفحة.','Could not refresh account orders. Showing device records only; try refreshing.'):t('عرض '+list.length+' طلب'+(user?' · بيانات الحساب من النظام':' · سجلات هذا الجهاز'),'Showing '+list.length+' orders'+(user?' · account records':' · records on this device'));
}
async function load(){
 if(busy)return;busy=true;refresh.disabled=true;form.querySelector('[type=submit]').disabled=true;notice.textContent=t('جاري تحديث الطلبات…','Refreshing orders…');results.setAttribute('aria-busy','true');cloudError=false;
 try{
  let remote=[];user=null;
  if(C?.ready){
   const auth=await C.client.auth.getSession();if(auth.error)throw auth.error;
   if(auth.data.session){
    const verified=await C.client.auth.getUser();if(verified.error)throw verified.error;user=verified.data.user;
    if(user){
     let query=C.client.from('master_store_orders').select('id,created_at,product_id,product,plan,duration,quantity,amount_piasters,payment,status').eq('user_id',user.id);
     const q=input.value.trim();
     if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q))query=query.eq('id',q);
     const data=await C.unwrap(query.order('created_at',{ascending:false}).limit(100));remote=data.map(C.asLocalOrder);
    }
   }
  }
  const ids=new Set(remote.map(o=>o.id));
  orders=[...remote,...S.getOrders().filter(o=>!ids.has(o.id)).map(o=>({...o,local:true}))].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 }catch(error){cloudError=true;orders=S.getOrders().map(o=>({...o,local:true}));}
 finally{busy=false;refresh.disabled=false;form.querySelector('[type=submit]').disabled=false;results.setAttribute('aria-busy','false');document.getElementById('trackingLogin').hidden=!!user;show();}
}
form.addEventListener('submit',e=>{e.preventDefault();load();});refresh.addEventListener('click',load);
input.addEventListener('input',()=>{if(!input.value.trim())load();});
document.addEventListener('masterstore:localechange',show);
C?.client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){user=null;orders=S.getOrders().map(o=>({...o,local:true}));document.getElementById('trackingLogin').hidden=false;show();}});
load();
})();