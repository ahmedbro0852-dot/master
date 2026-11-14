import http from 'node:http';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {createHmac,randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
const PASS=process.env.ADMIN_PASSWORD,SECRET=process.env.DATA_SECRET,FILE=process.env.DATA_FILE||'/data/requests.json',PORT=Number(process.env.PORT)||3000;
if(!PASS||PASS.length<18||!SECRET||SECRET.length<28)throw Error('Missing secure admin configuration');
let serial=Promise.resolve();const limits=new Map();
function mac(s){return createHmac('sha256',SECRET).update(String(s)).digest('hex')}
function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)}
function safe(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(obj))}
function fail(res,status,message){return safe(res,status,{ok:false,message})}
function ip(req){return String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim().slice(0,70)}
function allow(req,kind,n,ms){const k=kind+ip(req),t=Date.now(),seen=(limits.get(k)||[]).filter(x=>t-x<ms);seen.push(t);limits.set(k,seen);return seen.length<=n}
async function parse(req){let total=0,arr=[];for await(const c of req){total+=c.length;if(total>2048)throw Error('large');arr.push(c)}return JSON.parse(Buffer.concat(arr).toString('utf8')||'{}')}
function sameOrigin(req){const o=req.headers.origin;return !o||o==='https://'+req.headers.host||o==='http://'+req.headers.host}
function isAdmin(req){const raw=String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(x=>x.startsWith('mst_adm='))?.slice(8)||'';const [payload,sig]=raw.split('.');if(!payload||!sig||!equal(mac(payload),sig))return false;try{return JSON.parse(Buffer.from(payload,'base64url').toString('utf8')).exp>Date.now()}catch{return false}}
function prune(db){const t=Date.now();db.requests=db.requests.filter(r=>t-r.createdAt<2*86400000);for(const r of db.requests){if(r.status==='ready'&&t>r.expiresAt){r.status='expired';r.code=null}}}
function tx(fn){const current=serial.then(async()=>{const db=JSON.parse(await readFile(FILE,'utf8'));prune(db);const result=await fn(db);const temp=FILE+'.tmp';await writeFile(temp,JSON.stringify(db),{mode:0o600});await rename(temp,FILE);return result});serial=current.catch(()=>{});return current}
function publicRequest(r){return {id:r.id,ref:r.ref,ticket:r.ticket,status:r.status,code:r.status==='ready'?r.code:null,expiresAt:r.expiresAt||null,createdAt:r.createdAt}}
await mkdir(dirname(FILE),{recursive:true});try{await readFile(FILE)}catch(e){if(e.code!=='ENOENT')throw e;await writeFile(FILE,'{"requests":[]}')}
const files={'/':'index.html','/admin':'admin.html','/app.js':'app.js','/admin.js':'admin.js','/style.css':'style.css'};
http.createServer(async(req,res)=>{
res.setHeader('Cache-Control','no-store');res.setHeader('X-Frame-Options','DENY');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' https://master-pi-six.vercel.app; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'");
try{
const path=new URL(req.url||'/','http://localhost').pathname;
if(path==='/api/health')return safe(res,200,{ok:true,service:'master-code-desk'});
if(path.startsWith('/api/')&&!sameOrigin(req))return fail(res,403,'طلب غير مسموح');
if(path==='/api/request'&&req.method==='POST'){
if(!allow(req,'open',10,600000))return fail(res,429,'محاولات كثيرة، حاول بعد قليل');
const data=await parse(req),ref=String(data.ref||'').trim().toUpperCase();
if(!/^[A-Z0-9-]{5,50}$/.test(ref))return fail(res,400,'أدخل رقم الطلب الصحيح');
const token=randomBytes(32).toString('base64url');
const entry={id:randomUUID(),ticket:randomBytes(4).toString('hex').toUpperCase(),ref,tokenHash:mac(token),status:'pending',createdAt:Date.now(),code:null,expiresAt:null};
await tx(db=>{if(db.requests.filter(r=>r.status==='pending').length>=800)throw Error('queue full');db.requests.push(entry)});
return safe(res,201,{ok:true,id:entry.id,ticket:entry.ticket,token,status:'pending'});
}
if(path==='/api/status'&&req.method==='POST'){
if(!allow(req,'status',200,600000))return fail(res,429,'خفف التحديث');
const data=await parse(req),id=String(data.id||''),token=String(data.token||'');
if(!/^[a-f0-9-]{36}$/.test(id)||token.length>100)return fail(res,400,'طلب غير صالح');
const found=await tx(db=>db.requests.find(r=>r.id===id&&equal(r.tokenHash,mac(token))));
return found?safe(res,200,{ok:true,request:publicRequest(found)}):fail(res,404,'الطلب غير موجود أو انتهت صلاحيته');
}
if(path==='/api/admin/login'&&req.method==='POST'){
if(!allow(req,'login',7,900000))return fail(res,429,'محاولات دخول كثيرة');
const data=await parse(req);if(!equal(String(data.password||''),PASS))return fail(res,401,'كلمة المرور غير صحيحة');
const payload=Buffer.from(JSON.stringify({exp:Date.now()+21600000,nonce:randomBytes(8).toString('hex')})).toString('base64url');
res.setHeader('Set-Cookie','mst_adm='+payload+'.'+mac(payload)+'; HttpOnly; SameSite=Strict; Secure; Path=/; Max-Age=21600');return safe(res,200,{ok:true});
}
if(path==='/api/admin/logout'&&req.method==='POST'){res.setHeader('Set-Cookie','mst_adm=; HttpOnly; SameSite=Strict; Secure; Path=/; Max-Age=0');return safe(res,200,{ok:true})}
if(path.startsWith('/api/admin/')){
if(!isAdmin(req))return fail(res,401,'سجل الدخول إلى الإدارة');
if(path==='/api/admin/me'&&req.method==='GET')return safe(res,200,{ok:true});
if(path==='/api/admin/requests'&&req.method==='GET')return safe(res,200,{ok:true,requests:await tx(db=>db.requests.slice(-200).reverse().map(r=>({id:r.id,ticket:r.ticket,ref:r.ref,status:r.status,createdAt:r.createdAt,code:r.status==='ready'?r.code:null})))});
if(path==='/api/admin/complete'&&req.method==='POST'){
const data=await parse(req),id=String(data.id||''),code=String(data.code||'').trim().replace(/\s/g,'');
if(!/^[a-f0-9-]{36}$/.test(id)||!/^[A-Za-z0-9-]{4,32}$/.test(code))return fail(res,400,'رقم الطلب أو الكود غير صحيح');
const found=await tx(db=>{const r=db.requests.find(x=>x.id===id);if(!r)return false;r.code=code;r.status='ready';r.expiresAt=Date.now()+1200000;return true});
return found?safe(res,200,{ok:true}):fail(res,404,'الطلب غير موجود');
}
if(path==='/api/admin/cancel'&&req.method==='POST'){
const data=await parse(req);const found=await tx(db=>{const r=db.requests.find(x=>x.id===data.id);if(!r)return false;r.status='cancelled';r.code=null;return true});return found?safe(res,200,{ok:true}):fail(res,404,'الطلب غير موجود')
}
return fail(res,404,'مسار غير موجود');
}
if((req.method==='GET'||req.method==='HEAD')&&files[path]){
const name=files[path],buff=await readFile(join(process.cwd(),name));const ext=name.split('.').at(-1);
res.writeHead(200,{'Content-Type':ext==='html'?'text/html; charset=utf-8':ext==='css'?'text/css; charset=utf-8':'application/javascript; charset=utf-8'});return res.end(req.method==='HEAD'?undefined:buff);
}
return fail(res,404,'الصفحة غير موجودة');
}catch(e){console.error('Code desk request error',e.name);return !res.headersSent?fail(res,500,'تعذر تنفيذ الطلب حاليًا'):res.end()}
}).listen(PORT,'0.0.0.0',()=>console.log('Master Code Desk ready',PORT));