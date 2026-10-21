(()=>{'use strict';
if(window.masterMemeReactions)return;window.masterMemeReactions=true;
const key='master-memes-preview-v3';let memory={};function read(){try{return JSON.parse(sessionStorage.getItem(key)||'{}');}catch{return memory;}}function save(s){memory=s;try{sessionStorage.setItem(key,JSON.stringify(s));}catch{}}
let state=read();state.startedAt ||=Date.now();save(state);
const images={henedy:'https://pbs.twimg.com/media/E2lA4raWEAAzigJ.jpg',emam:'https://mediaaws-live.almasryalyoum.com/AMAYLivePictures/portalimages/news/original/2022/05/16/1805598_0.jpeg',kebeer:'https://img.ahlmasrnews.com/750x450/2022/04/%D8%A7%D9%84%D9%83%D8%A8%D9%8A%D8%B1-%D8%A7%D9%88%D9%8A-6-1650046318-0.jpg'};
images.hazalqoum='https://cairogossip.com/app/uploads/2019/10/maxresdefault-3.jpg';images.mashaghebeen='https://www.aljoumhouria.com/glide/News/archive/158/157884_untitled-14_2_.jpg?fit=crop&h=535&w=745';images.million='https://media.elbalad.news/2024/10/large/1052/5/899.jpg';images.classroom='https://s2.dmcdn.net/v/U2dRj1eo-uIbUlCMl/x720';
const messages={welcome:['henedy','أشطا… نورتنا 😎','اتفرج براحتك، ولو محتار إحنا موجودين.'],details:['classroom','نراجع التفاصيل يا كبير 👀','بص على مدة الباقة وطريقة التفعيل والضمان.'],added:['henedy','أشطا… اتحطّت في السلة 😎','كمل اختياراتك براحتك.'],returned:['hazalqoum','لسه بتقارن؟ خد راحتك 😂','التفاصيل موجودة، واسألنا لو حاجة مش واضحة.'],help:['mashaghebeen','محتاج مساعدة يا كبير؟ 👀','قولنا استخدامك ونساعدك تختار.']};
Object.assign(messages,{
searchEmpty:['hazalqoum','هو راح فين؟ 🤔','مفيش نتيجة بالاسم ده؛ جرّب اسم الخدمة أو امسح الفلاتر.'],
planChanged:['million','الإجابة النهائية؟ 😄','راجع المدة وطريقة التفعيل قبل ما تستقر على الباقة.'],
comparing:['emam','ليه؟ ليه كل ده؟ 😂','بتقارن كذا خدمة؟ ركّز على استخدامك والضمان.'],
cartEmpty:['hazalqoum','طب الباقات راحت فين؟ 😂','السلة فاضية لسه… ارجع اختار اللي محتاجه براحتك.'],
cartMany:['million','مش ناقص غير سؤال المليون 😎','بص على خصم الكمية والإجمالي قبل التأكيد.'],
removed:['emam','راجعنا نفسنا… عادي جدًا 😂','شيل وعدّل براحتك، المهم تختار اللي يناسبك.'],
cartWaiting:['kebeer','نراجع الطلب يا كبير 👀','اتأكد من الباقات والعدد وبياناتك قبل الدفع.'],
returnVisit:['henedy','أشطا… رجعت تاني 😎','السلة موجودة، كمل من المكان اللي وقفت عنده.']
});
let box=null,hideTimer;
function dismiss(){if(box){box.remove();box=null;}clearTimeout(hideTimer);}
function show(kind){const s=read();if(s.muted||(s.count||0)>=8||(s.seen||[]).includes(kind)||Date.now()-(s.last||0)<25000||box||document.hidden||document.querySelector('dialog[open]'))return false;
const m=messages[kind];box=document.createElement('aside');box.className='meme-reaction';box.setAttribute('aria-label','رسالة خفيفة من ماستر ستور');
const img=document.createElement('img');img.src=images[m[0]];img.alt=({emam:'ريأكشن عادل إمام',henedy:'ريأكشن محمد هنيدي',kebeer:'الكبير أوي',hazalqoum:'حزلقوم',million:'حزلقوم في مسابقة المليون',mashaghebeen:'مدرسة المشاغبين',classroom:'رمضان مبروك أبو العلمين حمودة'})[m[0]];img.width=92;img.height=82;img.decoding='async';img.onerror=()=>img.remove();
const copy=document.createElement('div');copy.className='meme-reaction-copy';copy.setAttribute('role','status');copy.setAttribute('aria-live','polite');const title=document.createElement('strong');title.textContent=m[1];const text=document.createElement('p');text.textContent=m[2];copy.append(title,text);
if(kind==='help'){const a=document.createElement('a');a.href='https://wa.me/201500950624';a.target='_blank';a.rel='noopener';a.textContent='اسأل الدعم';copy.append(a);}
const close=document.createElement('button');close.type='button';close.className='meme-reaction-close';close.setAttribute('aria-label','إغلاق الرسالة');close.textContent='×';close.onclick=dismiss;
const mute=document.createElement('button');mute.type='button';mute.className='meme-reaction-mute';mute.textContent='إخفاء الرسائل في الزيارة دي';mute.onclick=()=>{const v=read();v.muted=true;save(v);dismiss();};copy.append(mute);box.append(img,copy,close);document.body.append(box);
s.count=(s.count||0)+1;s.last=Date.now();s.seen=[...(s.seen||[]),kind];if(s.pending===kind)delete s.pending;save(s);hideTimer=setTimeout(dismiss,12000);return true;}
function queue(kind){const s=read();if((s.seen||[]).includes(kind)||s.muted)return;s.pending=kind;s.pendingAt=Date.now();save(s);}
function checkPending(){const s=read();if(s.pending){if(Date.now()-(s.pendingAt||Date.now())>90000){delete s.pending;save(s);}else show(s.pending);}}
const params=new URLSearchParams(location.search),productId=params.get('id')||document.body.dataset.productId;
const isProduct=!!document.getElementById('productPage'),isHome=!!document.getElementById('grid');
if(isProduct){const v=read();v.viewed=[...new Set([...(v.viewed||[]),productId])];save(v);if(v.viewed.length>=3)setTimeout(()=>queue('comparing'),15000);
document.addEventListener('change',e=>{if(e.target.matches('input[name="plan"]'))queue('planChanged');});
setTimeout(()=>show('details'),12000);
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.target==='_blank')return;const url=new URL(a.href,location.href);if(url.origin===location.origin&&(/\/(index\.html)?$/.test(url.pathname))){const s=read();if(s.addedProduct!==productId)queue('returned');}},true);}
if(window.MasterCart?.add){const original=window.MasterCart.add;window.MasterCart.add=function(...args){const result=original.apply(this,args);const s=read();s.addedProduct=args[0];save(s);queue('added');return result;};}
if(isHome)setTimeout(()=>{const s=read();if(s.pending)checkPending();else show((s.visits||0)>0?'returnVisit':'welcome');s.visits=(s.visits||0)+1;save(s);},10000);
const cart=document.getElementById('cartContent');if(cart){setTimeout(()=>{const items=window.MasterCart?.read()||[];queue(!items.length?'cartEmpty':items.reduce((a,b)=>a+b.quantity,0)>=2?'cartMany':'cartWaiting');checkPending();},7000);cart.addEventListener('click',e=>{if(e.target.closest('.cart-remove'))setTimeout(()=>{queue('removed');checkPending();},300);});setTimeout(()=>{if((window.MasterCart?.read()||[]).length)queue('cartWaiting');},70000);}
const search=document.getElementById('search');let searchTimer;if(search)search.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{const empty=document.getElementById('empty');if(search.value.trim()&&empty&&empty.getClientRects().length)queue('searchEmpty');},1800);});
setTimeout(checkPending,1500);const timer=setInterval(()=>{checkPending();if(Date.now()-read().startedAt>=180000)show('help');},5000);window.addEventListener('pagehide',()=>{clearInterval(timer);clearTimeout(hideTimer);},{once:true});
})();