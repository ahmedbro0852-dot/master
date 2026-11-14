const $=s=>document.querySelector(s);
let current=null,timer=null;
function stop(){if(timer)clearInterval(timer);timer=null}
function store(){if(current)localStorage.setItem('master_code_request_v2',JSON.stringify(current));else localStorage.removeItem('master_code_request_v2')}
function showError(text){$('#error').textContent=text||'';$('#error').hidden=!text}
function render(r){
$('#ticket').textContent=r.ticket||current.ticket;
let ready=r.status==='ready',pending=r.status==='pending';
$('#badge').textContent=ready?'تم الاستلام ✓':pending?'قيد التجهيز':r.status==='expired'?'الكود انتهت صلاحيته':'تم إغلاق الطلب';
$('#badge').className='badge'+(ready?' ok':pending?'':' bad');
$('#title').textContent=ready?'الكود جاهز!':pending?'بنجهّز الكود':'حالة الطلب';
$('#details').textContent=ready?'انسخ كودك قبل انتهاء صلاحيته.':pending?'تم استلام طلبك، وفريق المتجر بيتابع توفير الكود.':'تقدر تعمل طلب جديد لو محتاج كود تاني.';
$('#pulse').hidden=!pending;$('#code-wrap').hidden=!ready;
if(ready){$('#code').textContent=r.code||'';$('#expires').textContent='صالح لحد '+new Date(r.expiresAt).toLocaleTimeString('ar-EG');}
$('#track-status').textContent=pending?'بنحدث الحالة تلقائيًا كل 5 ثوانٍ.':ready?'تم تسليم الكود بنجاح.':'انتهى الطلب الحالي.';
if(!pending)stop();
}
async function check(){
if(!current)return;
try{const res=await fetch('/api/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:current.id,token:current.token}),cache:'no-store'});const data=await res.json();if(!res.ok||!data.ok)throw Error(data.message||'تعذر التحديث');render({...data.request,ticket:current.ticket});}
catch(e){$('#track-status').textContent=e.message||'تعذر تحديث الطلب؛ حاول مرة ثانية.';}
}
function activate(data){current={id:data.id,token:data.token,ticket:data.ticket};store();$('#entry').hidden=true;$('#tracking').hidden=false;render({status:'pending',ticket:data.ticket});stop();timer=setInterval(()=>void check(),5000);void check();}
$('#request-form').onsubmit=async e=>{
e.preventDefault();if(!e.target.reportValidity())return;const btn=$('#submit');btn.disabled=true;btn.textContent='جارٍ فتح الطلب…';showError('');
try{const res=await fetch('/api/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:$('#order').value.trim()}),cache:'no-store'});const data=await res.json();if(!res.ok||!data.ok)throw Error(data.message||'تعذر الطلب');$('#order').value='';activate(data);}
catch(err){showError(err.message||'حصل خطأ، جرب تاني.')}finally{btn.disabled=false;btn.textContent='استلام الكود ←';}
};
$('#refresh').onclick=()=>void check();
$('#again').onclick=()=>{stop();current=null;store();$('#entry').hidden=false;$('#tracking').hidden=true;showError('');$('#order').focus()};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#code').textContent);$('#copy').textContent='اتنسخ ✓'}catch{$('#copy').textContent='حدد الكود وانسخه'}};
try{const saved=JSON.parse(localStorage.getItem('master_code_request_v2')||'null');if(saved?.id&&saved?.token&&saved?.ticket)activate(saved)}catch{localStorage.removeItem('master_code_request_v2')}
