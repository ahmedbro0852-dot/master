const $=s=>document.querySelector(s);let timer=null;
async function api(path,body){const opts={cache:'no-store'};if(body!==undefined){opts.method='POST';opts.headers={'content-type':'application/json'};opts.body=JSON.stringify(body)}const res=await fetch(path,opts);const data=await res.json();if(!res.ok||!data.ok)throw Error(data.message||'تعذر تنفيذ العملية');return data}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==null)n.textContent=text||'';if(cls)n.className=cls;return n}
function exit(){if(timer)clearInterval(timer);timer=null;$('#login').hidden=false;$('#dashboard').hidden=true;$('#logout').hidden=true}
function enter(){$('#login').hidden=true;$('#dashboard').hidden=false;$('#logout').hidden=false;void load();if(timer)clearInterval(timer);timer=setInterval(()=>void load(),10000)}
$('#login-form').onsubmit=async e=>{e.preventDefault();const btn=e.target.querySelector('button');btn.disabled=true;$('#login-error').hidden=true;try{await api('/api/admin/login',{password:$('#pass').value});$('#pass').value='';enter()}catch(err){$('#login-error').hidden=false;$('#login-error').textContent=err.message}finally{btn.disabled=false}};
$('#logout').onclick=async()=>{await api('/api/admin/logout',{}).catch(()=>{});exit()};
$('#reload').onclick=()=>void load();
async function load(){try{const data=await api('/api/admin/requests'),items=data.requests,frag=document.createDocumentFragment();
$('#stats').textContent='طلبات قيد التجهيز: '+items.filter(x=>x.status==='pending').length+' | إجمالي الطلبات الظاهرة: '+items.length;
if(!items.length)frag.append(el('p','مفيش طلبات لسه.','empty'));
for(const r of items){
const card=el('article',null,'request-card'),top=el('div',null,'request-top');top.append(el('strong','#'+r.ticket),el('span',r.status==='pending'?'قيد التجهيز':r.status==='ready'?'تم التسليم':r.status==='expired'?'منتهي':'ملغي','badge'+(r.status==='ready'?' ok':'')));card.append(top,el('p','رقم طلب العميل: '+r.ref,'ref'),el('p',new Date(r.createdAt).toLocaleString('ar-EG'),'muted'));
if(r.status==='pending'){
const f=el('form',null,'deliver'),code=el('input'),save=el('button','تسليم الكود'),cancel=el('button','إلغاء');code.required=true;code.minLength=4;code.maxLength=32;code.placeholder='أدخل كود التحقق';code.dir='ltr';code.autocomplete='off';save.className='primary';cancel.type='button';cancel.className='cancel';f.append(code,save,cancel);
f.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{await api('/api/admin/complete',{id:r.id,code:code.value});void load()}catch(err){alert(err.message)}finally{save.disabled=false}};
cancel.onclick=async()=>{if(!confirm('إلغاء الطلب؟'))return;try{await api('/api/admin/cancel',{id:r.id});void load()}catch(err){alert(err.message)}};
card.append(f);
}else if(r.status==='ready'){card.append(el('p','الكود المُسلّم: '+r.code,'delivered'))}
frag.append(card);
}
$('#requests').replaceChildren(frag);$('#admin-state').textContent='آخر تحديث: '+new Date().toLocaleTimeString('ar-EG');}
catch(err){$('#admin-state').textContent=err.message;if(err.message.includes('سجل الدخول'))exit()}}
api('/api/admin/me').then(enter).catch(exit);
