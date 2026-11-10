(function(){
'use strict';
const C=window.MasterCloud,root=document.getElementById('deliveryContent'),msg=document.getElementById('deliveryMessage');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rpc=(action,id=null,token=null,details={})=>C.unwrap(C.client.rpc('master_delivery',{action,delivery_id:id,access_token:token,details}));
const errors={DELIVERY_UNAVAILABLE:'الرابط غير متاح أو انتهت صلاحيته. تواصل مع الدعم.',DELIVERY_CLAIMED:'تم استلام هذا الصندوق مسبقًا. ادخل بالحساب الذي استلمت به أو افتحه من نفس متصفح الاستلام.',RECIPIENT_REQUIRED:'اكتب الاسم ورقم واتساب صحيحًا مع رمز الدولة.',AUTH_REQUIRED:'سجّل دخولك لعرض طلبات حسابك.',INVALID_DELIVERY:'تعذر التحقق من بيانات الاستلام.',storage:'المتصفح يمنع حفظ مفتاح استرجاع التسليم. اسمح بتخزين بيانات الموقع أو جرّب متصفحًا آخر قبل الاستلام.'};
function message(error){msg.className='error';msg.textContent=Object.entries(errors).find(([key])=>String(error?.message||error).includes(key))?.[1]||'تعذر إتمام العملية. جرّب مرة أخرى أو تواصل مع الدعم.';}
function random(){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');}
function showDelivery(data){
 root.classList.add('gift-open');
 root.innerHTML='<section class="panel"><span class="badge">تم الاستلام ✓</span><h1>'+esc(data.product)+'</h1><p>'+esc(data.plan)+'</p><h2>بيانات طلبك</h2><pre class="secret" id="deliveryPayload"></pre><button type="button" id="copyDelivery" class="secondary">نسخ بيانات الاستلام</button><p id="copyStatus" role="status"></p><h2>طريقة الاستخدام والتعليمات</h2><div class="instruction" id="deliveryInstructions"></div><p class="muted">احتفظ ببياناتك في مكان خاص. لا تشارك رابط الاستلام أو بيانات الدخول مع الآخرين.</p><a href="https://wa.me/201500950624" target="_blank" rel="noopener noreferrer">مساعدة من الدعم ←</a></section>';
 document.getElementById('deliveryPayload').textContent=data.payload;
 document.getElementById('deliveryInstructions').textContent=data.instructions||'استخدم بيانات الحساب أعلاه. تواصل مع الدعم إذا احتجت مساعدة.';
 document.getElementById('copyDelivery').onclick=async()=>{try{await navigator.clipboard.writeText(data.payload);document.getElementById('copyStatus').textContent='تم النسخ.';}catch{document.getElementById('copyStatus').textContent='النسخ غير متاح؛ حدّد البيانات وانسخها يدويًا.';}};
}
async function mine(){
 const user=await C.user();if(!user){root.innerHTML='<section class="panel"><h1>طلباتك المستلمة</h1><p>افتح رابط التسليم المرسل لك على واتساب، أو سجّل الدخول لعرض الطلبات المرتبطة بحسابك.</p><a href="account.html">تسجيل الدخول ←</a></section>';return;}
 const items=await rpc('mine');root.innerHTML='<section class="panel"><h1>طلباتك المستلمة</h1><p>التسليمات المرتبطة بحسابك.</p><div class="records">'+(items.length?items.map(x=>'<article><h2>'+esc(x.product)+'</h2><p>'+esc(x.plan)+'</p><small>'+esc(new Date(x.claimed_at).toLocaleString('ar-EG'))+'</small><button type="button" data-read="'+esc(x.id)+'">عرض بيانات الطلب</button></article>').join(''):'<p>لا توجد طلبات مستلمة مرتبطة بحسابك حتى الآن.</p>')+'</div></section>';
 root.querySelectorAll('[data-read]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{showDelivery(await rpc('read',button.dataset.read));}catch(error){message(error);button.disabled=false;}});
}
async function start(){
 if(!C?.ready)throw new Error('offline');
 const params=new URLSearchParams(location.hash.slice(1)),id=params.get('id'),token=params.get('key');
 if(!id&&!token){await mine();return;}
 if(!/^[a-f0-9-]{36}$/i.test(id||'')||!/^[a-f0-9]{64}$/.test(token||''))throw new Error('DELIVERY_UNAVAILABLE');
 const preview=await rpc('preview',id,token),user=await C.user();
 let savedKey;try{savedKey=localStorage.getItem('masterDeliveryClaim:'+id);}catch{}
 if(preview.claimed&&savedKey){try{showDelivery(await rpc('read',id,token,{claim_key:savedKey}));return;}catch(error){message(error);}}
 if(preview.claimed&&user){try{showDelivery(await rpc('read',id));return;}catch{}}
 if(preview.claimed)throw new Error('DELIVERY_CLAIMED');
 let name=user?.user_metadata?.name||'';let phone='';
 if(user){try{const {data}=await C.client.from('master_store_profiles').select('name,phone').eq('user_id',user.id).maybeSingle();name=data?.name||name;phone=data?.phone||'';}catch{}}
 root.innerHTML='<section class="panel delivery-hero"><span class="kicker">طلبك جاهز من MASTER STORE</span><h1>'+esc(preview.product)+'</h1><p>'+esc(preview.plan)+'</p><div class="gift-scene"><div class="gift-box" aria-hidden="true"><span>∞</span></div></div><h2>افتح صندوق طلبك 🎁</h2><p>اكتب اسمك للاستلام'+(preview.needs_phone?' ورقم واتساب للتواصل':'')+'. '+(user?'سيتسجل الطلب في حسابك.':'يمكنك الاستلام كضيف بدون إنشاء حساب.')+'</p><form id="claimForm"><label>الاسم<input name="recipient_name" required maxlength="120" autocomplete="name"></label>'+(preview.needs_phone?'<label>رقم واتساب مع رمز الدولة<input name="recipient_phone" required type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="201XXXXXXXXX" dir="ltr"></label>':'')+'<button class="primary" type="submit">افتح الصندوق واستلم طلبك</button></form><p class="muted">الرابط خاص بصاحبه. لا تعيد إرساله. '+(!user?'احفظ بياناتك بعد الاستلام؛ الرجوع كضيف يتطلب نفس المتصفح.':'')+'</p></section>';
 const form=document.getElementById('claimForm');form.elements.recipient_name.value=name;if(preview.needs_phone)form.elements.recipient_phone.value=phone;
 form.onsubmit=async event=>{event.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button');button.disabled=true;msg.textContent='';try{
  // Persist only a recovery key, never the delivered credentials. Do this before claiming.
  let key=savedKey||random();localStorage.setItem('masterDeliveryClaim:'+id,key);if(localStorage.getItem('masterDeliveryClaim:'+id)!==key)throw new Error('storage');savedKey=key;
  const result=await rpc('claim',id,token,{name:form.elements.recipient_name.value.trim(),phone:form.elements.recipient_phone?.value||'',claim_key:key});
  root.classList.add('gift-open');button.textContent='تم فتح الصندوق ✓';setTimeout(()=>showDelivery(result),matchMedia('(prefers-reduced-motion: reduce)').matches?0:650);
 }catch(error){message(error);button.disabled=false;}};
}
start().catch(message).finally(()=>root.setAttribute('aria-busy','false'));
C?.client?.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){root.replaceChildren();msg.textContent='تم تسجيل الخروج. حدّث الصفحة للمتابعة.';}});
})();
