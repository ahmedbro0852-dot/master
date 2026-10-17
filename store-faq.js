(async function(){
'use strict';
await window.MasterCatalogReady;
const host=document.querySelector('main');if(!host)return;
const box=document.createElement('section');box.className='store-faq';box.id='faq';host.append(box);
const t=(ar,en)=>window.MasterLocale?.getState().language==='en'?en:ar;
const esc=x=>window.MasterStore.escapeHtml(x);
let chosenService='';
function serviceQuestions(product,plan){
 const text=(value,kind)=>window.MasterLocale?.catalogText(value,kind,product.id)??String(value??'');
 const title=product.name, rows=[];
 const features=(t('ar','en')==='en'?(plan.featuresEn||product.featuresEn):null)||plan.features||product.features||[];
 rows.push([t('إيه مميزات '+title+'؟','What does '+title+' offer?'),text(product.description,'description')+(features.length?'\n'+features.map(x=>'• '+text(x,'feature')).join('\n'):'')]);
 const available=(product.plans||[]).filter(x=>!x.hidden&&x.available!==false);
 rows.push([t('إيه باقات '+title+' المتاحة وأسعارها؟','Which '+title+' plans and prices are available?'),product.status!=='available'?t('الخدمة غير متاحة للطلب حاليًا. تابع الدعم لمعرفة التوفر.','This service is currently unavailable. Ask support about availability.'):available.map(x=>'• '+text(x.name||x.duration,'planName')+' — '+window.MasterStore.planMoney(x)+'\n'+t('المدة: ','Duration: ')+text(x.duration,'duration')+' · '+t('الضمان: ','Warranty: ')+text(x.warranty||'يُؤكد قبل الدفع','warranty')).join('\n')||t('لا توجد باقة متاحة حاليًا.','No plans currently available.')]);
 if(!plan)return rows;
 rows.push([t('اشتراك '+title+' بيتفعّل إزاي وعلى أي حساب؟','How is '+title+' activated, and on which account?'),t('الحساب: ','Account: ')+text(plan.account||'يُؤكد قبل الدفع','account')+'\n'+t('التفعيل: ','Activation: ')+text(plan.activation||'يُؤكد قبل الدفع','activation')]);
 rows.push([t('مدة الباقة المختارة في '+title+' وضمانها قد إيه؟','What are the selected '+title+' plan term and warranty?'),t('مدة الاشتراك: ','Subscription term: ')+text(plan.duration,'duration')+'\n'+t('الضمان: ','Warranty: ')+text(plan.warranty||'يُؤكد قبل الدفع','warranty')+'\n'+t('مدة الضمان تُقرأ بشكل منفصل عن مدة الاشتراك.','The warranty period is separate from the subscription term.')]);
 if(plan.credits)rows.push([t('الرصيد في باقة '+title+' قد إيه؟','How many credits come with this '+title+' plan?'),text(plan.credits,'credits')+'\n'+t('قواعد التجدد أو الانتهاء حسب التفاصيل المذكورة؛ أي حد غير مذكور يُؤكد مع الدعم قبل الدفع.','Renewal and expiry follow the stated plan details; confirm any unspecified limits with support before payment.')]);
 const gifts=window.MasterOrderDetails.planLines(product,plan).find(x=>x.startsWith(t('الهدايا:','Gifts:')));
 if(gifts)rows.push([t('إيه الهدايا مع باقة '+title+' المختارة؟','Which gifts come with the selected '+title+' plan?'),gifts+'\n'+t('الهدايا المذكورة مشمولة بدون تكلفة إضافية. ضمان الاشتراك الأساسي لا يحدد ضمان الهدايا.','Listed gifts are included at no extra charge. The main subscription warranty does not define the gifts warranty.')]);
 const notes=[...(plan.notes||[]),...(plan.note?[plan.note]:[])];
 if(notes.length)rows.push([t('إيه الشروط والملاحظات المهمة قبل طلب '+title+'؟','What should I know before ordering '+title+'?'),notes.map(x=>'• '+text(x,'note')).join('\n')]);
 if(/Org/i.test([plan.planType,plan.account].join(' ')))rows.push([t('يعني إيه Org في '+title+'؟','What does Org mean for '+title+'?'),t('Org اختصار Organization، أي مؤسسة أو جهة. العضوية والوصول يُداران من خلال المؤسسة. الباقة المستقلة موضح أنها غير تابعة لـOrg.','Org stands for Organization. The organization manages membership and access. A standalone plan is explicitly marked as independent of an Org.')]);
 if(plan.officialPrice&&plan.priceComparison?.status!=='unavailable')rows.push([t('نسبة التوفير في '+title+' محسوبة إزاي؟','How are '+title+' savings calculated?'),t('نقارن سعر الباقة بمرجع السعر الرسمي الموضح لنفس المدة، مع تحويل العملة حسب إعدادات المتجر.','The plan price is compared with the listed official reference for the same term, using the store currency settings.')+(plan.priceComparison?.note?'\n'+text(plan.priceComparison.note,'note'):'')]);
 return rows;
}
window.MasterServiceFAQ={questions:serviceQuestions};
function render(){
 const pageId=new URLSearchParams(location.search).get('id');
 const product=window.MasterCatalog?.getProduct(pageId||chosenService);
 const selected=document.querySelector('input[name="plan"]:checked');
 const plan=selected?product?.plans?.[Number(selected.value)]:product?.plans?.find(x=>!x.hidden&&x.available!==false)||product?.plans?.find(x=>!x.hidden);
 const rows=[
 [t('إزاي أطلب الاشتراك؟','How do I order?'),t('اختار الباقة واضغط شراء الآن، ثم تأكيد الطلب أو كمل تسوّق. راجع الملخص وبياناتك وطريقة الدفع، وبعدها افتح رسالة واتساب لمتابعة التأكيد والتنفيذ.','Choose a plan, select Buy now, then check out or keep shopping. Review your order, contact details and payment method, then open WhatsApp to confirm and arrange fulfillment.')],
 [t('إيه الفرق بين حساب جاهز وتفعيل على حسابي؟','Ready account or activation on my account?'),t('الحساب الجاهز يُسلَّم ببيانات الدخول. التفعيل الشخصي يكون على حسابك أو بريدك حسب الباقة. طريقة التفعيل الموضحة في تفاصيل الباقة هي المعتمدة.','A ready account comes with login details. Personal activation uses your account or email according to the plan. Follow the activation method stated in the plan details.')],
 [t('هل كل الباقات بنفس الضمان؟','Do all plans have the same warranty?'),t('الضمان بيختلف حسب الباقة، وممكن يختلف عن مدة الاشتراك. راجع خانة الضمان قبل الطلب. لو مكتوب بدون ضمان، الباقة لا تشمل ضمانًا. تفاصيل المعالجة عند حدوث مشكلة تُؤكَّد مع الدعم.','Warranty varies by plan and may differ from the subscription term. Check the warranty field before ordering. Plans marked without warranty have none. Confirm how issues are handled with support.')],
 [t('هل الهدايا مع كل الاشتراكات؟','Does every subscription include gifts?'),t('الهدايا مرتبطة بالباقة المختارة، وتظهر في تفاصيلها ورسالة الطلب إن كانت مشمولة. مدة الاشتراك الأساسي وضمانه لا تعني أن الهدايا بنفس المدة أو الضمان.','Gifts depend on the selected plan and appear in its details and order message when included. The main subscription term and warranty do not imply the same term or warranty for gifts.')],
 [t('هل تأكيد الطلب يعني إني دفعت؟','Does confirming an order mean I paid?'),t('لو اخترت تحويلًا خارجيًا، لازم الدعم يؤكد التحويل. رسالة واتساب وحدها ليست إثبات دفع. الدفع بالمحفظة يخصم الرصيد عند نجاح تأكيد الطلب.','For external transfers, support must confirm receipt. A WhatsApp message alone is not proof of payment. Wallet payment deducts the balance when checkout succeeds.')],
 [t('إمتى الاشتراك بيتجهز وإزاي أتابعه؟','When is it ready and how do I follow up?'),t('وقت التجهيز حسب الباقة والتوفر. لو مش مذكور، أكّده مع الدعم قبل الدفع. احتفظ برقم الطلب للمتابعة على واتساب، ولو مسجل دخول هتلاقي الطلبات المحفوظة في حسابك.','Preparation depends on the plan and availability. If no time is listed, confirm it with support before payment. Keep your order reference for WhatsApp follow-up; signed-in orders are also available in your account.')]
 ];
 if(product)rows.unshift(...serviceQuestions(product,plan));
 const services=(window.MasterCatalog?.products||[]).filter(x=>!x.redirectTo);
 const selector=pageId?'':'<div class="service-faq-picker"><label for="faqService">'+t('أسئلة عن خدمة معينة','Questions about a specific service')+'</label><select id="faqService"><option value="">'+t('اختار الخدمة لعرض أسئلتها','Choose a service to see its questions')+'</option>'+services.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===chosenService?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></div>';
 const opened=new Set([...box.querySelectorAll('details[open]')].map(x=>x.dataset.question));
 box.innerHTML='<div class="store-faq-heading"><span>'+t('قبل ما تطلب','Before you order')+'</span><h2>'+(pageId&&product?t('أسئلة عن '+product.name,product.name+' questions'):t('أسئلة وإجابات','Questions & answers'))+'</h2><p>'+t('كل التفاصيل اللي تساعدك تختار وتأكد طلبك.','Details to help you choose and confirm your order.')+'</p></div>'+selector+'<div class="store-faq-list">'+rows.map(([q,a])=>'<details data-question="'+esc(q)+'" '+(opened.has(q)?'open':'')+'><summary>'+esc(q)+'<span aria-hidden="true">+</span></summary><div class="store-faq-answer">'+esc(a)+'</div></details>').join('')+'</div>';
}
render();document.addEventListener('change',e=>{if(e.target.matches('input[name="plan"]'))render();if(e.target.id==='faqService'){chosenService=e.target.value;render();}});document.addEventListener('masterstore:localechange',render);
})();