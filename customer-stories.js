(()=>{'use strict';
const section=document.getElementById('customer-stories');if(!section)return;
const captions=['تفعيل اشتراك ومتابعة','تأكيد وصول التحويل','تسليم بيانات الحساب','متابعة الحساب والتفعيل','تأكيد إتمام التفعيل','خطوات التفعيل على الحساب','رسالة شكر من عميل','متابعة تفعيل الاشتراك','تأكيد التفعيل وشكر العميل','تحويل ومتابعة الطلب','تأكيد تفعيل Google AI','تأكيد الدفع وتجربة العميل','استلام التحويل ومتابعة الخدمة','آراء العملاء على فيسبوك','تأكيد التحويل وشكر العميل','متابعة التفعيل ومساعدة العميل','تأكيد دخول العميل وتسليم الهدايا','تفعيل كانفا وتسليم كورسيرا'],english=['Subscription activation','Payment receipt confirmation','Account handover','Account activation support','Activation confirmation','Personal account activation','A customer’s thank-you','Subscription setup support','Activation and customer feedback','Payment and order follow-up','Google AI activation confirmation','Payment and customer experience','Payment received and service follow-up','Customer comments on Facebook','Payment confirmation and customer thanks','Activation support and customer feedback','Customer access and gift delivery','Canva activation and Coursera handover'];
const en=()=>document.documentElement.lang==='en',t=(ar,eng)=>en()?eng:ar;
const E=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=(id,thumb=false)=>'assets/customer-stories/story-'+String(id+1).padStart(2,'0')+(thumb?'.thumb':'')+'.webp?v=20261018-clear2';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const groups=[['all','كل اللقطات','All stories'],['activation','تفعيل وتسليم','Activation'],['feedback','رسائل العملاء','Feedback'],['payment','تحويلات ومتابعة','Payments'],['facebook','فيسبوك','Facebook']];
const categories=id=>id===13?['facebook','feedback']:[1,9,11,12,14].includes(id)?['payment','feedback']:[6,8,15,16,17].includes(id)?['activation','feedback']:['activation'];
let active=14,filter='all',items=captions.map((_,i)=>i),paused=reduced.matches,visible=false,hover=false,focused=false,last=0,elapsed=0,returnFocus=null,swiped=false;
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
section.innerHTML='<div class="reviews-atmosphere" aria-hidden="true"><i></i><i></i><i></i><span></span></div><div class="reviews-shell"><header class="reviews-heading"><div><span class="reviews-kicker">'+t('من محادثاتنا معاكم','FROM OUR CONVERSATIONS')+'</span><h2 id="stories-title">'+t('من تعاملاتنا مع العملاء','From our customer interactions')+'</h2><p>'+t('تفعيل وتسليم ومتابعة — شوف اللقطات واقرأ تجربة كل عميل.','Activation, delivery and support — explore the screenshots and read each experience.')+'</p></div><a class="reviews-contact" href="https://wa.me/201500950624" target="_blank" rel="noopener">'+t('اسألنا على واتساب','Chat with us')+' <span aria-hidden="true">↗</span></a></header><div class="reviews-tabs" role="group" aria-label="'+t('تصنيف اللقطات','Story categories')+'">'+groups.map(([key,ar,eng])=>'<button type="button" data-review-filter="'+key+'" aria-pressed="'+(filter===key)+'">'+t(ar,eng)+'</button>').join('')+'</div><div class="reviews-theater"><div class="reviews-visual"><div class="reviews-stage-floor" aria-hidden="true"></div><img class="reviews-ghost reviews-ghost-before" alt="" aria-hidden="true"><img class="reviews-ghost reviews-ghost-after" alt="" aria-hidden="true"><button type="button" class="reviews-main-frame"><span class="reviews-frame-top"><span class="reviews-frame-source"></span><span class="reviews-frame-index" dir="ltr"></span></span><span class="reviews-photo"><img class="reviews-main-image" decoding="async" alt=""></span><span class="reviews-frame-bottom">'+t('اضغط لقراءة المحادثة','Tap to read the conversation')+' <span aria-hidden="true">↗</span></span></button></div><aside class="reviews-story-copy"><span class="reviews-story-overline"></span><h3 class="reviews-story-title"></h3><p>'+t('اللقطة الأصلية قدامك. افتحها بالحجم الكامل، وكبّر التفاصيل واقرأ المحادثة براحتك.','The original screenshot is here. Open the full image, zoom in and read the conversation at your own pace.')+'</p><button type="button" class="reviews-read">'+t('افتح المحادثة كاملة','Read the full conversation')+' <span aria-hidden="true">↗</span></button><div class="reviews-privacy"><span aria-hidden="true">✓</span><div><b>'+t('خصوصيتهم محفوظة','Privacy protected')+'</b><small>'+t('بيانات التواصل ظاهرة جزئيًا، وكلمات المرور وأكواد الدخول مخفية.','Contact details are partially visible; passwords and access codes are hidden.')+'</small></div></div><div class="reviews-playback"><div class="reviews-step-buttons"><button type="button" data-review-step="-1" aria-label="'+t('اللقطة السابقة','Previous story')+'">←</button><button type="button" data-review-step="1" aria-label="'+t('اللقطة التالية','Next story')+'">→</button></div><span class="reviews-position" dir="ltr"></span><button type="button" class="reviews-play-toggle"></button></div><div class="reviews-timer" aria-hidden="true"><span></span></div></aside></div><div class="reviews-film-header"><span>'+t('اختار لقطة','CHOOSE A STORY')+'</span><small class="reviews-filter-count"></small></div><div class="reviews-filmstrip" role="group" aria-label="'+t('كل لقطات التعاملات','All customer screenshots')+'"></div><p class="reviews-disclaimer">'+t('الصور أجزاء من محادثات العملاء؛ حُجبت معظم البيانات الشخصية لحماية الخصوصية.','Screenshots are excerpts from customer conversations; most personal details are hidden for privacy.')+'</p></div>';
section.querySelectorAll('[data-review-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.reviewFilter;items=captions.map((_,i)=>i).filter(i=>filter==='all'||categories(i).includes(filter));if(!items.includes(active))active=items[0];elapsed=0;renderFilm();paint(false);section.querySelectorAll('[data-review-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.reviewFilter===filter)));});
section.querySelectorAll('[data-review-step]').forEach(b=>b.onclick=()=>step(Number(b.dataset.reviewStep),true));
section.querySelector('.reviews-play-toggle').onclick=()=>{paused=!paused;elapsed=0;updatePlayback();};
section.querySelector('.reviews-read').onclick=e=>open(e.currentTarget);
const frame=section.querySelector('.reviews-main-frame');
frame.onclick=e=>{if(swiped){swiped=false;return;}open(e.currentTarget);};
const visual=section.querySelector('.reviews-visual');
visual.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true;});
visual.addEventListener('pointerleave',()=>{hover=false;visual.style.removeProperty('--reviews-tilt-x');visual.style.removeProperty('--reviews-tilt-y');});
visual.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced.matches)return;const r=visual.getBoundingClientRect();visual.style.setProperty('--reviews-tilt-y',Math.max(-3,Math.min(3,((e.clientX-r.left)/r.width-.5)*6))+'deg');visual.style.setProperty('--reviews-tilt-x',Math.max(-2,Math.min(2,-((e.clientY-r.top)/r.height-.5)*4))+'deg');});
let startX=0;frame.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')startX=e.clientX;});
frame.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&Math.abs(e.clientX-startX)>45){swiped=true;step(e.clientX<startX?1:-1,true);setTimeout(()=>{swiped=false;},350);}});
section.querySelector('.reviews-main-image').addEventListener('load',e=>{if(!reduced.matches&&e.target.animate)e.target.animate([{opacity:.2,transform:'translateX(60px) rotateY(-16deg) scale(.94)'},{opacity:1,transform:'none'}],{duration:900,easing:'cubic-bezier(.22,1,.36,1)'});});
renderFilm();paint(false);
}
function renderFilm(){
const strip=section.querySelector('.reviews-filmstrip');strip.innerHTML=items.map(id=>'<button type="button" class="reviews-thumb" data-review-id="'+id+'" aria-label="'+E(t('عرض: ','Show: ')+(en()?english:captions)[id])+'"><img src="'+path(id,true)+'" loading="lazy" decoding="async" alt=""><span>'+String(id+1).padStart(2,'0')+'</span></button>').join('');
strip.querySelectorAll('[data-review-id]').forEach(b=>b.onclick=()=>{active=Number(b.dataset.reviewId);elapsed=0;paint(true);});
section.querySelector('.reviews-filter-count').textContent=items.length+' '+t('لقطة','screenshots');
}
function paint(animate=true){
const pos=items.indexOf(active),label=(en()?english:captions)[active],source=active===13?'FACEBOOK':'WHATSAPP';
section.querySelector('.reviews-visual').classList.toggle('reviews-single',items.length===1);
const image=section.querySelector('.reviews-main-image');
const changed=image.getAttribute('src')!==path(active);
if(animate&&changed&&!reduced.matches&&image.complete&&image.naturalWidth){
const photo=image.parentElement;photo.querySelectorAll('.reviews-outgoing').forEach(x=>x.remove());
const old=image.cloneNode();old.className='reviews-outgoing';old.alt='';old.setAttribute('aria-hidden','true');photo.append(old);
const exit=old.animate([{opacity:1,transform:'translateX(0) rotateY(0) scale(1)'},{opacity:0,transform:'translateX(-65px) rotateY(16deg) scale(.93)'}],{duration:800,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});exit.onfinish=()=>old.remove();
section.querySelector('.reviews-story-title').animate([{opacity:.2,transform:'translateY(15px)'},{opacity:1,transform:'none'}],{duration:650,easing:'ease-out'});
}
image.src=path(active);image.alt=label;
for(const id of [items[(pos+1)%items.length],items[(pos-1+items.length)%items.length]]){const pre=new Image();pre.src=path(id);}
section.querySelector('.reviews-main-frame').setAttribute('aria-label',t('افتح الصورة: ','Open image: ')+label);
section.querySelector('.reviews-frame-source').textContent=source;
section.querySelector('.reviews-frame-index').textContent=String(active+1).padStart(2,'0')+' / '+captions.length;
section.querySelector('.reviews-story-overline').textContent=t('من آراء عملائنا','CUSTOMER STORIES')+' · '+source;
section.querySelector('.reviews-story-title').textContent=label;
section.querySelector('.reviews-position').textContent=String(pos+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
section.querySelector('.reviews-ghost-before').src=path(items[(pos-1+items.length)%items.length],true);
section.querySelector('.reviews-ghost-after').src=path(items[(pos+1)%items.length],true);
section.querySelectorAll('[data-review-id]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.reviewId)===active)));
const thumb=section.querySelector('[data-review-id="'+active+'"]'),strip=section.querySelector('.reviews-filmstrip');
if(thumb)strip.scrollTo({left:Math.max(0,thumb.offsetLeft-strip.clientWidth/2+thumb.offsetWidth/2),behavior:animate&&!reduced.matches?'smooth':'auto'});
if(dialog.open){large.src=path(active);large.alt=label;dialogTitle.textContent=(active+1)+' / '+captions.length+' — '+label;dialog.classList.remove('is-zoomed');updateZoom();}
updatePlayback();
}
function updatePlayback(){const b=section.querySelector('.reviews-play-toggle');b.textContent=paused?t('تشغيل العرض','Play'):t('إيقاف العرض','Pause');b.setAttribute('aria-pressed',String(paused));section.classList.toggle('reviews-paused',paused||reduced.matches);}
function step(delta,manual=false){active=items[(items.indexOf(active)+delta+items.length)%items.length];elapsed=0;paint(true);}
section.addEventListener('focusin',()=>focused=true);section.addEventListener('focusout',e=>{focused=section.contains(e.relatedTarget);elapsed=0;});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;section.classList.toggle('reviews-visible',visible);},{threshold:.15}).observe(section);
reduced.addEventListener('change',e=>{if(e.matches)paused=true;updatePlayback();});
new MutationObserver(()=>mount()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
function tick(time){const dt=Math.min(50,time-last);last=time;const running=visible&&!paused&&!hover&&!dialog.open&&!document.hidden&&!reduced.matches;section.classList.toggle('reviews-running',running);if(running){elapsed+=dt;if(elapsed>=4800)step(1);section.querySelector('.reviews-timer>span').style.transform='scaleX('+Math.min(1,elapsed/4800)+')';}requestAnimationFrame(tick);}
mount();requestAnimationFrame(tick);
})();