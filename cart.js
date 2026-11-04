(function(){
'use strict';
const S=window.MasterStore,C=window.MasterCloud,E=S?.escapeHtml;
const t=(ar,en)=>window.MasterLocale?.getState().language==='en'?en:ar;
function read(){try{return JSON.parse(localStorage.getItem('master-cart-v1')||'[]').filter(x=>typeof x.product_id==='string'&&Number.isInteger(x.plan_index)&&Number.isInteger(x.quantity)&&x.quantity>0).slice(0,20);}catch{return [];}}
function write(items){localStorage.setItem('master-cart-v1',JSON.stringify(items));badge();}
function badge(){document.querySelectorAll('[data-cart-count]').forEach(x=>x.textContent=read().reduce((n,x)=>n+x.quantity,0));}
function add(product,index){const items=read(),line=items.find(x=>x.product_id===product&&x.plan_index===index);const max=window.MasterCatalog?.getProduct(product)?.plans?.[index]?.max_quantity||(product==='gamma-account'?1:5);if(line){if(line.quantity>=max)throw Error(t('وصلت للحد الأقصى للباقة.','Plan quantity limit reached.'));line.quantity++;}else{if(items.length>=20)throw Error(t('السلة ممتلئة.','Cart is full.'));items.push({product_id:product,plan_index:index,quantity:1});}write(items);}
window.MasterCart={read,write,add};badge();
const root=document.getElementById('cartContent');if(!root)return;
let requestId=crypto.randomUUID(),receiptToken=crypto.randomUUID(),quote=null,user=null,balance=0,busy=false,version=0,checkoutDraft=null;
const money=n=>S.formatCurrency(n/100,'EGP');
function cartLogo(id,name){const product=window.MasterCatalog?.getProduct(id);const local=product?.logo?'logos/'+encodeURIComponent(product.logo)+'.svg':'master-store-logo.png';const src=id==='gemini-coursera-bundle'?'logos/coursera.svg':product?.logoUrl||local;return '<img class="cart-product-logo" src="'+E(src)+'" data-logo-fallback="'+E(local)+'" alt="'+E(name)+'" width="56" height="56" decoding="async">';}
function cartUnitPrice(line){const plan=window.MasterCatalog?.getProduct(line.product_id)?.plans?.[line.plan_index];return plan?S.priceMarkup({...plan,price:line.unit_piasters/100,available:true},{currency:'EGP',showSaving:false}):'<strong>'+money(line.unit_piasters)+'</strong>';}
async function render(){
 const previousForm=root.querySelector('#cartCheckout');if(previousForm)checkoutDraft={name:previousForm.elements.name.value,phone:previousForm.elements.phone.value,email:previousForm.elements.email.value,payment:previousForm.querySelector('[name=payment]:checked')?.value};
 const current=++version,items=read();quote=null;
 if(!items.length){root.innerHTML='<section class="account-panel"><h2>'+t('سلتك لسه فاضية','Your cart is empty')+'</h2><a class="primary" href="index.html#products">'+t('اختار اشتراكاتك','Browse subscriptions')+'</a></section>';return;}
 root.innerHTML='<p role="status">'+t('بنراجع الأسعار والخصم…','Checking prices and discount…')+'</p>';
 try{
 await window.MasterCatalogReady;
 const [q,u]=await Promise.all([C.unwrap(C.client.rpc('master_store_quote_cart',{items})),C.user()]);if(current!==version)return;quote=q;user=u;balance=0;
 if(u){const w=await C.unwrap(C.client.from('master_store_wallets').select('balance_piasters').eq('user_id',u.id).maybeSingle());if(current!==version)return;balance=w?.balance_piasters||0;}
 const p={...(S.getProfile()||{}),...(checkoutDraft||{})};const savedPayment=checkoutDraft?.payment,validPayment=window.MasterPayments.some(x=>x.name===savedPayment)||(savedPayment==='wallet'&&u&&balance>=q.amount_piasters);const chosenPayment=validPayment?savedPayment:window.MasterPayments[0]?.name;const rules=q.rules||{two:3,three:5,four:7,five:10};
 root.innerHTML='<div class="cart-layout"><section class="account-panel"><h2>'+t('اشتراكاتك','Your subscriptions')+'</h2><p class="cart-section-caption">'+t('راجع الباقات والكمية قبل ما تكمل.','Review plans and quantities before continuing.')+'</p>'+q.items.map(x=>'<article class="cart-line"><div class="cart-product-info">'+cartLogo(x.product_id,x.product)+'<div class="cart-product-copy"><a href="product.html?id='+encodeURIComponent(x.product_id)+'&amp;plan='+x.plan_index+'"><b>'+E(x.product)+'</b></a><p>'+E(window.MasterLocale?.catalogText(x.plan,'planName',x.product_id)||x.plan)+'</p><div class="cart-unit-price">'+cartUnitPrice(x)+'<small class="cart-unit-quantity"> × '+x.quantity+'</small></div></div></div><div class="cart-line-controls"><label>'+t('العدد','Quantity')+' <input class="cart-qty" type="number" inputmode="numeric" min="1" max="'+(x.max_quantity||5)+'" value="'+x.quantity+'" data-product="'+E(x.product_id)+'" data-plan="'+x.plan_index+'"></label><button class="ghost cart-remove" type="button" aria-label="'+E(t('حذف ','Remove ')+x.product)+'" data-product="'+E(x.product_id)+'" data-plan="'+x.plan_index+'">'+t('حذف','Remove')+'</button><strong class="cart-line-total">'+money(x.amount_piasters)+'</strong></div></article>').join('')+'<a href="index.html#products">'+t('＋ ضيف اشتراك تاني','＋ Add another subscription')+'</a></section><section class="account-panel"><h2>'+t('ملخص الطلب','Order summary')+'</h2><p class="cart-section-caption">'+t('الأسعار والخصم من سيرفر المتجر.','Prices and discounts are confirmed by the store server.')+'</p><div class="cart-summary"><p>'+t('قبل الخصم','Subtotal')+' <b>'+money(q.subtotal_piasters)+'</b></p><p class="cart-saving">'+t('خصم الكمية','Quantity discount')+' '+q.discount_percent+'% <b>− '+money(q.discount_piasters)+'</b></p><p class="cart-total">'+t('الإجمالي','Total')+' <b>'+money(q.amount_piasters)+'</b></p></div><p class="cart-discount-rules">'+t('اشتراكين '+rules.two+'٪ · ٣ اشتراكات '+rules.three+'٪ · ٤ اشتراكات '+rules.four+'٪ · ٥ أو أكتر '+rules.five+'٪. من نفس الخدمة أو خدمات مختلفة.','2 subscriptions: '+rules.two+'% · 3: '+rules.three+'% · 4: '+rules.four+'% · 5+: '+rules.five+'%. Same or different services.')+'</p><small>'+t('الدفع في السلة بالجنيه المصري. الخصم بيتحسب على أسعار المتجر.','Cart checkout is in EGP. Discounts apply to store prices.')+'</small><form id="cartCheckout"><label>'+t('الاسم','Name')+'<input name="name" autocomplete="name" required maxlength="80" value="'+E(p.name)+'"></label><label>'+t('رقم واتساب','WhatsApp number')+'<input type="tel" inputmode="tel" name="phone" autocomplete="tel" required minlength="5" maxlength="30" value="'+E(p.phone)+'"></label><label>'+t('الإيميل','Email')+'<input type="email" name="email" autocomplete="email" required maxlength="120" value="'+E(checkoutDraft?p.email:(p.email||u?.email||''))+'"></label><fieldset><legend>'+t('وسيلة الدفع','Payment method')+'</legend><div class="checkout-payment-grid">'+window.MasterPayments.map((x,i)=>'<label class="checkout-payment"><input type="radio" name="payment" value="'+E(x.name)+'" '+(x.name===chosenPayment?'checked':'')+' required><img src="'+x.logo+'" alt="" width="52" height="36"><span>'+E(x.name)+'</span></label>').join('')+(u?'<label class="checkout-payment"><input type="radio" name="payment" value="wallet" '+(chosenPayment==='wallet'?'checked ':'')+(balance<q.amount_piasters?'disabled':'')+'><span>'+t('المحفظة','Wallet')+' — '+money(balance)+'</span></label>':'')+'</div><p class="cart-payment-helper" id="cartPaymentHelp" role="status"></p></fieldset>'+(!u?'<p><a href="account.html">'+t('طلب الضيف بيتسجّل عند الإدارة. سجل الدخول لاستخدام المحفظة وربط الطلب بحسابك.','Guest orders are saved for the store. Sign in to use your wallet and link orders to your account.')+'</a></p>':'')+'<p id="cartError" role="alert" tabindex="-1"></p><button class="primary full cart-submit" type="submit">'+t('تأكيد وإرسال الطلب','Confirm and submit order')+'</button><small>'+t('بيانات التحويل بتتأكد مع الدعم. الدفع بالمحفظة بيخصم الرصيد عند التأكيد.','Confirm transfer details with support. Wallet payment deducts balance on confirmation.')+'</small></form></section></div>';
 root.querySelectorAll('.cart-product-logo').forEach(img=>{img.addEventListener('error',()=>{if(!img.dataset.retried){img.dataset.retried='1';img.src=img.dataset.logoFallback;}else if(!img.dataset.finalFallback){img.dataset.finalFallback='1';img.src='master-store-logo.png';}else img.hidden=true;});});
 const paymentHelp=root.querySelector('#cartPaymentHelp');
 function updatePaymentHelp(){
   if(!paymentHelp)return;
   const wallet=root.querySelector('input[name=payment]:checked')?.value==='wallet';
   paymentHelp.textContent=wallet?t('الدفع بالمحفظة: الرصيد بيتخصم عند نجاح تأكيد الطلب.','Wallet balance is deducted after successful confirmation.'):t('الدعم هيأكد معاك بيانات التحويل بعد تسجيل الطلب.','Support will confirm transfer details after submission.');
 }
 root.querySelectorAll('input[name=payment]').forEach(input=>input.addEventListener('change',updatePaymentHelp));
 updatePaymentHelp();
 root.querySelectorAll('.cart-qty').forEach(input=>input.onchange=()=>{const n=Number(input.value);if(!Number.isInteger(n)||n<1||n>Number(input.max)){input.value=items.find(x=>x.product_id===input.dataset.product&&x.plan_index===+input.dataset.plan)?.quantity||1;return;}write(items.map(x=>x.product_id===input.dataset.product&&x.plan_index===+input.dataset.plan?{...x,quantity:n}:x));requestId=crypto.randomUUID();render();});
 root.querySelectorAll('.cart-remove').forEach(b=>b.onclick=()=>{write(items.filter(x=>!(x.product_id===b.dataset.product&&x.plan_index===+b.dataset.plan)));requestId=crypto.randomUUID();render();});
 root.querySelector('#cartCheckout').onsubmit=checkout;
 }catch(error){if(current!==version)return;root.innerHTML='<section class="account-panel"><p role="alert">'+E(C.errorText(error))+'</p><button id="retryCart" class="primary">'+t('إعادة المحاولة','Retry')+'</button><button id="clearCart" class="ghost">'+t('تفريغ السلة','Clear cart')+'</button></section>';root.querySelector('#retryCart').onclick=render;root.querySelector('#clearCart').onclick=()=>{write([]);render();};}
}
async function checkout(e){
 e.preventDefault();if(busy||!quote)return;
 const form=e.target,b=form.querySelector('button[type=submit]');
 const chosen=form.querySelector('[name=payment]:checked');
 if(!form.reportValidity()||!chosen)return;
 const contact={name:form.elements.name.value.trim(),phone:form.elements.phone.value.trim(),email:form.elements.email.value.trim()};
 const method=chosen.value,items=read(),q=quote,originalLabel=b.textContent;
 busy=true;b.disabled=true;b.textContent=t('جارٍ إرسال الطلب…','Submitting your order…');
 root.querySelectorAll('.cart-qty,.cart-remove').forEach(x=>x.disabled=true);
 form.querySelectorAll('input,select').forEach(x=>x.disabled=true);
try{
 const signature=JSON.stringify({items,contact,method,amount:q.amount_piasters,user:user?.id||null});
 try{const previous=JSON.parse(sessionStorage.getItem('masterStoreCheckoutAttemptV1')||'null');if(previous?.signature===signature){requestId=previous.id;receiptToken=previous.token;}else{requestId=crypto.randomUUID();receiptToken=crypto.randomUUID();sessionStorage.setItem('masterStoreCheckoutAttemptV1',JSON.stringify({signature,id:requestId,token:receiptToken}));}}catch{}
 let orders=[],id=requestId;
 if(user){const result=await C.unwrap(C.client.rpc('master_store_checkout_cart',{request_id:requestId,items,contact,method,quoted_amount:q.amount_piasters}));orders=result.orders;id=result.cart_id;}
 else{const result=await C.unwrap(C.client.rpc('master_store_guest_checkout',{request_id:requestId,receipt_token:receiptToken,items,contact,method,quoted_amount:q.amount_piasters}));orders=result.orders;id=result.cart_id;try{C.saveGuestReceipt(id,receiptToken,orders.map(x=>x.id));orders.forEach(x=>S.saveOrder({...C.asLocalOrder(x),cartId:id,serverSaved:true}));}catch{/* Server receipt is already committed; never report a failed purchase because local storage is full. */}}

 try{sessionStorage.removeItem('masterStoreCheckoutAttemptV1');}catch{}
 try{S.saveProfile(contact);}catch{}checkoutDraft=null;
 const message=window.MasterOrderDetails.buildMessage(q,contact,method,id,!!user);
 try{write([]);}catch{}root.innerHTML='<section class="account-panel cart-success"><h2>'+t('طلبك اتسجّل عند الإدارة','Your order was submitted to the store')+'</h2><p>'+t('الإجمالي بعد الخصم: ','Total after discount: ')+money(q.amount_piasters)+'</p><p class="cart-receipt-number"><b>'+t('رقم الطلب: ','Order reference: ')+'</b><span>'+E(id)+'</span></p><p>'+t(method==='wallet'?'تم خصم الرصيد. تابع حالة التنفيذ من حسابك.':'تابع مع الدعم لتأكيد التحويل والتنفيذ.',method==='wallet'?'Balance deducted. Track fulfillment in your account.':'Contact support to confirm transfer and fulfillment.')+'</p><a class="ghost-btn" href="invoice.html?cart='+encodeURIComponent(id)+'">'+t('عرض الفاتورة / حفظ PDF','View invoice / Save PDF')+'</a> <a class="primary" target="_blank" rel="noopener" href="https://wa.me/201500950624?text='+encodeURIComponent(message)+'">'+t('متابعة الطلب على واتساب','Continue on WhatsApp')+'</a> <a class="ghost" href="track.html">'+t('متابعة طلباتي','Track my orders')+'</a></section>';
}catch(error){
 const errNode=document.getElementById('cartError');
 if(errNode){errNode.textContent=C.errorText(error);errNode.focus({preventScroll:true});errNode.scrollIntoView({block:'center',behavior:'auto'});}
 b.disabled=false;b.textContent=originalLabel;
 root.querySelectorAll('.cart-qty,.cart-remove').forEach(x=>x.disabled=false);
 form.querySelectorAll('input,select').forEach(x=>x.disabled=false);
 const wallet=form.querySelector('input[value=wallet]');if(wallet)wallet.disabled=balance<q.amount_piasters;
}
finally{busy=false;}
}
Promise.resolve(window.MasterCatalogReady).then(render);document.addEventListener('masterstore:localechange',()=>{if(!busy)render();});document.addEventListener('masterstore:assistant-cart-add',()=>{if(!busy)render();});
})();
