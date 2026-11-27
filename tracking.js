(()=>{
'use strict';

const S=window.MasterStore,C=window.MasterCloud,L=window.MasterLocale;
const form=document.getElementById('trackingForm');
const input=document.getElementById('trackingId');
const results=document.getElementById('trackingResults');
const notice=document.getElementById('trackingNotice');
const refresh=document.getElementById('trackingRefresh');
const clear=document.getElementById('trackingClear');
const login=document.getElementById('trackingLogin');
const support=document.getElementById('trackingSupport');
const submit=form.querySelector('[type=submit]');
const esc=S.escapeHtml;
const t=(ar,en)=>L?.getState().language==='en'?en:ar;
const supportUrl='https://wa.me/201500950624';
const steps=['pending_payment','processing','completed'];
const states={
  pending_payment:['بانتظار تأكيد الدفع','Awaiting payment confirmation'],
  processing:['جاري تنفيذ الطلب','Processing'],
  completed:['تم التنفيذ','Completed'],
  cancelled:['تم الإلغاء','Cancelled']
};
let orders=[],cloudError=false,loading=false,version=0;

function reference(value){
  return String(value||'').trim().toLowerCase();
}

function searchedOrderId(value){
  return reference(value).replace(/^ms-[co]-(?=.+)/,'');
}

function orderMessage(id){
  return t('متابعة طلب MASTER STORE','MASTER STORE order follow-up')+'\n'+t('رقم الطلب: ','Order ID: ')+id;
}

function card(order){
  const {id,local,status}=order;
  const label=local?t('سجل على الجهاز','Saved on this device'):(states[status]?t(...states[status]):t('راجع الدعم لتأكيد الحالة','Contact support for status'));
  const tone=!local&&status==='completed'?'ok':!local&&status==='cancelled'?'out':'soon';
  const date=new Date(order.createdAt);
  const when=Number.isNaN(date.getTime())?'—':date.toLocaleString(t('ar-EG','en-GB'));
  const step=local?-1:steps.indexOf(status);
  const progress=step<0?'':'<ol class="tracking-progress" aria-label="'+t('مراحل تنفيذ الطلب','Order progress')+'">'+steps.map((value,index)=>
    '<li class="'+(index<=step?'reached':'')+'"'+(index===step?' aria-current="step"':'')+'>'+t(...states[value])+'</li>'
  ).join('')+'</ol>';
  const message=orderMessage(id)+'\n'+order.product+'\n'+order.plan;
  const details=[
    [t('المدة','Duration'),L?.catalogText(order.duration,'duration',order.productId)||order.duration||'—'],
    [t('الكمية','Quantity'),order.quantity||1],
    [t('إجمالي الطلب','Order total'),S.orderMoney(order)],
    [t('الدفع','Payment'),order.payment==='wallet'?t('رصيد الحساب','Wallet'):order.payment||'—'],
    [t('تاريخ الطلب','Order date'),when]
  ];
  return '<article class="order-card tracking-card">'+
    '<div class="order-top"><div><small>'+t('رقم الطلب','Order ID')+'</small><b class="record-id" dir="ltr">'+esc(id)+'</b></div>'+
    '<span class="status '+tone+'">'+esc(label)+'</span></div>'+
    '<h2 dir="auto">'+esc(order.product)+'</h2><p>'+esc(L?.catalogText(order.plan,'planName',order.productId)||order.plan)+'</p>'+
    progress+'<dl class="tracking-details">'+details.map(([title,value])=>'<div><dt>'+title+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>'+
    (local?'<p class="tracking-local-note">'+t('ده سجل على جهازك. تواصل مع الدعم لتأكيد حالة الدفع والتنفيذ.','This record is saved on your device. Contact support to confirm payment and fulfillment.')+'</p>':'')+
    '<div class="tracking-card-actions">'+
      '<button class="ghost-btn" data-copy-order type="button">'+t('انسخ رقم الطلب','Copy order ID')+'</button>'+
      '<a class="ghost-btn" href="invoice.html?id='+encodeURIComponent(id)+(local?'&amp;source=device':'')+'">'+t(local?'ملخص الطلب / PDF':'الفاتورة / PDF',local?'Order summary / PDF':'Invoice / PDF')+'</a>'+
      '<a class="order-follow" target="_blank" rel="noopener" href="'+supportUrl+'?text='+encodeURIComponent(message)+'">'+t('اسأل الدعم عن الطلب','Ask support about this order')+'</a>'+
    '</div></article>';
}

function updateSearchControls(){
  clear.hidden=!input.value;
  const id=input.value.trim();
  support.href=id?supportUrl+'?text='+encodeURIComponent(orderMessage(id)):supportUrl;
}

function show(){
  updateSearchControls();
  if(loading){
    notice.textContent=t('جاري تحديث الطلبات…','Refreshing orders…');
    return;
  }
  const query=reference(input.value);
  const orderId=searchedOrderId(query);
  const matches=query?orders.filter(order=>[order.id,order.cartId].some(id=>[query,orderId].includes(reference(id)))):orders;
  results.innerHTML=matches.length?matches.map(card).join(''):
    '<section class="account-panel tracking-empty"><h2>'+t(query?'الطلب مش ظاهر هنا':'لسه مفيش طلبات ظاهرة',query?'Order not found here':'No orders to display')+'</h2>'+
    '<p>'+t('راجع الرقم أو سجّل الدخول بنفس الحساب المستخدم في الطلب.','Check the ID or sign in with the account used to place the order.')+'</p></section>';
  notice.textContent=cloudError?t('تعذّر تحديث بعض السجلات. اضغط «حدّث الحالة» للمحاولة مرة تانية.','Some records could not refresh. Select “Refresh status” to retry.'):
    t('الطلبات المعروضة: '+matches.length,'Orders shown: '+matches.length);
}

async function fetchAccountOrders(query){
  if(!C?.ready)return {signedIn:false,orders:[]};
  const auth=await C.client.auth.getSession();
  if(auth.error)throw auth.error;
  if(!auth.data.session)return {signedIn:false,orders:[]};
  const verified=await C.client.auth.getUser();
  if(verified.error)throw verified.error;
  const user=verified.data.user;
  if(!user)return {signedIn:false,orders:[]};
  let request=C.client.from('master_store_orders')
    .select('id,cart_id,created_at,product_id,product,plan,duration,quantity,amount_piasters,payment,status').eq('user_id',user.id);
  if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query)){
    request=request.or('id.eq.'+query+',cart_id.eq.'+query);
  }
  const rows=await C.unwrap(request.order('created_at',{ascending:false}).limit(100));
  return {signedIn:true,orders:rows.map(C.asLocalOrder)};
}

async function load(){
  const current=++version;
  loading=true;refresh.disabled=true;submit.disabled=true;
  results.setAttribute('aria-busy','true');
  show();
  const [account,guest]=await Promise.allSettled([
    fetchAccountOrders(searchedOrderId(input.value)),
    C?.ready?C.guestOrders():[]
  ]);
  if(current!==version)return;
  const remote=[
    ...(account.status==='fulfilled'?account.value.orders:[]),
    ...(guest.status==='fulfilled'&&C?.ready?guest.value.map(C.asLocalOrder):[])
  ];
  const indexed=new Map(remote.map(order=>[order.id,order]));
  for(const order of S.getOrders())if(order?.id&&!indexed.has(order.id))indexed.set(order.id,{...order,local:true});
  orders=[...indexed.values()].sort((first,second)=>new Date(second.createdAt)-new Date(first.createdAt));
  cloudError=account.status==='rejected'||guest.status==='rejected';
  login.hidden=account.status==='fulfilled'&&account.value.signedIn;
  loading=false;refresh.disabled=false;submit.disabled=false;
  results.setAttribute('aria-busy','false');
  show();
}

function setReferenceFromHash(){
  const id=location.hash.startsWith('#order=')?new URLSearchParams(location.hash.slice(1)).get('order'):'';
  input.value=(id||'').slice(0,input.maxLength);
}

form.addEventListener('submit',event=>{event.preventDefault();load();});
refresh.addEventListener('click',load);
clear.addEventListener('click',()=>{
  if(location.hash.startsWith('#order='))history.replaceState(history.state,'',location.pathname+location.search);
  input.value='';input.focus();load();
});
input.addEventListener('input',()=>{if(input.value.trim())updateSearchControls();else load();});
window.addEventListener('hashchange',()=>{setReferenceFromHash();load();});
document.addEventListener('masterstore:localechange',show);
results.addEventListener('click',async event=>{
  const button=event.target.closest('[data-copy-order]');
  if(!button)return;
  const reference=button.closest('.tracking-card').querySelector('.record-id');
  try{
    await navigator.clipboard.writeText(reference.textContent);
    button.textContent=t('تم النسخ','Copied');
  }catch{
    const selection=window.getSelection(),range=document.createRange();
    range.selectNodeContents(reference);selection.removeAllRanges();selection.addRange(range);
    button.textContent=t('اتحدد الرقم للنسخ','ID selected for copying');
  }
  setTimeout(()=>{button.textContent=t('انسخ رقم الطلب','Copy order ID');},2400);
});
C?.client?.auth.onAuthStateChange(event=>{
  if(event!=='SIGNED_OUT')return;
  version++;orders=[];loading=false;login.hidden=false;show();
  setTimeout(load,0);
});
setReferenceFromHash();
load();
})();
