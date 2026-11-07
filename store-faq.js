(async function(){
'use strict';
await window.MasterCatalogReady;
const host=document.querySelector('main');if(!host)return;
const box=document.createElement('section');box.className='store-faq';box.id='faq';box.setAttribute('aria-labelledby','faq-title');host.append(box);
const t=(ar,en)=>window.MasterLocale?.getState().language==='en'?en:ar;
const esc=x=>window.MasterStore.escapeHtml(x);
let query='',category='all',opened=null;
const normal=value=>String(value).toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
function content(){
 const rows=[
 [t('إزاي أطلب الاشتراك؟','How do I order?'),t('اختار الباقة واضغط شراء الآن، ثم تأكيد الطلب أو كمل تسوّق. راجع الملخص وبياناتك وطريقة الدفع، وبعدها افتح رسالة واتساب لمتابعة التأكيد والتنفيذ.','Choose a plan, select Buy now, then check out or keep shopping. Review your order, contact details and payment method, then open WhatsApp to confirm and arrange fulfillment.')],
 [t('إيه الفرق بين حساب جاهز وتفعيل على حسابي؟','Ready account or activation on my account?'),t('الحساب الجاهز يُسلَّم ببيانات الدخول. التفعيل الشخصي يكون على حسابك أو بريدك حسب الباقة. طريقة التفعيل الموضحة في تفاصيل الباقة هي المعتمدة.','A ready account comes with login details. Personal activation uses your account or email according to the plan. Follow the activation method stated in the plan details.')],
 [t('هل كل الباقات بنفس الضمان؟','Do all plans have the same warranty?'),t('الضمان بيختلف حسب الباقة، وممكن يختلف عن مدة الاشتراك. راجع خانة الضمان قبل الطلب. لو مكتوب بدون ضمان، الباقة لا تشمل ضمانًا. تفاصيل المعالجة عند حدوث مشكلة تُؤكَّد مع الدعم.','Warranty varies by plan and may differ from the subscription term. Check the warranty field before ordering. Plans marked without warranty have none. Confirm how issues are handled with support.')],
 [t('هل الهدايا مع كل الاشتراكات؟','Does every subscription include gifts?'),t('الهدايا مرتبطة بالباقة المختارة، وتظهر في تفاصيلها ورسالة الطلب إن كانت مشمولة. مدة الاشتراك الأساسي وضمانه لا تعني أن الهدايا بنفس المدة أو الضمان.','Gifts depend on the selected plan and appear in its details and order message when included. The main subscription term and warranty do not imply the same term or warranty for gifts.')],
 [t('هل تأكيد الطلب يعني إني دفعت؟','Does confirming an order mean I paid?'),t('لو اخترت تحويلًا خارجيًا، لازم الدعم يؤكد التحويل. رسالة واتساب وحدها ليست إثبات دفع. الدفع بالمحفظة يخصم الرصيد عند نجاح تأكيد الطلب.','For external transfers, support must confirm receipt. A WhatsApp message alone is not proof of payment. Wallet payment deducts the balance when checkout succeeds.')],
 [t('إمتى الاشتراك بيتجهز وإزاي أتابعه؟','When is it ready and how do I follow up?'),t('وقت التجهيز حسب الباقة والتوفر. لو مش مذكور، أكّده مع الدعم قبل الدفع. احتفظ برقم الطلب للمتابعة على واتساب، ولو مسجل دخول هتلاقي الطلبات المحفوظة في حسابك.','Preparation depends on the plan and availability. If no time is listed, confirm it with support before payment. Keep your order reference for WhatsApp follow-up; signed-in orders are also available in your account.')]
 ];
rows.push(
[t('هل لازم أسجل دخول عشان أطلب؟','Do I need an account to order?'),t('ممكن تطلب كضيف وتتابع على واتساب. تسجيل الدخول بيسمح بحفظ الطلبات في حسابك واستخدام المحفظة، لو فيها رصيد كافي.','You can order as a guest and follow up on WhatsApp. Signing in lets you save orders in your account and use your wallet when it has sufficient balance.')],
[t('أقدر أطلب أكتر من اشتراك مع بعض؟','Can I order multiple subscriptions together?'),t('أيوه، اختار هكمل تسوّق بعد اختيار الباقة. راجع الكميات وخصم الكمية والإجمالي في ملخص الطلب قبل التأكيد.','Yes. Choose Keep shopping after selecting a plan. Review quantities, quantity discount and the final total in the order summary before confirming.')],
[t('لو حصلت مشكلة في الاشتراك أعمل إيه؟','What if there is an issue with my subscription?'),t('تواصل مع الدعم على واتساب برقم الطلب ووصف المشكلة وصورة للخطأ إن وجدت. التعامل مع المشكلة يكون حسب الضمان المذكور للباقة، وأي تفاصيل غير مذكورة تُؤكَّد مع الدعم.','Contact WhatsApp support with your order reference, a description and a screenshot of the error if available. Issues are handled under the stated plan warranty; confirm any unspecified terms with support.')],
[t('هل كل الخدمات متاحة طول الوقت؟','Are all services always available?'),t('التوفر بيتغيّر حسب الخدمة والباقة. الباقات غير المتاحة لا يمكن طلبها، والتوفر النهائي وموعد التنفيذ بيتأكدوا مع الدعم.','Availability varies by service and plan. Unavailable plans cannot be ordered; support confirms final availability and fulfillment timing.')]
);

return rows.map(([question,answer],id)=>({id,question,answer,category:['orders','activation','warranty','warranty','payment','activation','orders','orders','warranty','orders'][id]}));
}
const groups=()=>[['all',t('الكل','All')],['orders',t('الطلبات والحساب','Orders & account')],['payment',t('الدفع','Payment')],['activation',t('التفعيل والتسليم','Activation')],['warranty',t('الضمان والهدايا','Warranty & gifts')]];
function update(){
 const rows=content().filter(x=>(category==='all'||x.category===category)&&normal(x.question+' '+x.answer).includes(normal(query.trim())));
 box.querySelector('.faq-results-count').textContent=rows.length+' '+t('إجابات لمساعدتك','answers to help you');
 box.querySelectorAll('[data-faq-category]').forEach(button=>{const active=button.dataset.faqCategory===category;button.setAttribute('aria-pressed',String(active));});
 box.querySelector('.store-faq-list').innerHTML=rows.length?rows.map(x=>'<details name="store-common-faq" data-question="'+x.id+'" '+(opened===x.id?'open':'')+'><summary><span class="faq-question-number" aria-hidden="true">'+String(x.id+1).padStart(2,'0')+'</span><b>'+esc(x.question)+'</b><span class="faq-plus" aria-hidden="true">+</span></summary><div class="store-faq-answer">'+esc(x.answer)+'</div></details>').join(''):'<div class="faq-no-results"><strong>'+t('مفيش إجابة مطابقة','No matching answers')+'</strong><p>'+t('جرّب كلمة أبسط أو ارجع لكل الأسئلة.','Try a simpler word or return to all questions.')+'</p><button type="button" class="ghost" data-faq-reset>'+t('عرض كل الأسئلة','Show all questions')+'</button></div>';
 box.querySelector('[data-faq-reset]')?.addEventListener('click',()=>{query='';category='all';box.querySelector('#faq-search').value='';update();});
}
function render(){
 box.innerHTML='<div class="faq-layout"><aside class="faq-intro"><span class="faq-eyebrow">'+t('الأسئلة الشائعة','Frequently asked questions')+'</span><div class="faq-mark" aria-hidden="true">؟</div><h2 id="faq-title">'+t('عندك سؤال؟','Have a question?')+'<br><em>'+t('إجابته هنا.','Find your answer here.')+'</em></h2><p>'+t('كل اللي تحتاج تعرفه عن الطلب والتفعيل والضمان في مكان واحد.','Everything you need to know about ordering, activation and warranties in one place.')+'</p><a href="https://wa.me/201500950624" target="_blank" rel="noopener" class="faq-support">'+t('لسه محتاج مساعدة؟ تواصل معانا','Still need help? Contact us')+' <span aria-hidden="true">↗</span></a></aside><div class="faq-content"><div class="faq-tools"><label class="faq-search" for="faq-search"><span aria-hidden="true">⌕</span><input id="faq-search" type="search" placeholder="'+t('اكتب سؤالك أو كلمة زي: ضمان، دفع…','Search: warranty, payment…')+'" aria-label="'+t('ابحث في الأسئلة الشائعة','Search frequently asked questions')+'" value="'+esc(query)+'" autocomplete="off"></label><div class="faq-categories" role="group" aria-label="'+t('تصنيف الأسئلة','Question categories')+'">'+groups().map(([id,label])=>'<button type="button" data-faq-category="'+id+'" aria-pressed="'+(id===category)+'">'+label+'</button>').join('')+'</div><p class="faq-results-count" aria-live="polite"></p></div><div class="store-faq-list"></div></div></div>';
 box.querySelector('#faq-search').addEventListener('input',e=>{query=e.target.value;update();});
 box.querySelectorAll('[data-faq-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.faqCategory;update();}));
 update();
}
box.addEventListener('toggle',e=>{if(e.target.tagName!=='DETAILS')return;if(e.target.open){opened=Number(e.target.dataset.question);box.querySelectorAll('details[open]').forEach(x=>{if(x!==e.target)x.open=false;});}else if(opened===Number(e.target.dataset.question))opened=null;},true);
render();document.addEventListener('masterstore:localechange',render);
})();