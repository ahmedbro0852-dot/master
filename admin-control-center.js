(function(){
'use strict';
// The screen is mounted only after master_store_admin_snapshot authorizes the current user.
// Every write uses the existing server-validated admin RPC. No client-side role promotion.
const C=window.MasterCloud,S=window.MasterStore,E=S.escapeHtml;
const lang=()=>window.MasterLocale?.getState().language==='en';
const t=(ar,en)=>lang()?en:ar;
const money=n=>S.formatCurrency(Number(n||0)/100,'EGP');
const cell=value=>{
 let s=String(value??'');
 // Prevent spreadsheet formula execution when customer-entered data is opened in Excel/Sheets.
 if(/^[\s\u0000-\u001f]*[=+\-@]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
};
const asCsv=(header,records)=>'\uFEFF'+[header,...records].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
function download(name,columns,rows){
 const csv=asCsv(columns,rows),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='master-store-'+name+'-'+new Date().toISOString().slice(0,10)+'.csv';
 document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
}
function render(box,data,api){
 const allPlans=Array.isArray(data?.plans)?data.plans:[];
 const customers=Array.isArray(data?.customers)?data.customers:[];
 const topups=Array.isArray(data?.topups)?data.topups:[];
 const audit=Array.isArray(data?.audit)?data.audit:[];
 const stats=data?.stats||{};
 let query='',status='all',page=0,selection=new Set(),busy=false;
 const pageSize=25;
 const counts={
  products:new Set(allPlans.map(p=>p.product_id)).size,
  plans:allPlans.length,
  available:allPlans.filter(p=>p.available).length,
  unavailable:allPlans.filter(p=>!p.available).length,
  customers:customers.length,
  pendingOrders:Number(stats.pending_orders||0),
  pendingTopups:Number(stats.pending_topups||0)
 };
 const stat=(value,title)=>'<article class="power-stat"><b>'+E(value)+'</b><small>'+title+'</small></article>';
 box.innerHTML='<section class="power-desk" aria-labelledby="power-title">'+
  '<div class="power-head"><div><span class="power-eyebrow">MASTER STORE · CONTROL CENTER</span><h2 id="power-title">'+t('مركز تحكم المالك','Owner control center')+'</h2><p>'+t('إدارة أوسع وتقارير ومهام جماعية؛ كل تغيير محمي بصلاحيات الإدارة الحالية.','Advanced operations and exports; every change is protected by existing admin permissions.')+'</p></div><a class="ghost-btn" href="management.html">'+t('إدارة العملاء والاشتراكات ←','Customer and subscription management →')+'</a></div>'+
  '<div class="power-stats">'+stat(counts.products,t('خدمات','Products'))+stat(counts.plans,t('باقات','Plans'))+stat(counts.available,t('متاحة','Available'))+stat(counts.unavailable,t('موقوفة','Unavailable'))+stat(counts.pendingOrders,t('طلبات مفتوحة','Open orders'))+stat(counts.pendingTopups,t('شحن للمراجعة','Top-ups pending'))+'</div>'+
  '<section class="power-card"><h3>'+t('وصول سريع','Quick controls')+'</h3><div class="power-links"><a class="power-warranty-link" href="management.html?warranty=1">'+t('🛡️ إدارة الضمان والتنبيهات','🛡️ Warranty controls')+'</a><button type="button" data-power-tab="orders">'+t('كل الطلبات','All orders')+'</button><button type="button" data-power-tab="topups">'+t('طلبات الشحن','Top-ups')+'</button><button type="button" data-power-tab="plans">'+t('تعديل الأسعار','Edit prices')+'</button><button type="button" data-power-tab="campaigns">'+t('العروض والبوسترات','Campaigns')+'</button><button type="button" data-power-tab="customers">'+t('المحافظ','Wallets')+'</button><button type="button" data-power-tab="audit">'+t('سجل العمليات','Audit log')+'</button></div></section>'+
  '<section class="power-card"><div class="power-section-head"><div><h3>'+t('نسخ وتقارير قابلة للتنزيل','Exports and reports')+'</h3><p>'+t('الملفات فيها بيانات إدارية؛ احتفظ بها في مكان آمن. لا يتم رفعها لأي طرف آخر.','Exports contain private store data. Save them securely; no third-party upload is performed.')+'</p></div></div><div class="power-links power-export-links">'+
  '<button type="button" data-power-export="orders">'+t('⬇ تقرير الطلبات (حتى 2000)','⬇ Orders (up to 2000)')+'</button>'+
  '<button type="button" data-power-export="plans">'+t('⬇ جميع الباقات والأسعار','⬇ All plans and prices')+'</button>'+
  '<button type="button" data-power-export="customers">'+t('⬇ العملاء والمحافظ','⬇ Customers and wallets')+'</button>'+
  '<button type="button" data-power-export="topups">'+t('⬇ طلبات شحن الرصيد','⬇ Wallet top-ups')+'</button>'+
  '<button type="button" data-power-export="audit">'+t('⬇ أحدث عمليات الإدارة','⬇ Recent admin activity')+'</button></div><p class="power-note">'+t('تقرير الطلبات يقرأ الصفحات من السيرفر؛ باقي التقارير تستخدم آخر لقطة إدارية موثّقة.','Orders are fetched page by page; other reports use the latest authorized admin snapshot.')+'</p></section>'+
  '<section class="power-card" id="power-bulk-plans"><div class="power-section-head"><div><h3>'+t('التحكم الجماعي في توفر الباقات','Bulk plan availability')+'</h3><p>'+t('اختر حتى 25 باقة من الصفحة الحالية. التفعيل أو الإيقاف لا يغيّر السعر أو كمية الشراء، ويحتاج تأكيدًا صريحًا.','Choose up to 25 plans on the current page. Availability changes never modify price or quantity and require explicit confirmation.')+'</p></div></div>'+
  '<div class="power-filters"><label>'+t('ابحث عن خدمة أو باقة','Search for a product or plan')+'<input id="powerSearch" type="search" autocomplete="off" placeholder="'+t('اسم الخدمة أو الباقة','Product or plan name')+'"></label>'+
  '<label>'+t('حالة التوفر','Availability')+'<select id="powerFilter"><option value="all">'+t('الكل','All')+'</option><option value="available">'+t('متاح','Available')+'</option><option value="unavailable">'+t('غير متاح','Unavailable')+'</option></select></label></div>'+
  '<p id="powerCount" class="power-note" role="status"></p>'+
  '<div class="power-table-wrap"><table class="power-table"><thead><tr><th><label><input type="checkbox" id="powerSelectAll" aria-label="'+t('تحديد الباقات الظاهرة','Select visible plans')+'"></label></th><th>'+t('الخدمة / الباقة','Product / plan')+'</th><th>'+t('السعر','Price')+'</th><th>'+t('التوفر','Availability')+'</th></tr></thead><tbody id="powerPlans"></tbody></table></div>'+
  '<div class="power-pager"><button type="button" id="powerPrev">'+t('السابق','Previous')+'</button><span id="powerPage"></span><button type="button" id="powerNext">'+t('التالي','Next')+'</button></div>'+
  '<div class="power-actions"><span id="powerSelected" role="status"></span><button type="button" id="powerEnable" class="primary">'+t('تفعيل المحدد','Enable selected')+'</button><button type="button" id="powerDisable" class="ghost-btn">'+t('إيقاف المحدد','Disable selected')+'</button></div><p class="power-warning">'+t('لن يتم تعديل طلبات العملاء السابقة أو أرصدة المحافظ هنا. مراجعة الدفع والإلغاء تتم فرديًا في قسم الطلبات.','This section cannot change previous orders or wallet balances. Payments and cancellations remain individual actions.')+'</p></section>'+
  '<p id="powerMessage" class="power-message" role="status" aria-live="polite" hidden></p></section>';
 const get=(selector)=>box.querySelector(selector);
 const error=err=>C.errorText?.(err)||String(err?.message||err);
 const message=(s,isError=false)=>{const node=get('#powerMessage');if(!node)return;node.hidden=false;node.textContent=s;node.dataset.error=String(isError);node.scrollIntoView?.({block:'nearest'});};
 function filtered(){
  const q=query.trim().toLocaleLowerCase();
  return allPlans.filter(p=>(status==='all'||!!p.available===(status==='available'))&&(!q||(String(p.product_name||'')+' '+String(p.plan_name||'')+' '+String(p.product_id||'')).toLocaleLowerCase().includes(q)));
 }
 function current(){
  const arr=filtered();const maxPage=Math.max(0,Math.ceil(arr.length/pageSize)-1);
  page=Math.min(page,maxPage);
  return {arr,visible:arr.slice(page*pageSize,(page+1)*pageSize),maxPage};
 }
 function draw(){
  const {arr,visible,maxPage}=current();selection.clear();
  get('#powerCount').textContent=t('نتائج البحث: ','Results: ')+arr.length+' · '+t('اختر الباقات الظاهرة فقط','Selection applies to this page only');
  get('#powerPlans').innerHTML=visible.length?visible.map(p=>{
   const key=String(p.product_id)+'::'+String(p.plan_index);
   return '<tr><td><input type="checkbox" data-plan-key="'+E(key)+'" aria-label="'+E(t('اختيار ','Select ')+p.product_name+' — '+p.plan_name)+'"></td>'+
    '<td><strong>'+E(p.product_name)+'</strong><small>'+E(p.plan_name)+' · #'+Number(p.plan_index)+'</small></td>'+
    '<td>'+E(money(p.price_piasters))+'</td><td><span class="power-availability '+(p.available?'is-on':'is-off')+'">'+t(p.available?'متاح':'موقوف',p.available?'Available':'Unavailable')+'</span></td></tr>';
  }).join(''):'<tr><td colspan="4">'+t('لا توجد باقات مطابقة','No matching plans')+'</td></tr>';
  get('#powerPage').textContent=t('صفحة ','Page ')+(page+1)+' / '+(maxPage+1);
  get('#powerPrev').disabled=page<=0;
  get('#powerNext').disabled=page>=maxPage;
  get('#powerSelectAll').checked=false;
  updateSelected();
  get('#powerPlans').querySelectorAll('[data-plan-key]').forEach(check=>check.addEventListener('change',()=>{
    if(check.checked)selection.add(check.dataset.planKey);else selection.delete(check.dataset.planKey);
    updateSelected();
  }));
 }
 function updateSelected(){
  get('#powerSelected').textContent=t('المحدد: ','Selected: ')+selection.size;
  const all=get('#powerPlans').querySelectorAll('[data-plan-key]');
  get('#powerSelectAll').checked=all.length>0&&Array.from(all).every(el=>el.checked);
  get('#powerEnable').disabled=busy||!selection.size;
  get('#powerDisable').disabled=busy||!selection.size;
 }
 get('#powerSelectAll').addEventListener('change',event=>{
  selection.clear();get('#powerPlans').querySelectorAll('[data-plan-key]').forEach(check=>{check.checked=event.target.checked;if(check.checked)selection.add(check.dataset.planKey);});
  updateSelected();
 });
 get('#powerSearch').addEventListener('input',event=>{query=event.target.value.slice(0,140);page=0;draw();});
 get('#powerFilter').addEventListener('change',event=>{status=event.target.value;page=0;draw();});
 get('#powerPrev').onclick=()=>{if(page>0){page--;draw();}};
 get('#powerNext').onclick=()=>{if(page<current().maxPage){page++;draw();}};
 box.querySelectorAll('[data-power-tab]').forEach(button=>button.addEventListener('click',()=>api.openTab(button.dataset.powerTab)));
 async function bulk(available){
  if(busy||selection.size<1||selection.size>25)return;
  const selected=allPlans.filter(p=>selection.has(String(p.product_id)+'::'+String(p.plan_index))&&!!p.available!==available);
  if(!selected.length){message(t('الباقات المحددة في الحالة المطلوبة بالفعل.','Selected plans already have the requested status.'));return;}
  const description=available?t('تفعيل','Enable'):t('إيقاف','Disable');
  if(!confirm(t('تأكيد '+description+' '+selected.length+' باقة؟ سيظهر التغيير على المتجر بعد التحديث.','Confirm '+description.toLowerCase()+' for '+selected.length+' plans? This changes their availability on the storefront.')))return;
  busy=true;updateSelected();let done=0,fail=null;
  for(const p of selected){
   try{
    await C.unwrap(C.client.rpc('master_store_admin_plan',{product_key:p.product_id,plan_number:p.plan_index,price:p.price_piasters,is_available:available,quantity_limit:p.max_quantity,expected_version:p.updated_at}));
    done++;
   }catch(err){fail=err;break;}
  }
  busy=false;
  try{await api.refresh();}catch(err){fail=fail||err;}
  if(fail)api.notify(t('تم تعديل '+done+' باقة، وتوقفت العملية عند أول خطأ: ','Updated '+done+' plan(s), stopped on error: ')+error(fail),true);
  else api.notify(t('تم تحديث توفر '+done+' باقة بنجاح.','Availability updated for '+done+' plans.'));
 }
 get('#powerEnable').onclick=()=>bulk(true);
 get('#powerDisable').onclick=()=>bulk(false);
 function rowsFor(type){
  if(type==='plans')return {
   header:['Product ID','Product','Plan index','Plan','Duration','Price (EGP)','Availability','Max quantity','Last updated'],
   rows:allPlans.map(p=>[p.product_id,p.product_name,p.plan_index,p.plan_name,p.duration,Number(p.price_piasters||0)/100,p.available?'available':'unavailable',p.max_quantity,p.updated_at])};
  if(type==='customers')return {
   header:['User ID','Name','Email','Phone','Wallet balance (EGP)'],
   rows:customers.map(p=>[p.user_id,p.name,p.email,p.phone,Number(p.balance_piasters||0)/100])};
  if(type==='topups')return {
   header:['Request ID','User ID','Amount (EGP)','Payment','Reference','Status','Created at'],
   rows:topups.map(p=>[p.id,p.user_id,Number(p.amount_piasters||0)/100,p.payment,p.reference,p.status,p.created_at])};
  if(type==='audit')return {
   header:['Action','Admin ID','Target','Created at','Before','After'],
   rows:audit.map(p=>[p.action,p.admin_id,p.target,p.created_at,JSON.stringify(p.before_data||null),JSON.stringify(p.after_data||null)])};
  throw Error('Unsupported export');
 }
 async function exportOrders(){
  // Admin-only read RPC with the existing 50-record pagination. Hard cap protects browser memory.
  const limit=2000,rows=[];let total=0;
  for(let pageNumber=0;pageNumber<limit/50;pageNumber++){
   const response=await C.unwrap(C.client.rpc('master_store_order_inbox',{search_text:'',status_filter:'all',outcome_filter:'all',page_number:pageNumber}));
   const chunk=Array.isArray(response?.orders)?response.orders:[];
   total=Number(response?.total||0);rows.push(...chunk);
   if(!chunk.length||chunk.length<50||rows.length>=total)break;
  }
  const values=rows.slice(0,limit).map(p=>[p.id,p.cart_id,p.product,p.plan,p.quantity,Number(p.amount_piasters||0)/100,Number(p.discount_piasters||0)/100,p.status,p.sales_outcome,p.payment,p.customer?.name,p.customer?.email,p.customer?.phone,p.created_at,p.sales_note]);
  download('orders',['Order ID','Cart ID','Product','Plan','Quantity','Amount (EGP)','Discount (EGP)','Status','Sales outcome','Payment','Customer','Email','Phone','Created at','Internal follow-up note'],values);
  return {exported:values.length,total};
 }
 box.querySelectorAll('[data-power-export]').forEach(button=>button.addEventListener('click',async()=>{
  if(busy)return;
  const type=button.dataset.powerExport;
  if(type==='customers'&&!confirm(t('تصدير أسماء وبيانات العملاء وأرصدة المحافظ إلى جهازك؟ احتفظ بالملف بأمان.','Export customer details and wallet balances to your device? Keep the file secure.')))return;
  busy=true;button.disabled=true;const label=button.textContent;button.textContent=t('جارٍ تجهيز التقرير…','Preparing report…');
  try{
   if(type==='orders'){
    const {exported,total}=await exportOrders();
    message(t('تم تصدير ','Exported ')+exported+t(' طلب. ',' orders. ')+(total>exported?t('باقي الطلبات تتجاوز حد التقرير (2000).','More orders exist beyond the 2000-row limit.'):''));
   }else{
    const report=rowsFor(type);
    download(type,report.header,report.rows);
    message(t('تم تجهيز تقرير ','Prepared ')+type+' · '+report.rows.length+t(' سجل.',' records.'));
   }
  }catch(err){message(error(err),true);}
  finally{busy=false;if(button.isConnected){button.disabled=false;button.textContent=label;}updateSelected();}
 }));
 draw();
}
window.MasterAdvancedAdmin={render,csvCell:cell,csvRows:asCsv};
})();
