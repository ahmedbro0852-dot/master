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
 const paid=method==='wallet'&&saved;
 const lines=['*MASTER STORE — '+pick('طلب جديد','New order')+'*',pick('رقم الطلب: ','Order reference: ')+id,
  '*'+pick('الإجمالي: ','Total: ')+money(q.amount_piasters)+'*',
  pick('طريقة الدفع: ','Payment method: ')+(method==='wallet'?pick('المحفظة','Wallet'):method),
  pick('حالة الدفع: ','Payment status: ')+(paid?pick('مدفوع بالمحفظة — بانتظار التنفيذ','Paid by wallet — awaiting fulfillment'):pick('لم يُؤكد الدفع بعد','Payment not yet confirmed')),''];
 q.items.forEach((x,i)=>{
  const product=window.MasterCatalog?.getProduct(x.product_id),plan=product?.plans?.[x.plan_index];
  lines.push('*'+(q.items.length>1?(i+1)+'. ':'')+x.product+'*',pick('الباقة: ','Plan: ')+x.plan);
  lines.push(pick('الكمية: ','Quantity: ')+x.quantity+' × '+money(x.unit_piasters)+(x.quantity>1?' = '+money(x.amount_piasters):''));
  if(plan){
   const term=[plan.duration,pick('الضمان: ','Warranty: ')+(plan.warranty||pick('يُؤكد مع الدعم','Confirm with support'))].filter(Boolean);
   lines.push(term.join(' | '));
   const pending=value=>/ي[ُؤو]*كد.*قبل الدفع|ت[ُؤو]*كد.*قبل الدفع|confirm.*before payment/i.test(value||'');
   if(plan.account&&!pending(plan.account))lines.push(pick('الحساب: ','Account: ')+plan.account);
   if(plan.activation&&!pending(plan.activation))lines.push(pick('التفعيل: ','Activation: ')+plan.activation);
   if(plan.credits)lines.push(pick('الرصيد: ','Credits: ')+plan.credits);
   if(plan.preparationTime||plan.preparation)lines.push(pick('التجهيز: ','Preparation: ')+(plan.preparationTime||plan.preparation));
   const giftLines=details(product,plan).filter(line=>line.startsWith(pick('الهدايا: ','Gifts: ')));
   if((plan.gifts||[]).length||(product?.status==='available'&&plan.available!==false&&Number(plan.price)>=2000))lines.push(...giftLines);
   [...new Set(plan.notes||[])].forEach(note=>lines.push('• '+note));
  }else lines.push(pick('التفعيل والضمان: يُؤكدان مع الدعم.','Activation and warranty: confirm with support.'));
  lines.push('');
 });
 if(Number(q.discount_piasters)>0)lines.push(pick('قبل الخصم: ','Subtotal: ')+money(q.subtotal_piasters),pick('خصم الكمية: ','Quantity discount: ')+q.discount_percent+'% — '+money(q.discount_piasters));
 if(Number(q.discount_piasters)>0)lines.push(pick('الإجمالي بعد الخصم: ','Total after discount: ')+money(q.amount_piasters));
 lines.push('', '*'+pick('بيانات العميل','Customer details')+'*');
 if(contact.name)lines.push(pick('الاسم: ','Name: ')+contact.name);
 if(contact.phone)lines.push(pick('واتساب: ','WhatsApp: ')+contact.phone);
 if(contact.email)lines.push(pick('البريد: ','Email: ')+contact.email);
 lines.push('',pick('يرجى تأكيد التوفر وموعد التجهيز'+(paid?'':' وبيانات الدفع وطريقة التفعيل')+' قبل التنفيذ.','Please confirm availability and preparation time'+(paid?'':' plus payment and activation details')+' before fulfillment.'));
 if(!paid)lines.push(pick('تنبيه: الرسالة طلب شراء وليست إثبات دفع.','Note: this is a purchase request, not proof of payment.'));
 return lines.join('\n');
}
window.MasterOrderDetails={planLines:details,buildMessage};
})();