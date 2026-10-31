(function(){
'use strict';
const pick=(ar,en)=>window.MasterLocale?.getState().language==='en'?en:ar;
function details(product,plan){
 if(!plan)return [pick('تفاصيل التفعيل والضمان: يُرجى تأكيدها مع الدعم.','Confirm activation and warranty details with support.')];
 const fields=[['المدة','Duration',plan.duration],['نوع الاشتراك','Plan type',plan.planType],['نوع الحساب','Account',plan.account],['التفعيل','Activation',plan.activation],['الضمان','Warranty',plan.warranty],['الرصيد','Credits',plan.credits],['وقت التجهيز','Preparation time',plan.preparationTime||plan.preparation]];
 const rows=fields.filter(x=>x[2]).map(([ar,en,value])=>pick(ar,en)+': '+value);
 let gifts=plan.gifts||[];
 if(!gifts.length&&product?.status==='available'&&plan.available!==false&&Number(plan.price)>=2000)gifts=[{name:'Google AI Pro',duration:'١٨ شهر',durationEn:'18 months'},{name:'Canva Pro',duration:'٣ سنين',durationEn:'3 years'}];
 rows.push(pick('الهدايا','Gifts')+': '+(gifts.length?gifts.map(g=>g.name+' — '+pick(g.duration,g.durationEn||g.duration)).join(' + '):pick('لا توجد هدايا مذكورة لهذه الباقة.','No gifts listed for this plan.')));
 (plan.notes||[]).forEach(note=>rows.push('• '+note));
 return rows;
}
function buildMessage(q,contact,method,id,saved){
 const money=n=>window.MasterStore.formatCurrency(n/100,'EGP');
 const lines=['MASTER STORE',pick('رقم الطلب: ','Order reference: ')+id,pick('حالة الطلب: ','Order status: ')+pick(saved?'محفوظ في حسابي — بانتظار التنفيذ':'طلب ضيف — بانتظار تأكيد الدعم',saved?'Saved in my account — awaiting fulfillment':'Guest request — awaiting support confirmation'),''];
 q.items.forEach((x,i)=>{
 const product=window.MasterCatalog?.getProduct(x.product_id),plan=product?.plans?.[x.plan_index];
 lines.push((i+1)+'. '+x.product,pick('الباقة: ','Plan: ')+x.plan,pick('الكمية: ','Quantity: ')+x.quantity,pick('سعر الوحدة: ','Unit price: ')+money(x.unit_piasters),...details(product,plan),pick('إجمالي البند حسب ملخص الطلب: ','Line total from order summary: ')+money(x.amount_piasters),'');
 });
 lines.push(pick('قبل خصم الكمية: ','Subtotal before quantity discount: ')+money(q.subtotal_piasters),pick('خصم الكمية: ','Quantity discount: ')+q.discount_percent+'% — '+money(q.discount_piasters),pick('الإجمالي النهائي: ','Final total: ')+money(q.amount_piasters),pick('طريقة الدفع: ','Payment method: ')+(method==='wallet'?pick('المحفظة','Wallet'):method),pick('حالة الدفع: ','Payment status: ')+(method==='wallet'&&saved?pick('تم الخصم من المحفظة.','Deducted from wallet.'):pick('بانتظار تأكيد التحويل مع الدعم؛ هذه الرسالة ليست إثبات دفع.','Awaiting transfer confirmation by support; this message is not proof of payment.')),'',pick('بيانات العميل','Customer details'),pick('الاسم: ','Name: ')+contact.name,pick('واتساب: ','WhatsApp: ')+contact.phone,pick('البريد: ','Email: ')+contact.email,'',pick('يرجى تأكيد التوفر، وبيانات الدفع، وموعد التجهيز قبل التنفيذ، وفق ضمان كل باقة.','Please confirm availability, payment details and preparation time before fulfillment, under each plan warranty.'));
 return lines.join('\n');
}
window.MasterOrderDetails={planLines:details,buildMessage};
})();