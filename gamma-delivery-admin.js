(function(){'use strict';
const C=window.MasterCloud,root=document.getElementById('gammaDeliveryAdmin');
if(!root)return;
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const call=(action,more={})=>C.unwrap(C.client.rpc('master_gamma_delivery',{action,...more}));
const hex=()=>{const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return [...bytes].map(v=>v.toString(16).padStart(2,'0')).join('')};
let sending=false;
function status(s,bad=false){const el=root.querySelector('#gammaStatus');el.textContent=s;el.className=bad?'error':'success'}
async function refresh(){const d=await call('admin_summary');root.querySelector('#gammaStats').textContent='متاح: '+d.available+' | منتهي: '+d.expired_stock+' | بانتظار الاستلام: '+d.issued+' | تم التسليم: '+d.delivered;
root.querySelector('#gammaRecent').innerHTML=d.recent.map(r=>'<div class="gamma-row"><small>طلب '+E(r.order_id)+' — '+(r.claimed_at?'تم الاستلام':'بانتظار الاستلام')+' — '+E(new Date(r.issued_at).toLocaleString('ar-EG'))+'</small></div>').join('')||'<p>لا توجد أكواد صادرة بعد.</p>';}
async function start(){
if(!C?.ready||!await C.user()){root.textContent='سجل الدخول كمدير لإدارة مخزون Gamma.';return;}
await call('admin_summary');
root.innerHTML='<div class="row"><h2>Gamma Pro — تسليم بكود بعد تأكيد الدفع</h2><button id="gammaRefresh" type="button" class="secondary">تحديث</button></div><p id="gammaStats"></p><p>باقة Pro شهر: 600 جنيه، حوالي 4400 كريدت (الحد الأدنى 4000). بيانات الحسابات لا تظهر في هذه اللوحة بعد حفظها.</p><form id="gammaStock"><h3>إضافة حساب للمخزون الخاص</h3><div class="grid"><label>البريد الإلكتروني<input required name="email" type="email" autocomplete="off"></label><label>كلمة المرور كما هي تمامًا<input required name="password" type="text" autocomplete="off" spellcheck="false"></label><label>رابط بريد كود التحقق<input required name="mailbox_url" type="url" placeholder="https://"></label><label>تاريخ انتهاء الحساب<input required name="expires_on" type="date"></label><label>الكريدت التقريبي<input required name="credits_estimate" type="number" min="4000" value="4400"></label><label>الحد الأدنى المضمون<input required name="credits_min" type="number" min="1" value="4000"></label></div><button class="primary" type="submit">حفظ الحساب في المخزون</button></form><hr><form id="gammaIssue"><h3>تأكيد الدفع وإصدار كود طلب Gamma</h3><label>رقم الطلب الموجود في الموقع (UUID)<input required name="order_id" pattern="[0-9a-fA-F-]{36}" maxlength="36" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></label><label class="check"><input required name="confirmed" type="checkbox"> راجعت التحويل بنفسي وتأكدت من استلام 600 جنيه لهذا الطلب.</label><button class="primary" type="submit">تأكيد الدفع وإصدار رمز الاستلام</button></form><div id="gammaIssued" hidden><h3>كود الاستلام: 600</h3><p>كل طلب له رابط سري خاص. أرسل الرابط والكود معًا للعميل؛ الكود وحده لا يفتح الحساب.</p><input id="gammaCode" readonly dir="ltr" aria-label="كود استلام Gamma"><button id="gammaCopy" type="button" class="secondary">نسخ الرسالة للعميل</button><a id="gammaRedeemLink" target="_blank" rel="noopener">صفحة استلام Gamma ↗</a></div><p id="gammaStatus" role="status"></p><h3>أحدث الطلبات</h3><div id="gammaRecent"></div>';
const stock=root.querySelector('#gammaStock'),issue=root.querySelector('#gammaIssue');
root.querySelector('#gammaRefresh').onclick=()=>refresh().catch(e=>status(e.message,true));
stock.onsubmit=async e=>{e.preventDefault();if(sending)return;sending=true;const button=stock.querySelector('button');button.disabled=true;try{
const d=Object.fromEntries(new FormData(stock));d.credits_estimate=Number(d.credits_estimate);d.credits_min=Number(d.credits_min);
await call('stock_add',{details:d});stock.reset();status('تم حفظ الحساب في المخزون الخاص.');await refresh();
}catch(err){status('تعذر حفظ الحساب: '+err.message,true)}finally{sending=false;button.disabled=false}};
issue.onsubmit=async e=>{e.preventDefault();if(sending)return;sending=true;const button=issue.querySelector('button');button.disabled=true;const code=hex();const order_id=issue.elements.order_id.value.trim();
try{await call('issue',{code,order_id,details:{payment_confirmed:true}});
const box=root.querySelector('#gammaIssued'),url=new URL('/gamma-redeem.html',location.origin);box.hidden=false;url.hash=new URLSearchParams({ticket:code}).toString();root.querySelector('#gammaCode').value='600';root.querySelector('#gammaRedeemLink').href=url.href;
root.querySelector('#gammaCopy').onclick=async()=>{const t='MASTER STORE 🎁\\nتم تأكيد دفع طلب Gamma Pro.\\nرابط الاستلام: '+url.href+'\\nكود الاستلام: 600\\nالرابط السري خاص بطلبك، لا تشاركه مع أحد.';try{await navigator.clipboard.writeText(t);status('تم نسخ رسالة الاستلام.')}catch{status('انسخ الكود يدويًا من الخانة.')}};
issue.reset();status('تم تأكيد الدفع وحجز حساب واحد وإصدار الرمز. انسخه قبل مغادرة الصفحة.');await refresh();
}catch(err){status('تعذر إصدار الكود: '+err.message,true)}finally{sending=false;button.disabled=false}};
await refresh();
}
start().catch(e=>{root.textContent='تعذر فتح إدارة Gamma. تأكد من صلاحية المدير وتحديث قاعدة البيانات. '+e.message});
})();