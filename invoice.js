(()=>{
'use strict';
const S=window.MasterStore,C=window.MasterCloud,L=window.MasterLocale;
const root=document.getElementById('invoiceRoot'),print=document.getElementById('printInvoice');
const params=new URLSearchParams(location.search),crm=params.has('crm'),id=params.get('crm')||params.get('id')||params.get('cart')||'',cart=params.has('cart'),device=params.get('source')==='device';
const E=S.escapeHtml,en=()=>L?.getState().language==='en',t=(ar,english)=>en()?english:ar;
let records=[],local=false,loading=false,generation=0;
function line(o,fromDevice){
 const amount=fromDevice?Math.round(Number(o.displayTotal??o.total)*100):Number(o.amount_piasters);
 const quantity=Number(o.quantity||1),discount=fromDevice?(o.displayCurrency&&o.displayCurrency!=='EGP'?0:Math.round(Number(o.discount||0)*100)):Number(o.discount_piasters||0);
 const currency=fromDevice?(o.displayCurrency||'EGP'):'EGP';
 if(!Number.isSafeInteger(amount)||amount<0||!Number.isSafeInteger(discount)||discount<0||!Number.isSafeInteger(quantity)||quantity<1||quantity>(crm?100:50)||!/^[A-Z]{3}$/.test(currency))throw Error('INVALID_INVOICE');
 return {id:o.id,product:o.product,plan:o.plan,duration:o.duration,quantity,amount,discount,subtotal:amount+discount,currency,lifecycle:o.lifecycle,status:fromDevice?'unverified':o.status,customer:o.customer||{},payment:o.payment,date:o.created_at||o.createdAt};
}
function paymentState(rows,fromDevice){
 if(fromDevice)return ['device',t('سجل جهاز — الدفع غير مؤكد','Device record — payment unverified')];
 if(rows.every(x=>x.status==='refunded'))return ['cancelled',t('تم تسجيل استرداد المبلغ','Refund recorded')];
 if(rows.every(x=>x.status==='cancelled'))return ['cancelled',t('ملغاة — راجع الدعم بشأن الاسترداد','Cancelled — contact support about refunds')];
 if(rows.some(x=>x.status==='cancelled'))return ['mixed',t('إلغاء جزئي — راجع تفاصيل الطلب','Partially cancelled — review order details')];
 if(rows.every(x=>['processing','completed'].includes(x.status)))return ['paid',t('تم تأكيد الدفع','Payment confirmed')];
 return ['pending',t('بانتظار تأكيد الدفع','Awaiting payment confirmation')];
}
function render(){
 const rows=records.map(o=>line(o,local));if(!rows.length)throw Error('NOT_FOUND');
 if(rows.some(x=>x.currency!==rows[0].currency))throw Error('INVALID_INVOICE');
 const state=paymentState(rows,local),first=rows[0],money=n=>S.formatCurrency(n/100,first.currency);
 const sum=key=>rows.reduce((a,x)=>a+x[key],0),date=new Date(first.date),when=Number.isNaN(date.getTime())?'—':crm?date.toLocaleDateString(en()?'en-GB':'ar-EG'):date.toLocaleString(en()?'en-GB':'ar-EG');
 const number='MS-'+(crm?'M-':cart?'C-':'O-')+id.toUpperCase();
 const statuses={pending_payment:t('بانتظار الدفع','Awaiting payment'),processing:t('جاري التنفيذ','Processing'),completed:t('تم التنفيذ','Completed'),cancelled:t('ملغى','Cancelled'),refunded:t('تم تسجيل الاسترداد','Refund recorded'),unverified:t('غير مؤكد','Unverified')};
 document.title=t('فاتورة طلب','Order invoice')+' '+number+' | MASTER STORE';
 root.innerHTML='<article class="invoice-sheet"><header class="invoice-header"><div class="invoice-brand"><img src="master-store-logo.svg?v=20261025-brand2" alt="MASTER STORE"><p>'+t('اشتراكات وخدمات رقمية','Digital subscriptions & services')+'</p></div><div class="invoice-heading"><h1>'+t(local?'ملخص طلب':'فاتورة طلب',local?'Order summary':'Order invoice')+'</h1><span class="invoice-number" dir="ltr">'+E(number)+'</span><span class="invoice-status '+state[0]+'">'+E(state[1])+'</span></div></header><section class="invoice-info"><div><h2>'+t('بيانات العميل','Customer')+'</h2><p><strong>'+E(first.customer.name||'—')+'</strong></p><p>'+E(first.customer.email||'—')+'</p><p>'+E(first.customer.phone||'—')+'</p></div><div><h2>'+t('تفاصيل الفاتورة','Invoice details')+'</h2><p>'+t('التاريخ: ','Date: ')+E(when)+'</p><p>'+t('رقم المرجع: ','Reference: ')+'<span class="invoice-reference">'+E(crm?(records[0].reference||id):id)+'</span></p><p>'+t('وسيلة الدفع: ','Payment method: ')+E(first.payment==='wallet'?t('رصيد المحفظة','Wallet balance'):first.payment||'—')+'</p><p>'+t('العملة: ','Currency: ')+E(first.currency)+'</p></div></section><div class="invoice-table-wrap"><table><thead><tr><th>'+t('الخدمة والباقة','Service & plan')+'</th><th>'+t('الكمية','Qty')+'</th><th class="amount">'+t('قبل الخصم','Subtotal')+'</th><th class="amount">'+t('الخصم','Discount')+'</th><th class="amount">'+t('الإجمالي','Total')+'</th></tr></thead><tbody>'+rows.map(x=>'<tr><td class="invoice-item"><strong>'+E(x.product)+'</strong><small>'+E(x.plan)+'</small><small>'+E(x.duration)+'</small><small>'+E(crm?({pending:t('بانتظار التفعيل','Awaiting activation'),active:t('نشط','Active'),paused:t('متوقف مؤقتًا','Paused'),cancelled:t('ملغي','Cancelled'),finished:t('منتهي / مغلق','Finished / closed')})[x.lifecycle]||t('راجع الإدارة','Check with administration'):statuses[x.status]||t('راجع الدعم','Contact support'))+'</small></td><td data-label="'+t('الكمية','Qty')+'">'+x.quantity+'</td><td class="amount" data-label="'+t('قبل الخصم','Subtotal')+'">'+E(money(x.subtotal))+'</td><td class="amount" data-label="'+t('الخصم','Discount')+'">'+E(money(x.discount))+'</td><td class="amount" data-label="'+t('الإجمالي','Total')+'"><strong>'+E(money(x.amount))+'</strong></td></tr>').join('')+'</tbody></table></div><section class="invoice-totals"><div><span>'+t('المجموع قبل الخصم','Subtotal')+'</span><b>'+E(money(sum('subtotal')))+'</b></div><div><span>'+t('إجمالي الخصومات','Total discounts')+'</span><b>− '+E(money(sum('discount')))+'</b></div><div class="invoice-total"><span>'+t('إجمالي الطلب','Order total')+'</span><b>'+E(money(sum('amount')))+'</b></div></section>'+(local||state[0]!=='paid'?'<p class="invoice-notice">'+t(local?'هذا ملخص محفوظ على هذا الجهاز، وليس إثباتًا للدفع أو التنفيذ.':'إصدار الفاتورة لا يعني وصول التحويل. حالة الدفع موضحة أعلاه؛ تواصل مع الدعم لتأكيد الدفع أو الاسترداد.',local?'This summary is saved on this device and is not proof of payment or fulfillment.':'Issuing this invoice does not confirm receipt of a transfer. See the payment status above; contact support about payment or refunds.')+'</p>':'')+'<footer class="invoice-footer"><p>'+t('الأسعار والخصومات حسب بيانات الطلب وقت الشراء. الفاتورة لا تعرض بيانات الدخول أو كلمات المرور.','Prices and discounts use the saved purchase record. Login credentials and passwords are not included.')+'</p><p>'+t('فاتورة طلب من المتجر؛ ليست فاتورة ضريبية.','Store order invoice; not a tax invoice.')+'</p><p>MASTER STORE · <a href="https://wa.me/201500950624" rel="noreferrer">'+t('دعم واتساب','WhatsApp support')+' · +20 150 095 0624</a> · <a href="warranty.html">'+t('سياسة الضمان والاستبدال','Warranty & returns')+'</a></p></footer></article>';
 print.disabled=false;
}
function chrome(){
 document.documentElement.lang=en()?'en':'ar';document.documentElement.dir=en()?'ltr':'rtl';
 document.getElementById('backLink').textContent=crm?t('← إدارة العملاء','← Customer management'):t('← طلباتي','← My orders');document.getElementById('backLink').href=crm?'management.html':'track.html';
 document.getElementById('languageButton').textContent=en()?'العربية':'English';
 document.getElementById('refreshInvoice').textContent=t('تحديث الحالة','Refresh status');print.textContent=t('طباعة / حفظ PDF','Print / Save PDF');
}
function failure(message){root.innerHTML='<section class="invoice-message"><h1>'+t('تعذر عرض الفاتورة','Invoice unavailable')+'</h1><p>'+E(message)+'</p><a href="account.html">'+t('تسجيل الدخول إلى حسابك','Sign in to your account')+'</a> · <a href="track.html">'+t('تتبع الطلبات','Track orders')+'</a></section>';}
async function load(){
 const version=++generation;loading=true;records=[];print.disabled=true;root.setAttribute('aria-busy','true');root.innerHTML='<p class="invoice-message">'+t('جاري تحميل الفاتورة…','Loading invoice…')+'</p>';chrome();
 try{
  if(!id||id.length>80)throw Error('NOT_FOUND');
  if(device&&crm)throw Error('NOT_FOUND');
  if(device){records=S.getOrders().filter(o=>cart?o.cartId===id:o.id===id);local=true;}
  else{
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw Error('NOT_FOUND');
   if(!C?.ready)throw Error('CONNECTION');
   const user=await C.user();if(version!==generation)return;if(!user)throw Error('SIGN_IN');
   // Existing RLS restricts this read to the order owner or a store administrator.
   let rows;if(crm){const source=await C.unwrap(C.client.from('master_crm_subscriptions').select('*,contact:master_crm_contacts(name,email,phone)').eq('id',id).limit(1));rows=source.map(o=>({...o,customer:o.contact,created_at:o.ordered_on+'T12:00:00Z',payment:t('تسجيل إداري لطلب مباشر','Direct order recorded by administration'),status:o.payment_status==='paid'?'completed':o.payment_status==='refunded'?'refunded':'pending_payment'}));}else rows=await C.unwrap(C.client.from('master_store_orders').select('id,cart_id,created_at,product,plan,duration,quantity,amount_piasters,subtotal_piasters,discount_piasters,customer,payment,status').eq(cart?'cart_id':'id',id).order('created_at',{ascending:true}).limit(50));
   if(version!==generation)return;records=rows;local=false;
  }
  render();
 }catch(error){if(version!==generation)return;records=[];failure(error.message==='SIGN_IN'?t('سجّل الدخول بالحساب صاحب الطلب لفتح الفاتورة.','Sign in with the account that placed this order.'):error.message==='NOT_FOUND'?t('الفاتورة غير متاحة هنا. راجع رقم الطلب وحسابك، أو افتح ملخص الضيف من نفس الجهاز الذي طلبت منه.','Invoice unavailable here. Check the order ID and account, or open a guest summary on the original device.'):t('تعذر تحميل بيانات الفاتورة. جرّب تحديث الحالة.','Could not load invoice data. Try refreshing.'));}
 finally{if(version===generation){loading=false;root.setAttribute('aria-busy','false');}}
}
print.onclick=()=>{if(!print.disabled&&records.length)window.print();};
document.getElementById('refreshInvoice').onclick=()=>{if(!loading)load();};
document.getElementById('languageButton').onclick=()=>L?.setLanguage?.(en()?'ar':'en');
document.addEventListener('masterstore:localechange',()=>{chrome();if(records.length)render();else if(!loading)load();});
C?.client?.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'&&!device){generation++;records=[];print.disabled=true;loading=false;root.setAttribute('aria-busy','false');failure(t('سجّل دخولك لعرض الفاتورة.','Sign in to view the invoice.'));}});
window.addEventListener('pageshow',event=>{if(event.persisted)load();});
load();
})();
