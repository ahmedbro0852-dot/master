(function(){'use strict';
const C=window.MasterCloud,root=document.getElementById('gammaDelivery'),msg=document.getElementById('gammaMessage');
const rpc=(action,code,claim_key,details={})=>C.unwrap(C.client.rpc('master_gamma_delivery',{action,code,claim_key,details}));
const newKey=()=>{const a=new Uint8Array(32);crypto.getRandomValues(a);return [...a].map(n=>n.toString(16).padStart(2,'0')).join('')};
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let processing=false;
function report(s,bad){msg.className=bad?'error':'success';msg.textContent=s;}
function render(d){
root.innerHTML='<span class="badge">تم التسليم بنجاح ✓</span><h1>Gamma Pro — حساب جاهز للاستخدام</h1><p>السعر: '+E(d.price_egp)+' جنيه · حوالي '+E(d.credits_estimate)+' كريدت · الحد الأدنى المضمون '+E(d.credits_min)+' كريدت</p><p>ضمان كامل خلال مدة الاشتراك · تاريخ انتهاء الحساب: '+E(d.expires_on)+'</p><h2>بيانات الحساب</h2><p>البريد:</p><pre class="gamma-secret" id="gammaEmail"></pre><p>كلمة المرور (كما هي بدون إضافات):</p><pre class="gamma-secret" id="gammaPassword"></pre><p>رابط استقبال كود التحقق:</p><a id="gammaMailbox" rel="noopener noreferrer" target="_blank">فتح البريد ↗</a><button id="gammaCopyCredentials" type="button" class="secondary">نسخ بيانات الحساب</button><h2>طريقة تسجيل الدخول</h2><p class="note">1. افتح <a href="https://gamma.app" rel="noopener noreferrer" target="_blank">gamma.app</a> واضغط Log in.<br>2. اختر Continue with email وأدخل البريد الإلكتروني الموضح أعلاه.<br>3. استخدم كلمة المرور إذا طلبها الموقع.<br>4. إذا طلب Gamma رمز تحقق، افتح رابط البريد وانسخ الرمز من أحدث رسالة وأدخله في Gamma.<br>5. احتفظ ببيانات الحساب في مكان آمن ولا تغيّر بيانات الدخول.</p><p>تحتاج مساعدة؟ <a href="https://wa.me/201500950624" target="_blank" rel="noopener noreferrer">تواصل مع الدعم</a></p>';
root.querySelector('#gammaEmail').textContent=d.email;
root.querySelector('#gammaPassword').textContent=d.password;
const link=root.querySelector('#gammaMailbox');if(/^https:\/\//.test(d.mailbox_url))link.href=d.mailbox_url;else link.removeAttribute('href');
root.querySelector('#gammaCopyCredentials').onclick=async()=>{try{await navigator.clipboard.writeText('البريد: '+d.email+'\nكلمة المرور: '+d.password+'\nرابط البريد: '+d.mailbox_url);report('تم نسخ بيانات الحساب.')}catch{report('انسخ البيانات يدويًا.',true)}};
}
const form=root.querySelector('#gammaRedeemForm');
form.onsubmit=async e=>{e.preventDefault();if(processing||!C?.ready)return;processing=true;const button=form.querySelector('button');button.disabled=true;
const enteredPin=form.querySelector('input').value.trim();
const code=new URLSearchParams(location.hash.slice(1)).get('ticket')||'';
if(enteredPin!=='600'){report('كود الاستلام غير صحيح.',true);processing=false;button.disabled=false;return}
if(!/^[0-9a-f]{32}$/.test(code)){report('افتح رابط الاستلام السري الذي أرسله لك الدعم. الكود 600 وحده لا يكفي.',true);processing=false;button.disabled=false;return}
try{
let key=null;
try{key=localStorage.getItem('masterGammaClaim:'+code)}catch{}
if(key){try{render(await rpc('read',code,key));return}catch{}}
key=newKey();
// Store the recovery key before redemption to allow retrying after network interruption.
try{localStorage.setItem('masterGammaClaim:'+code,key)}catch{report('لا يمكن حفظ مفتاح الاستلام في المتصفح. فعّل تخزين الموقع وحاول مجددًا.',true);return}
render(await rpc('redeem',code,key,{pin:enteredPin}));report('تم استلام الحساب. احتفظ بالبيانات بشكل آمن.');
}catch(err){report(err.message.includes('CODE_ALREADY_REDEEMED')?'هذا الرمز استُخدم من جهاز آخر. تواصل مع الدعم.':err.message.includes('CODE_EXPIRED')?'انتهت صلاحية الرمز، تواصل مع الدعم.':'تعذر استلام الحساب. تحقق من الرمز أو تواصل مع الدعم.',true)}
finally{processing=false;button.disabled=false}};
})();