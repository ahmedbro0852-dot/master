(function(){
'use strict';
const root=document.getElementById('deliveryContent');
const caseId=new URLSearchParams(location.search).get('case')||'paid-known';
const validCases=['paid-known','paid-empty','unpaid-known','unpaid-empty'];
const selected=validCases.includes(caseId)?caseId:'paid-known';
let paid=selected.startsWith('paid-'),known=selected.endsWith('-known');
let muted=false,audio=null,revealTimer=null;
function prepareSound(){
 if(muted)return;
 try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;audio=audio||new Context();audio.resume().catch(()=>{});}catch{}
}
function playOpenSound(){
 if(muted||!audio||audio.state!=='running')return;
 try{
  const now=audio.currentTime;
  [523.25,659.25,783.99,1046.5].forEach((frequency,index)=>{
   const oscillator=audio.createOscillator(),gain=audio.createGain(),start=now+index*.09;
   oscillator.type='sine';oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.055,start+.015);gain.gain.exponentialRampToValueAtTime(.001,start+.42);
   oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(start);oscillator.stop(start+.45);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  });
 }catch{}
}

function draw(){
 root.classList.remove('gift-open');
 root.innerHTML='<section class="panel"><span class="badge">عرض تجريبي — لا يوجد حساب أو دفع حقيقي</span><h1>جرّب صندوق ChatGPT Plus</h1><div class="row"><a href="?case=paid-known">مدفوع + بيانات موجودة</a><a href="?case=paid-empty">مدفوع + بدون بيانات</a><a href="?case=unpaid-known">غير مدفوع + بيانات موجودة</a><a href="?case=unpaid-empty">غير مدفوع + بدون بيانات</a></div><p class="muted">أي بيانات تكتبها هنا للتجربة داخل الصفحة فقط؛ لا تُرسل ولا تتسجل في الإدارة.</p></section><section class="panel delivery-hero"><span class="kicker">ChatGPT Plus · حساب افتراضي</span><h2>'+ (paid?'الدفع مؤكد — الصندوق جاهز':'بانتظار تأكيد الدفع — الصندوق مغلق')+'</h2>'+'<div class="gift-scene" aria-hidden="true"><div class="gift-halo"></div><div class="gift-box"><div class="gift-face gift-front"></div><div class="gift-face gift-back"></div><div class="gift-face gift-left"></div><div class="gift-face gift-right"></div><div class="gift-face gift-bottom"></div><div class="gift-lid"><div class="gift-face gift-top"><span>✦</span></div><div class="gift-lid-edge"></div></div></div><span class="gift-particle particle-one">✦</span><span class="gift-particle particle-two">✧</span><span class="gift-particle particle-three">✦</span></div><button type="button" class="sound-toggle secondary" id="deliverySound" aria-pressed="false">الصوت مفعّل ♪ — اضغط للكتم</button>'+(known?'<p>الاسم: عميل تجريبي<br>واتساب: محفوظ مسبقًا في هذه المحاكاة</p>':'<p>بيانات العميل لم تُضف مسبقًا؛ سيُطلب الاسم وواتساب.</p>')+'<form id="demoForm">'+(!known?'<label>الاسم<input name="name" required maxlength="120" autocomplete="off" placeholder="اسم للتجربة"></label><label>واتساب تجريبي<input name="phone" required maxlength="20" inputmode="tel" placeholder="رقم للتجربة فقط" autocomplete="off"></label>':'')+'<button type="submit" class="primary" '+(!paid?'disabled':'')+'>'+(paid?'افتح الصندوق واستلم':'الاستلام متوقف حتى تأكيد الدفع')+'</button></form>'+(!paid?'<button type="button" id="simulatePayment" class="secondary">للتجربة فقط: حاكي تأكيد الدفع</button><p class="muted">هذا الزر موجود في العرض التجريبي فقط، ولا يعتمد أي دفع حقيقي.</p>':'')+'</section>';
 const sound=document.getElementById('deliverySound');sound.setAttribute('aria-pressed',String(muted));sound.textContent=muted?'الصوت مكتوم — اضغط للتفعيل':'الصوت مفعّل ♪ — اضغط للكتم';sound.onclick=()=>{muted=!muted;sound.setAttribute('aria-pressed',String(muted));sound.textContent=muted?'الصوت مكتوم — اضغط للتفعيل':'الصوت مفعّل ♪ — اضغط للكتم';};
 document.getElementById('simulatePayment')?.addEventListener('click',()=>{const form=document.getElementById('demoForm'),name=form.elements.name?.value||'',phone=form.elements.phone?.value||'';paid=true;draw();const next=document.getElementById('demoForm');if(next.elements.name){next.elements.name.value=name;next.elements.phone.value=phone;}});
 document.getElementById('demoForm').onsubmit=event=>{
  event.preventDefault();if(!paid)return;const form=event.currentTarget;if(!form.reportValidity())return;
  prepareSound();root.classList.add('gift-open');form.querySelector('button').disabled=true;
  // Sound is gesture-initiated. Audio restrictions never prevent the demo reveal.
  const name=known?'عميل تجريبي':form.elements.name.value;
  setTimeout(()=>{playOpenSound();},80);
  revealTimer=setTimeout(()=>{
   root.innerHTML='<section class="panel"><span class="badge">تم فتح الصندوق التجريبي ✓</span><h1>مبروك استلامك 🎁</h1><p id="demoName"></p><h2>ChatGPT Plus — بيانات افتراضية</h2><pre class="secret">Email: demo@example.invalid\nPassword: DEMO-ONLY-NOT-A-REAL-ACCOUNT</pre><h2>تعليمات نموذجية</h2><p>في الطلب الحقيقي ستظهر هنا بيانات الحساب وطريقة الدخول والضمان التي أضافتها الإدارة.</p><p class="muted">لم يحدث دفع أو إنشاء طلب أو تسليم حساب فعلي. لا يمكن استخدام بيانات هذا المثال لتسجيل الدخول.</p><a class="primary" href="?case='+selected+'">جرّب نفس الحالة من جديد</a></section>';
   document.getElementById('demoName').textContent='أهلًا '+name+'، دي معاينة لشكل الاستلام فقط.';
  },matchMedia('(prefers-reduced-motion: reduce)').matches?0:1400);
 };
 root.setAttribute('aria-busy','false');
}
draw();
})();
