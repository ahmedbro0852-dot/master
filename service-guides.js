/* Product-specific buyer guides. Values and plan indices come from the live catalogue. */
(function(root,factory){const api=factory(root,typeof module==='object'&&module.exports?require('./product-guide-profiles.js'):root.MasterProductGuideProfiles);if(typeof module==='object'&&module.exports)module.exports=api;else root.MasterServiceGuides=api;})(typeof window==='undefined'?globalThis:window,function(root,profiles){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanFacts=items=>[...new Set(items||[])].filter(x=>x&&!/\d[^\n]*(?:جنيه|\bEGP\b|\$)/.test(x));
function summary(id,en=false){return profiles?.[id]?.[en?'introEn':'intro']||'';}
function render(id,en=false,route,options={}){
 const p=options.product||root.MasterCatalog?.getProduct(id),copy=profiles?.[id];
 // Windows already has a full edition-by-edition guide; keep it in one place.
 if(!p||p.redirectTo||id==='windows-pro'||!copy)return '';
 const ui=(ar,english)=>en?english:ar,txt=key=>copy[en?key+'En':key];
 const displayNames={'supergrok-coursera-bundle':'SuperGrok + Coursera Plus','we-gold-discount':'WE Gold — Home Internet Discount','chatgpt-teachers-k12':'ChatGPT for K12 Teachers'};
 const name=en?(displayNames[id]||p.name):p.name;
 const translate=options.translate||((v,kind)=>en&&root.MasterLocale?root.MasterLocale.catalogText(v,kind,id):String(v||''));
 const featuresFor=options.featuresFor||((plan)=>root.MasterProductFeatures?.list(p,plan,en,translate)||[]);
 const path=typeof route==='string'&&/^\/(?!\/)[^<>]*$/.test(route)?route:'/products/'+id+'.html';
 const href=s=>esc(path+'#guide-'+id+'-'+s),visible=(p.plans||[]).map((plan,index)=>({plan,index})).filter(x=>!x.plan.hidden);
 const available=(plan,index)=>{const row=options.priceRows?.find(r=>r.product_id===id&&Number(r.plan_index)===index);return p.status==='available'&&(row?row.available===true:plan.available!==false)&&!(plan.offerEndsAt&&Date.now()>=Date.parse(plan.offerEndsAt));};
 const section=(key,title,body)=>'<section class="product-guide-section" id="guide-'+esc(id)+'-'+key+'"><h3>'+esc(title)+'</h3>'+body+'</section>';
 const facts=cleanFacts(featuresFor({}));
 const cards=visible.map(({plan,index})=>{
  const values=[
   [ui('المدة','Term'),translate(plan.duration||ui('تُؤكد قبل الدفع','Confirm before payment'),'duration')],
   [ui('نوع الحساب','Account type'),translate(plan.account||plan.accountType||plan.activation||ui('يُؤكد قبل الدفع','Confirm before payment'),'accountType')],
   [ui('الضمان','Warranty'),translate(plan.warranty||ui('يُؤكد قبل الدفع','Confirm before payment'),'warranty')]
  ];
  if(plan.activation)values.push([ui('طريقة التسليم والتفعيل','Delivery and activation'),translate(plan.activation,'activation')]);
  if(plan.credits)values.push([ui('الرصيد','Allowance'),translate(plan.credits,'credits')]);
  const specificFacts=cleanFacts(featuresFor(plan)).filter(f=>!facts.includes(f));
  const url=new URL(path,'https://master-pi-six.vercel.app');url.searchParams.set('plan',index);url.hash='';
  return '<section class="product-guide-plan" data-guide-plan="'+index+'"><h4>'+esc(translate(plan.name||p.name,'planName'))+'</h4><p class="product-guide-plan-state">'+ui('حالة الباقة: ','Plan status: ')+ (available(plan,index)?ui('متاحة حسب التوفر الحالي','Available subject to current stock'):ui('غير متاحة للطلب حاليًا','Currently unavailable to order'))+'</p><dl>'+values.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>'+(specificFacts.length?'<ul>'+specificFacts.map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul>':'')+'<a class="product-guide-plan-link" href="'+esc(url.pathname+url.search)+'">'+ui('عرض السعر والتفاصيل لهذه الباقة','View this plan’s price and details')+'</a></section>';
 }).join('');
 const parts=[
  ['uses',ui('كيف تستفيد من '+name+'؟','How to use '+name),'<p>'+esc(txt('intro'))+'</p>'],
  ['features',ui('شرح المميزات والأدوات','Features and tools'),facts.length?'<ul class="product-guide-feature-list">'+facts.map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul><p>'+ui('راجع الميزة التي تحتاجها ضمن تفاصيل الباقة؛ حدود الرصيد والإصدار وطريقة الوصول موضحة لكل اختيار أدناه.','Match the features you need to the plan details below; allowance, edition, and access method are specific to each option.')+'</p>':'<p>'+ui('المميزات التفصيلية والحصص تختلف بين الخطط؛ اقرأ وصف كل باقة أدناه قبل الاختيار.','Detailed features and allowances vary between plans; read each offer below before choosing.')+'</p>'],
  ['workflow',ui('طريقة عملية للاستفادة من الخدمة','A practical workflow'),'<p>'+esc(txt('workflow'))+'</p>'],
  ['plans',ui('الفروق بين الباقات والتسليم والضمان','Plan differences, delivery, and warranty'),'<p>'+ui('قارن طريقة الاستلام والمدة والرصيد، ثم افتح الباقة لمراجعة السعر الحالي. تبقى شروط كل باقة منفصلة عن بقية الخيارات.','Compare delivery, term, and allowance, then open a plan to check its current price. Each option keeps its own terms.')+'</p>'+(cards||'<p>'+ui('لا توجد باقة قابلة للطلب حاليًا. اسأل الدعم عن التفاصيل عند إعلان التوفر.','There is no orderable plan currently listed. Ask support for details when availability is announced.')+'</p>')],
  ['before-order',ui('ما الذي يجب مراجعته قبل الطلب؟','What to check before ordering'),'<p>'+esc(txt('check'))+'</p>'],
  ['questions',ui('أسئلة شائعة عن '+name,'Common questions about '+name),'<h4>'+ui('هل مدة الاشتراك هي مدة الضمان؟','Is the subscription term the warranty term?')+'</h4><p>'+ui('المدة والضمان بندان منفصلان. راجع القيم الموضحة لكل باقة؛ لا يمتد ضمان باقة إلى أخرى لمجرد أن اسم الخدمة واحد.','The subscription and warranty terms are separate. Read each plan’s values; one offer’s warranty does not carry over to another simply because the service name matches.')+'</p><h4>'+ui('كيف أختار الباقة وأكمل الطلب؟','How do I choose a plan and order?')+'</h4><p>'+ui('افتح رابط الباقة المناسبة، وراجع السعر والمدة والتسليم، ثم أضفها للسلة. عند استكمال الطلب يعاد التحقق من السعر والتوفر. يمكنك مراجعة سياسة المتجر قبل الدفع.','Open the relevant plan, review price, term, and delivery, and add it to your cart. Checkout rechecks price and availability. Review the store policy before paying.')+' <a href="/warranty.html">'+ui('سياسة الضمان والاستبدال','Warranty and replacement policy')+'</a></p>']
 ];
 const tags=p.categories||[],related=(options.catalog||root.MasterCatalog?.products||[]).filter(x=>x.id!==id&&!x.redirectTo&&x.status==='available'&&(x.categories||[]).some(c=>tags.includes(c))).slice(0,3);
 if(related.length)parts.push(['related',ui('خدمات مرتبطة يمكنك مقارنتها','Related services to compare'),'<p>'+ui('روابط لخدمات قريبة في الاستخدام. قارن الوظيفة المطلوبة وطريقة التفعيل والرصيد قبل الاختيار، فهذه العروض ليست بدائل متطابقة.','Explore services with related uses. Compare the required function, activation method, and allowance; these offers are not identical substitutes.')+'</p><ul>'+related.map(x=>'<li><a href="/products/'+esc(x.id)+'.html">'+esc(translate(x.name,'productName'))+'</a></li>').join('')+'</ul>']);
 const sources=[...new Set((p.plans||[]).flatMap(plan=>[plan.priceComparison?.source,plan.officialPrice?.source]).filter(Boolean))].filter(u=>{try{const x=new URL(u);return x.protocol==='https:'&&!x.username&&!x.password;}catch{return false;}}).slice(0,3);
 return '<article class="product-guide" id="subscription-guide" aria-labelledby="subscription-guide-title" data-no-translate="true"><div class="product-guide-heading"><span>'+ui('دليل الخدمة والباقات','SERVICE AND PLAN GUIDE')+'</span><h2 id="subscription-guide-title">'+esc(ui('مميزات '+name+' واستخداماته وتفاصيل الباقات',name+': features, uses, and plan details'))+'</h2><p>'+esc(txt('intro'))+'</p></div><details class="guide-disclosure"><summary><span class="guide-show-more">'+ui('عرض المزيد','Show more')+'</span><span class="guide-show-less">'+ui('عرض أقل','Show less')+'</span><span class="guide-disclosure-icon" aria-hidden="true">⌄</span></summary><div class="guide-disclosure-body"><nav class="product-guide-nav" aria-label="'+ui('محتويات دليل الخدمة','Service guide contents')+'">'+parts.filter(([key])=>key!=='uses').map(([key,title])=>'<a href="'+href(key)+'">'+esc(title)+'</a>').join('')+'</nav>'+parts.filter(([key])=>key!=='uses').map(([key,title,body])=>section(key,title,body)).join('')+'<footer class="product-guide-sources"><h3>'+ui('مراجع الخدمة وتفاصيل العرض','Service references and offer details')+'</h3>'+(sources.length?'<ul>'+sources.map((u,i)=>'<li><a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+ui('مرجع الخدمة والباقات','Service and plan reference')+(sources.length>1?' '+(i+1):'')+'</a></li>').join('')+'</ul>':'')+'<p>'+ui('تفاصيل التسليم والرصيد والضمان أعلاه مأخوذة من باقات المتجر. روابط المزود تساعدك على مراجعة الخدمة، ولا تعني تطابق عرض المتجر مع كل ما يقدمه الموقع الآخر.','Delivery, allowance, and warranty above come from store offers. Provider links help you review the service; they do not imply that every feature on another website is included in this offer.')+'</p></footer></div></details></article>';
}
return{render,summary,has:id=>!!profiles?.[id]&&id!=='windows-pro'};
});
