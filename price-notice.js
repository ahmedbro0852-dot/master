(function(){
'use strict';
const designs=[
{id:1,name:'البطاقة المتوازنة',description:'شعار المتجر ونص واضح في بطاقة صغيرة ومتوازنة.'},
{id:2,name:'التقسيم الرأسي',description:'شريط جانبي للشعار ومساحة بيضاء للنص.'},
{id:3,name:'شريط الهوية',description:'شريط علوي للشعار فوق التنويه الرسمي.'},
{id:4,name:'الخطاب الرسمي',description:'تكوين يشبه خطاب المتجر، بهوية رسمية نظيفة.'},
{id:5,name:'التنبيه المختصر',description:'شعار وعنوان في تكوين مختصر وبسيط.'},
{id:6,name:'النسخة الليلية',description:'كحلي وذهبي مع الشعار والعنوان في المنتصف.'},
{id:7,name:'الخبر الصحفي',description:'عنوان تحريري وفاصل وأعمدة كصفحة أخبار مصغرة.'},
{id:8,name:'التذكرة',description:'حواف تذكرة وفواصل منقطة وتكوين رأسي.'},
{id:9,name:'فقاعة الرسالة',description:'شعار واضح داخل فقاعة تنويه زرقاء.'},
{id:10,name:'الإطار الهندسي',description:'إطار كحلي وتقسيم قطري يحمل شعار المتجر.'}
];
const copy='<p class="pn-copy"><img class="pn-emoji" src="images/notice-emoji/1f4b5.svg" width="17" height="17" alt="" aria-hidden="true"> نعتذر عن تعديل بعض أسعار الاشتراكات، تأثرًا بارتفاع سعر الدولار بأكثر من <b>١٠٪</b>.</p>';
const emoji=(code)=>'<img class="pn-emoji" src="images/notice-emoji/'+code+'.svg" width="17" height="17" alt="" aria-hidden="true">';
const logo='<img class="pn-logo" src="master-store-logo.svg" width="108" height="32" alt="ماستر ستور">';
function markup(id,live=false){
 const d=designs.find(x=>x.id===id)||designs[0],title='<h2 class="pn-title"'+(live?' id="pnTitle"':'')+'>'+emoji('1f514')+' تنويه بتحديث الأسعار</h2>',thanks='<p class="pn-thanks">'+emoji('1f64f')+' شكرًا لتفهمكم وثقتكم.</p>',action=live?'<button class="pn-ack" type="button" data-pn-close>اطّلعت على التنويه</button>':'<span class="pn-ack">اطّلعت على التنويه</span>',foot='<footer class="pn-footer">'+thanks+action+'</footer>';
 let body='';
 switch(d.id){
 case 1:body='<header class="pn-brandline">'+logo+'<span>لعملائنا الكرام</span></header>'+title+copy+foot;break;
 case 2:body='<div class="pn-media">'+logo+'</div><div class="pn-content">'+title+copy+foot+'</div>';break;
 case 3:body='<div class="pn-cinema">'+logo+'</div><div class="pn-content">'+title+copy+foot+'</div>';break;
 case 4:body='<header class="pn-letterhead">'+logo+'<span>إشعار للعملاء</span></header>'+title+copy+foot;break;
 case 5:body='<div class="pn-minihead"><div>'+logo+title+'</div></div>'+copy+foot;break;
 case 6:body=logo+'<span class="pn-overline">تنويه مهم لعملائنا</span>'+title+copy+foot;break;
 case 7:body='<header class="pn-masthead"><b>أخبار المتجر</b>'+logo+'</header><span class="pn-overline">تحديث يخص أسعار الاشتراكات</span>'+title+'<div class="pn-columns">'+copy+'</div>'+foot;break;
 case 8:body='<header class="pn-tickethead">'+logo+'<span>تنويه للعملاء</span></header>'+title+'<div class="pn-ticketbody">'+copy+'</div>'+foot;break;
 case 9:body='<div class="pn-bubble">'+logo+title+copy+foot+'</div>';break;
 case 10:body='<div class="pn-geometry">'+logo+'</div><div class="pn-content">'+title+copy+foot+'</div>';break;
 }
 return '<article class="pn-card pn-v'+d.id+'" dir="rtl">'+(live?'<button class="pn-x" data-pn-close type="button" aria-label="إغلاق التنويه">×</button>':'')+body+'</article>';
}
const dialog=document.createElement('dialog');dialog.id='priceNoticeDialog';dialog.className='pn-dialog';dialog.setAttribute('aria-labelledby','pnTitle');document.body.append(dialog);
const key='master-price-notice-logo-design6-20261024',gallery=document.body.hasAttribute('data-notice-gallery');let previous=null;
function dismissed(){try{return sessionStorage.getItem(key)==='dismissed';}catch{return false;}}
function close(){if(dialog.open)dialog.close();}
function open(id){const d=designs.find(x=>x.id===Number(id))||designs[0];previous=document.activeElement;dialog.innerHTML=markup(d.id,true);dialog.dataset.design=String(d.id);dialog.querySelectorAll('[data-pn-close]').forEach(b=>b.onclick=close);if(!dialog.open){dialog.showModal();document.documentElement.classList.add('pn-open');}}
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('pn-open');if(!gallery){try{sessionStorage.setItem(key,'dismissed');}catch{}}if(previous?.isConnected&&previous!==document.body)previous.focus({preventScroll:true});});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});
if(gallery){const root=document.getElementById('noticeDesigns');root.innerHTML=designs.map(d=>'<section class="pn-option"><header><span>'+String(d.id).padStart(2,'0')+'</span><div><h2>'+d.name+'</h2><p>'+d.description+'</p></div></header><div class="pn-sample" aria-hidden="true">'+markup(d.id)+'</div><div class="pn-option-actions"><button type="button" data-preview="'+d.id+'">معاينة في منتصف الشاشة</button><a href="index.html?notice_design='+d.id+'">تجربته داخل المتجر ↗</a></div></section>').join('');root.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>open(b.dataset.preview));
}else{const requested=new URLSearchParams(location.search).get('notice_design');if(requested&&/^(?:[1-9]|10)$/.test(requested))open(+requested);else if(!dismissed())open(6);}
})();
