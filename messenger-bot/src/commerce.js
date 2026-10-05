export const initialStore={contactPhone:'',plans:[{id:'starter',name:'البداية',price:500,setup:1500,daily:100,monthly:3000},{id:'growth',name:'النمو',price:1000,setup:2500,daily:400,monthly:10000},{id:'pro',name:'الاحترافية',price:2000,setup:5000,daily:1000,monthly:25000}]};
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256));}
const safeUser=u=>u&&({id:u.id,name:u.name,email:u.email,phone:u.phone,createdAt:u.createdAt});
export async function commerceRoute(req,env,h){const {rpc,json,body,hmac,verifySignature,authorized,defaults}=h,p=new URL(req.url).pathname;
 if(!p.startsWith('/api/shop/')&&!p.startsWith('/api/account/')&&!p.startsWith('/api/commerce/'))return null;
 const call=(path,d)=>rpc(env,'registry',path,d), cookie=value=>`customer_session=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`;
 if(p==='/api/shop/store'&&req.method==='GET')return json(await call('/store'));
 if(p==='/api/shop/logout'&&req.method==='POST')return json({ok:true},200,{'set-cookie':cookie('')+'; Max-Age=0'});
 if(['/api/shop/register','/api/shop/login'].includes(p)&&req.method==='POST'){
  if(!env.ADMIN_TOKEN)return json({error:'الخدمة غير مهيأة'},503);
  const gate=await call('/login-limit',{ip:'customer:'+ (req.headers.get('cf-connecting-ip')||'local')});if(!gate.allowed)return json({error:'انتظر ١٥ دقيقة قبل المحاولة'},429);
  const d=await body(req),email=String(d.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>150||typeof d.password!=='string'||d.password.length<10||d.password.length>128)return json({error:'أدخل بريدًا صحيحًا وكلمة مرور لا تقل عن ١٠ أحرف'},400);
  let u=await call('/user-email',{email});
  if(p.endsWith('register')){if(u)return json({error:'البريد مسجل بالفعل'},409);if(typeof d.name!=='string'||!d.name.trim()||d.name.length>100||typeof d.phone!=='string'||d.phone.length>30||!d.phone.trim())return json({error:'أدخل الاسم ورقم التواصل'},400);const salt=crypto.randomUUID();u=await call('/register',{id:crypto.randomUUID(),name:d.name.trim(),phone:d.phone,email,salt,hash:await passwordHash(d.password,salt),createdAt:new Date().toISOString()});}
  else if(!u||await passwordHash(d.password,u.salt)!==u.hash)return json({error:'البريد أو كلمة المرور غير صحيحة'},401);
  const payload=u.id+'.'+(Date.now()+604800000);return json(safeUser(u),200,{'set-cookie':cookie(payload+'.'+await hmac('customer:'+payload,env.ADMIN_TOKEN))});
 }
 if(p.startsWith('/api/commerce/')){if(!await authorized(req,env))return json({error:'دخول الإدارة مطلوب'},401);
  if(p==='/api/commerce/users')return json((await call('/users')).map(safeUser));
  if(p==='/api/commerce/store'){if(req.method==='PUT'){const d=await body(req);if(!Array.isArray(d.plans)||d.plans.length!==3||!/^\+?\d{0,20}$/.test(d.contactPhone||'')||!d.plans.every((a,i)=>a.id===initialStore.plans[i].id&&typeof a.name==='string'&&a.name.length>0&&a.name.length<=50&&['price','setup','daily','monthly'].every(k=>Number.isInteger(a[k])&&a[k]>= (['daily','monthly'].includes(k)?1:0)&&a[k]<=1000000)))return json({error:'راجع الباقات ورقم التواصل'},400);await call('/store',d);}return json(await call('/store'));}
  if(p==='/api/commerce/orders')return json(await call('/orders'));
  const m=p.match(/^\/api\/commerce\/orders\/([a-f0-9-]{36})\/(approve|reject|message)$/);if(m&&req.method==='POST'){const d=await body(req);if(m[2]==='message'){if(typeof d.text!=='string'||!d.text.trim()||d.text.length>1000)return json({error:'اكتب رسالة أقل من ١٠٠٠ حرف'},400);return json(await call('/order-message',{id:m[1],role:'admin',text:d.text.trim()}));}return json(await call('/order-decision',{id:m[1],decision:m[2],defaults}));}
  return json({error:'غير موجود'},404);
 }
 const value=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('customer_session='))?.slice(17)||'', [id,expiry,sig]=value.split('.');
 if(!/^[a-f0-9-]{36}$/.test(id||'')||!/^\d+$/.test(expiry||'')||Number(expiry)<Date.now()||!env.ADMIN_TOKEN||!await verifySignature('customer:'+id+'.'+expiry,'sha256='+sig,env.ADMIN_TOKEN))return json({error:'سجّل الدخول لحسابك'},401);
 const u=await call('/user/'+id);if(!u)return json({error:'الحساب غير موجود'},401);
 const messaging=await h.messagingRoute(req,env,{...h,isActive:h.isActive},id);if(messaging)return messaging;
 if(p==='/api/account/me')return json(safeUser(u));
 if(p==='/api/account/orders'){if(req.method==='POST'){const d=await body(req),store=await call('/store'),plan=store.plans.find(a=>a.id===d.planId);if(!plan||typeof d.businessName!=='string'||!d.businessName.trim()||d.businessName.length>100)return json({error:'اختر باقة واكتب اسم النشاط'},400);return json(await call('/order-create',{id:crypto.randomUUID(),userId:id,customer:safeUser(u),businessName:d.businessName.trim(),plan:{...plan},status:'pending',messages:[],createdAt:new Date().toISOString()}),201);}return json((await call('/orders')).filter(o=>o.userId===id));}
 const om=p.match(/^\/api\/account\/orders\/([a-f0-9-]{36})\/message$/);if(om&&req.method==='POST'){const o=await call('/order/'+om[1]);if(!o||o.userId!==id)return json({error:'غير مسموح'},403);const d=await body(req);if(typeof d.text!=='string'||!d.text.trim()||d.text.length>1000)return json({error:'اكتب رسالة أقل من ١٠٠٠ حرف'},400);return json(await call('/order-message',{id:o.id,role:'customer',text:d.text.trim()}));}
 if(p==='/api/account/clients')return json(await Promise.all((await call('/clients')).filter(c=>c.ownerUserId===id).map(async c=>({...c,usage:await rpc(env,'tenant:'+c.id,'/usage')}))));
 const cm=p.match(/^\/api\/account\/clients\/([a-f0-9-]{36})$/);if(cm&&req.method==='PUT'){const c=await call('/client/'+cm[1]);if(!c||c.ownerUserId!==id)return json({error:'غير مسموح'},403);const d=await body(req);if(Object.keys(d).some(k=>!['knowledge','businessName'].includes(k))||typeof d.knowledge!=='string'||d.knowledge.length>6000||typeof d.businessName!=='string'||!d.businessName.trim()||d.businessName.length>100)return json({error:'يمكن تعديل الاسم ومعلومات الرد فقط'},400);return json(await call('/client',{...c,knowledge:d.knowledge,businessName:d.businessName.trim()}));}
 return json({error:'غير موجود'},404);
}
export async function commerceStorage(s,p,d,json){
 if(p==='/store'){if(d)await s.put('store',d);return json(await s.get('store')||initialStore);}
 if(p==='/user-email'){const id=await s.get('email:'+d.email);return json(id?await s.get('user:'+id):null);}
 if(p==='/register'){const ids=await s.get('userIds')||[];if(await s.get('email:'+d.email))return json({error:'البريد مسجل بالفعل'},409);if(ids.length>=1000)return json({error:'الحد الأقصى للحسابات'},400);await s.put({['user:'+d.id]:d,['email:'+d.email]:d.id,userIds:[...ids,d.id]});return json(d);}
 if(p==='/users')return json(await Promise.all((await s.get('userIds')||[]).map(id=>s.get('user:'+id))));
 if(p.startsWith('/user/'))return json(await s.get('user:'+p.slice(6))||null);
 if(p==='/orders')return json(await Promise.all((await s.get('orderIds')||[]).map(id=>s.get('order:'+id))));
 if(p.startsWith('/order/'))return json(await s.get('order:'+p.slice(7))||null);
 if(p==='/order-create'){const ids=await s.get('orderIds')||[];if(ids.length>=2000)return json({error:'وصل النظام للحد الأقصى للطلبات'},400);for(const id of ids){const o=await s.get('order:'+id);if(o.userId===d.userId&&o.status==='pending')return json({error:'لديك طلب قيد المراجعة بالفعل'},409);}await s.put({['order:'+d.id]:d,orderIds:[...ids,d.id]});return json(d);}
 if(p==='/order-message'||p==='/order-decision'){const o=await s.get('order:'+d.id);if(!o)return json({error:'الطلب غير موجود'},404);
  if(p==='/order-message'){if(o.messages.length>=100)return json({error:'وصلت المحادثة للحد الأقصى'},400);o.messages.push({role:d.role,text:d.text,at:new Date().toISOString()});}
  else {if(o.status!=='pending')return json(o);if(d.decision==='approve'){const ids=await s.get('clientIds')||[];if(ids.length>=500)return json({error:'الحد الأقصى للعملاء'},400);const c={...d.defaults,id:o.id,ownerUserId:o.userId,businessName:o.businessName,ownerName:o.customer.name,phone:o.customer.phone,plan:o.plan.name,monthlyPrice:o.plan.price,setupPrice:o.plan.setup,dailyReplies:o.plan.daily,monthlyReplies:o.plan.monthly,status:'active',enabled:false,expiresAt:new Date(Date.now()+30*86400000).toISOString().slice(0,10),createdAt:new Date().toISOString()};await s.put({['client:'+c.id]:c,clientIds:[...ids,c.id]});o.clientId=c.id;o.status='approved';}else o.status='rejected';o.reviewedAt=new Date().toISOString();}
  await s.put('order:'+o.id,o);return json(o);
 }
 return null;
}
