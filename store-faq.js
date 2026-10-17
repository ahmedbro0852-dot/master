(async function(){
'use strict';
await window.MasterCatalogReady;
const host=document.querySelector('main');if(!host)return;
const box=document.createElement('section');box.className='store-faq';box.id='faq';host.append(box);
const t=(ar,en)=>window.MasterLocale?.getState().language==='en'?en:ar;
const esc=x=>window.MasterStore.escapeHtml(x);
function render(){
 const product=window.MasterCatalog?.getProduct(new URLSearchParams(location.search).get('id'));
 const selected=document.querySelector('input[name="plan"]:checked');
 const plan=product?.plans?.[Number(selected?.value||0)];
 const rows=[
 [t('إزاي أطلب الاشتراك؟','How do I order?'),t('اختار الباقة واضغط شراء الآن، ثم تأكيد الطلب أو كمل تسوّق. راجع الملخص وبياناتك وطريقة الدفع، وبعدها افتح رسالة واتساب لمتابعة التأكيد والتنفيذ.','Choose a plan, select Buy now, then check out or keep shopping. Review your order, contact details and payment method, then open WhatsApp to confirm and arrange fulfillment.')],
 [t('إيه الفرق بين حساب جاهز وتفعيل على حسابي؟','Ready account or activation on my account?'),t('الحساب الجاهز يُسلَّم ببيانات الدخول. التفعيل الشخصي يكون على حسابك أو بريدك حسب الباقة. طريقة التفعيل الموضحة في تفاصيل الباقة هي المعتمدة.','A ready account comes with login details. Personal activation uses your account or email according to the plan. Follow the activation method stated in the plan details.')],
 [t('هل كل الباقات بنفس الضمان؟','Do all plans have the same warranty?'),t('الضمان بيختلف حسب الباقة، وممكن يختلف عن مدة الاشتراك. راجع خانة الضمان قبل الطلب. لو مكتوب بدون ضمان، الباقة لا تشمل ضمانًا. تفاصيل المعالجة عند حدوث مشكلة تُؤكَّد مع الدعم.','Warranty varies by plan and may differ from the subscription term. Check the warranty field before ordering. Plans marked without warranty have none. Confirm how issues are handled with support.')],
 [t('هل الهدايا مع كل الاشتراكات؟','Does every subscription include gifts?'),t('الهدايا مرتبطة بالباقة المختارة، وتظهر في تفاصيلها ورسالة الطلب إن كانت مشمولة. مدة الاشتراك الأساسي وضمانه لا تعني أن الهدايا بنفس المدة أو الضمان.','Gifts depend on the selected plan and appear in its details and order message when included. The main subscription term and warranty do not imply the same term or warranty for gifts.')],
 [t('هل تأكيد الطلب يعني إني دفعت؟','Does confirming an order mean I paid?'),t('لو اخترت تحويلًا خارجيًا، لازم الدعم يؤكد التحويل. رسالة واتساب وحدها ليست إثبات دفع. الدفع بالمحفظة يخصم الرصيد عند نجاح تأكيد الطلب.','For external transfers, support must confirm receipt. A WhatsApp message alone is not proof of payment. Wallet payment deducts the balance when checkout succeeds.')],
 [t('إمتى الاشتراك بيتجهز وإزاي أتابعه؟','When is it ready and how do I follow up?'),t('وقت التجهيز حسب الباقة والتوفر. لو مش مذكور، أكّده مع الدعم قبل الدفع. احتفظ برقم الطلب للمتابعة على واتساب، ولو مسجل دخول هتلاقي الطلبات المحفوظة في حسابك.','Preparation depends on the plan and availability. If no time is listed, confirm it with support before payment. Keep your order reference for WhatsApp follow-up; signed-in orders are also available in your account.')]
 ];
 if(plan){
 const facts=window.MasterOrderDetails.planLines(product,plan);
 rows.unshift([t('إيه تفاصيل الباقة المختارة؟','What does my selected plan include?'),facts.join('\n')]);
 if(/Org/i.test(plan.planType||plan.account||''))rows.splice(1,0,[t('يعني إيه Org؟','What does Org mean?'),t('Org اختصار Organization، يعني مؤسسة أو جهة. اشتراك Plus تابع لها، وإدارة العضوية والوصول من خلالها. مدة الاشتراك والضمان لكل باقة موضّحين بشكل منفصل.','Org stands for Organization. This Plus subscription is linked to an organization that manages membership and access. Each plan lists its subscription term and warranty separately.')]);
 }
 const opened=new Set([...box.querySelectorAll('details[open]')].map(x=>x.dataset.question));
 box.innerHTML='<div class="store-faq-heading"><span>'+t('قبل ما تطلب','Before you order')+'</span><h2>'+t('أسئلة وإجابات','Questions & answers')+'</h2><p>'+t('كل التفاصيل اللي تساعدك تختار وتأكد طلبك.','Details to help you choose and confirm your order.')+'</p></div><div class="store-faq-list">'+rows.map(([q,a])=>'<details data-question="'+esc(q)+'" '+(opened.has(q)?'open':'')+'><summary>'+esc(q)+'<span aria-hidden="true">+</span></summary><div class="store-faq-answer">'+esc(a)+'</div></details>').join('')+'</div>';
}
render();document.addEventListener('change',e=>{if(e.target.matches('input[name="plan"]'))render();});document.addEventListener('masterstore:localechange',render);
})();