(()=>{'use strict';
const section=document.getElementById('customer-stories');if(!section)return;
const captions=['تفعيل اشتراك ومتابعة','تأكيد وصول التحويل','تسليم بيانات الحساب','متابعة الحساب والتفعيل','تأكيد إتمام التفعيل','خطوات التفعيل على الحساب','رسالة شكر من عميل','متابعة تفعيل الاشتراك','تأكيد التفعيل وشكر العميل','تحويل ومتابعة الطلب','تأكيد تفعيل Google AI','تأكيد الدفع وتجربة العميل','استلام التحويل ومتابعة الخدمة','آراء العملاء على فيسبوك','تأكيد التحويل وشكر العميل','متابعة التفعيل ومساعدة العميل','تأكيد دخول العميل وتسليم الهدايا','تفعيل كانفا وتسليم كورسيرا'],english=['Subscription activation','Payment receipt confirmation','Account handover','Account activation support','Activation confirmation','Personal account activation','A customer’s thank-you','Subscription setup support','Activation and customer feedback','Payment and order follow-up','Google AI activation confirmation','Payment and customer experience','Payment received and service follow-up','Customer comments on Facebook','Payment confirmation and customer thanks','Activation support and customer feedback','Customer access and gift delivery','Canva activation and Coursera handover'];
const en=()=>document.documentElement.lang==='en',t=(ar,eng)=>en()?eng:ar;
const E=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=(id,thumb=false)=>'assets/customer-stories/story-'+String(id+1).padStart(2,'0')+(thumb?'.thumb':'')+'.webp?v=20261018-clear2';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const groups=[['all','كل اللقطات','All stories'],['activation','تفعيل وتسليم','Activation'],['feedback','رسائل العملاء','Feedback'],['payment','تحويلات ومتابعة','Payments'],['facebook','فيسبوك','Facebook']];
const categories=id=>id===13?['facebook','feedback']:[1,9,11,12,14].includes(id)?['payment','feedback']:[6,8,15,16,17].includes(id)?['activation','feedback']:['activation'];
let active=14,filter='all',items=captions.map((_,i)=>i),paused=true,visible=false,hover=false,focused=false,last=0,elapsed=0,returnFocus=null,swiped=false;
const dialog=document.getElementById('story-dialog'),large=dialog.querySelector('img'),dialogTitle=dialog.querySelector('h3');
let zoom=dialog.querySelector('.story-zoom');if(!zoom){zoom=document.createElement('button');zoom.type='button';zoom.className='story-zoom';dialog.querySelector('.story-dialog-foot').append(zoom);}
function updateZoom(){zoom.textContent=dialog.classList.contains('is-zoomed')?t('حجم مناسب','Fit image'):t('تكبير +','Zoom +');}
zoom.onclick=()=>{dialog.classList.toggle('is-zoomed');updateZoom();};large.onclick=()=>{dialog.classList.toggle('is-zoomed');updateZoom();};
let oldOverflow='';
function open(trigger){returnFocus=trigger;large.src=path(active);large.alt=(en()?english:captions)[active];dialogTitle.textContent=(active+1)+' / '+captions.length+' — '+large.alt;dialog.classList.remove('is-zoomed');updateZoom();oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}
dialog.querySelector('[data-close]').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;dialog.classList.remove('is-zoomed');returnFocus?.focus();elapsed=0;});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.querySelector('[data-prev]').onclick=()=>step(-1,true);
dialog.querySelector('[data-next]').onclick=()=>step(1,true);
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowRight'?1:-1,true);}});
function mount(){
section.className='customer-stories reviews-showcase';
section.innerHTML='<div class="reviews-shell"><header class="reviews-heading"><h2 id="stories-title">'+t('من تعاملاتنا مع العملاء','From our customer interactions')+'</h2><span class="reviews-heading-rule" aria-hidden="true"></span></header><div class="reviews-tabs" role="group" aria-label="'+t('تصنيف اللقطات','Story categories')+'">'+groups.map(([key,ar,eng])=>'<button type="button" data-review-filter="'+key+'" aria-pressed="'+(filter===key)+'">'+t(ar,eng)+'</button>').join('')+'</div><div class="reviews-theater"><div class="reviews-visual" role="group" aria-label="'+t('معرض المحادثات','Conversation gallery')+'">'+[-2,-1,1,2].map(offset=>'<button type="button" class="reviews-side reviews-side-'+(offset<0?'before':'after')+(Math.abs(offset)===2?' reviews-side-outer':'')+'" data-side="'+offset+'"><img alt="" decoding="async"><span>'+t('عرض المحادثة','View conversation')+' ↗</span></button>').join('')+'<button type="button" class="reviews-main-frame"><span class="reviews-frame-top"><span class="reviews-frame-source"></span><span class="reviews-frame-index" dir="ltr"></span></span><span class="reviews-photo"><img class="reviews-main-image" decoding="async" alt=""></span><span class="reviews-frame-bottom">'+t('عرض المحادثة','View conversation')+' <span aria-hidden="true">↗</span></span></button></div><h3 class="reviews-story-title"></h3><div class="reviews-playback"><button type="button" data-review-step="-1" aria-label="'+t('اللقطة السابقة','Previous story')+'">←</button><div class="reviews-filmstrip" role="group" aria-label="'+t('اختيار المحادثة','Choose conversation')+'"></div><button type="button" data-review-step="1" aria-label="'+t('اللقطة التالية','Next story')+'">→</button></div><span class="reviews-position" dir="ltr" aria-live="polite"></span><button type="button" class="reviews-play-toggle"></button><div class="reviews-timer" aria-hidden="true"><span></span></div></div><p class="reviews-disclaimer">'+t('الصور أجزاء من محادثات العملاء؛ حُجبت معظم البيانات الشخصية لحماية الخصوصية.','Screenshots are excerpts from customer conversations; most personal details are hidden for privacy.')+'</p></div>';
section.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>step(Number(b.dataset.side),true));
section.querySelectorAll('[data-review-filter]').forEach(b=>b.onclick=()=>{paused=true;filter=b.dataset.reviewFilter;items=captions.map((_,i)=>i).filter(i=>filter==='all'||categories(i).includes(filter));if(!items.includes(active))active=items[0];elapsed=0;renderFilm();paint(false);section.querySelectorAll('[data-review-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.reviewFilter===filter)));});
section.querySelectorAll('[data-review-step]').forEach(b=>b.onclick=()=>step(Number(b.dataset.reviewStep),true));
section.querySelector('.reviews-play-toggle').onclick=()=>{paused=!paused;elapsed=0;updatePlayback();};

const frame=section.querySelector('.reviews-main-frame');
frame.onclick=e=>{if(swiped){swiped=false;return;}open(e.currentTarget);};
const visual=section.querySelector('.reviews-visual');
visual.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true;});
visual.addEventListener('pointerleave',()=>{hover=false;visual.style.removeProperty('--reviews-tilt-x');visual.style.removeProperty('--reviews-tilt-y');});
visual.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced.matches)return;const r=visual.getBoundingClientRect();visual.style.setProperty('--reviews-tilt-y',Math.max(-3,Math.min(3,((e.clientX-r.left)/r.width-.5)*6))+'deg');visual.style.setProperty('--reviews-tilt-x',Math.max(-2,Math.min(2,-((e.clientY-r.top)/r.height-.5)*4))+'deg');});
let startX=0;frame.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')startX=e.clientX;});
frame.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&Math.abs(e.clientX-startX)>45){swiped=true;step(e.clientX<startX?1:-1,true);setTimeout(()=>{swiped=false;},350);}});
section.querySelector('.reviews-main-image').addEventListener('load',e=>{if(!reduced.matches&&e.target.animate)e.target.animate([{opacity:.2},{opacity:1}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});});
renderFilm();paint(false);
}
function renderFilm(){
const strip=section.querySelector('.reviews-filmstrip');strip.innerHTML=items.map(id=>'<button type="button" class="reviews-thumb" data-review-id="'+id+'" aria-label="'+E(t('عرض: ','Show: ')+(en()?english:captions)[id])+'"><span></span></button>').join('');
strip.querySelectorAll('[data-review-id]').forEach(b=>b.onclick=()=>{paused=true;active=Number(b.dataset.reviewId);elapsed=0;paint(true);});

}
function paint(animate=true){
const pos=items.indexOf(active),label=(en()?english:captions)[active],source=active===13?'FACEBOOK':'WHATSAPP';
section.querySelector('.reviews-visual').classList.toggle('reviews-single',items.length===1);
const image=section.querySelector('.reviews-main-image');
const changed=image.getAttribute('src')!==path(active);
if(animate&&changed&&!reduced.matches&&image.complete&&image.naturalWidth){
const photo=image.parentElement;photo.querySelectorAll('.reviews-outgoing').forEach(x=>x.remove());
const old=image.cloneNode();old.className='reviews-outgoing';old.alt='';old.setAttribute('aria-hidden','true');photo.append(old);
const exit=old.animate([{opacity:1,transform:'translateX(0) rotateY(0) scale(1)'},{opacity:0,transform:'translateX(-20px) scale(.98)'}],{duration:250,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});exit.onfinish=()=>old.remove();
section.querySelector('.reviews-story-title').animate([{opacity:.2,transform:'translateY(15px)'},{opacity:1,transform:'none'}],{duration:250,easing:'ease-out'});
}
image.src=path(active);image.alt=label;
for(const id of [items[(pos+1)%items.length],items[(pos-1+items.length)%items.length]]){const pre=new Image();pre.src=path(id);}
section.querySelector('.reviews-main-frame').setAttribute('aria-label',t('افتح الصورة: ','Open image: ')+label);
section.querySelector('.reviews-frame-source').textContent=source;
section.querySelector('.reviews-frame-index').textContent=String(active+1).padStart(2,'0')+' / '+captions.length;

section.querySelector('.reviews-story-title').textContent=label;
section.querySelector('.reviews-position').textContent=String(pos+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
section.querySelectorAll('[data-side]').forEach(b=>{const offset=Number(b.dataset.side),id=items[(pos+offset+items.length)%items.length];b.hidden=items.length<=(Math.abs(offset)===2?3:1);b.querySelector('img').src=path(id,true);b.setAttribute('aria-label',t('انتقل إلى: ','Go to: ')+(en()?english:captions)[id]);});
section.querySelectorAll('[data-review-step]').forEach(b=>b.disabled=items.length===1);
section.querySelectorAll('[data-review-id]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.reviewId)===active)));
const thumb=section.querySelector('[data-review-id="'+active+'"]'),strip=section.querySelector('.reviews-filmstrip');
if(thumb)strip.scrollTo({left:Math.max(0,thumb.offsetLeft-strip.clientWidth/2+thumb.offsetWidth/2),behavior:animate&&!reduced.matches?'smooth':'auto'});
if(dialog.open){large.src=path(active);large.alt=label;dialogTitle.textContent=(active+1)+' / '+captions.length+' — '+label;dialog.classList.remove('is-zoomed');updateZoom();}
updatePlayback();
}
function updatePlayback(){const b=section.querySelector('.reviews-play-toggle');b.textContent=paused?t('تشغيل عرض تلقائي','Start slideshow'):t('إيقاف العرض التلقائي','Pause slideshow');b.setAttribute('aria-pressed',String(paused));section.classList.toggle('reviews-paused',paused||reduced.matches);}
function step(delta,manual=false){if(manual)paused=true;active=items[(items.indexOf(active)+delta+items.length)%items.length];elapsed=0;paint(true);}
section.addEventListener('focusin',e=>{focused=true;if(e.target.matches(':focus-visible')){paused=true;updatePlayback();}});section.addEventListener('focusout',e=>{focused=section.contains(e.relatedTarget);elapsed=0;});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;section.classList.toggle('reviews-visible',visible);},{threshold:.15}).observe(section);
reduced.addEventListener('change',e=>{if(e.matches)paused=true;updatePlayback();});
new MutationObserver(()=>mount()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
function tick(time){const dt=Math.min(50,time-last);last=time;const running=visible&&!paused&&!hover&&!dialog.open&&!document.hidden&&!reduced.matches;section.classList.toggle('reviews-running',running);if(running){elapsed+=dt;if(elapsed>=8000)step(1);section.querySelector('.reviews-timer>span').style.transform='scaleX('+Math.min(1,elapsed/8000)+')';}requestAnimationFrame(tick);}
mount();requestAnimationFrame(tick);
})();