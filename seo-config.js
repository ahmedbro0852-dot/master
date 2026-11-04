/* Shared public SEO data for static pages and client navigation. */
(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.MasterSEO=value;})(typeof window==='undefined'?globalThis:window,function(){
'use strict';
const origin='https://master-pi-six.vercel.app';
const social=typeof module==='object'&&module.exports?require('./social-links.js'):window.MasterSocialLinks;
const profileLinks=[social?.facebook,social?.whatsappChannel].filter(Boolean);
const categories=[
 {name:'الفيديو',slug:'video-tools',title:'اشتراكات أدوات الفيديو والمونتاج',description:'قارن باقات توليد الفيديو بالذكاء الاصطناعي والأفاتار والمونتاج. راجع مدة الاشتراك وطريقة التفعيل والضمان لكل خدمة قبل الطلب.',guide:'قبل اختيار أداة فيديو، قارن بين توليد المقاطع والمونتاج وتحرير الفيديو الموجود بالفعل. اسأل عن عدد الدقائق أو الأرصدة المتاحة، ودقة التصدير والعلامة المائية وحدود الاستخدام التجاري؛ فالمميزات تختلف من باقة لأخرى.'},
 {name:'الصور والتصميم',slug:'image-design-tools',title:'اشتراكات أدوات الصور والتصميم',description:'تصفح أدوات توليد الصور وتعديلها والتصميم وموارد الصور والقوالب. اختر الخدمة حسب استخدامك وراجع الباقات والتفعيل والضمان.',guide:'اختر حسب المهمة: توليد صور جديدة أو تعديل صورك أو تصميم منشورات وعروض. راجع عدد الصور أو الأرصدة، جودة التصدير، أدوات إزالة الخلفية، وصلاحية استخدام النتائج تجاريًا حسب شروط الخدمة.'},
 {name:'الصوت',slug:'voice-audio-tools',title:'اشتراكات أدوات التعليق الصوتي والصوت',description:'اكتشف خدمات التعليق الصوتي وتحويل النص إلى صوت والإملاء وتلخيص الاجتماعات. راجع حدود الرصيد ومدة كل باقة وتفاصيل التفعيل.',guide:'حدّد هل تحتاج تعليقًا صوتيًا عربيًا أو استنساخًا مرخّصًا للصوت أو تفريغًا وتحريرًا. قارن الدقائق والأرصدة المتاحة واللغات وحقوق الاستخدام، وتحقق من شروط الموافقة عند استنساخ الأصوات.'},
 {name:'البرمجة والمواقع',slug:'coding-website-tools',title:'اشتراكات أدوات البرمجة وبناء المواقع',description:'باقات مساعدي كتابة الكود وبناء المواقع والتطبيقات والاستضافة وأدوات المطورين. قارن الاستخدامات ومدة الاشتراك وطريقة التسليم.',guide:'راجع نوع الأداة أولًا: مساعد داخل محرر الكود أم منشئ مواقع وتطبيقات أم استضافة. تأكد من حدود الطلبات أو الأرصدة، وإمكان تصدير المشروع أو الكود، وملكية المخرجات وطريقة ربط حسابك.'},
 {name:'الكتابة والبحث',slug:'writing-research-tools',title:'اشتراكات أدوات الكتابة والبحث',description:'تصفح مساعدي البحث والكتابة والتدقيق وإعادة الصياغة وفحص التشابه. راجع الرصيد وحدود الاستخدام وشروط كل باقة قبل طلبها.',guide:'اختر بين مساعد كتابة وبحث وتدقيق لغوي وفحص تشابه؛ فكل خدمة تؤدي غرضًا مختلفًا. تحقّق من حدود الكلمات أو الملفات، ودعم العربية، وإمكانية توثيق المصادر وخصوصية المستندات التي ترفعها.'},
 {name:'التعليم',slug:'education-learning',title:'اشتراكات التعليم والكورسات وتعلم اللغات',description:'باقات الكورسات وتعلم اللغات وأدوات المعلمين والاختبارات. راجع مدة الاشتراك ونوع الحساب والتفعيل والضمان لكل خدمة.',guide:'قبل الاشتراك، تأكد من المنصة والكورسات أو الأدوات المشمولة، وإمكانية استخراج الشهادات إن كانت مهمة لك. راجع نوع الحساب ومدته، وشروط الأهلية التعليمية وطريقة استمرار الوصول بعد انتهاء الباقة.'},
 {name:'العمل والإنتاجية',slug:'productivity-windows',title:'اشتراكات الإنتاجية وتفعيل ويندوز',description:'خدمات المستندات وملفات PDF والاجتماعات والعروض التقديمية وإدارة العمل، مع نسخ ويندوز المتاحة. راجع تفاصيل الباقات والتفعيل.',guide:'حدد نظام التشغيل والتطبيق والإصدار المطلوب قبل اختيار الرخصة أو الاشتراك. تحقق من عدد الأجهزة، وتوافق النسخة، ونوع الترخيص ومدة الدعم، ولا تعتبر مدة الوصول مساوية لمدة الضمان إلا إذا ورد ذلك صراحة.'},
 {name:'الترفيه',slug:'entertainment',title:'اشتراكات الترفيه والخدمات الرقمية',description:'استعرض خدمات الترفيه الرقمية المتاحة في المتجر. قارن مدد الباقات ونوع الحساب وطريقة التفعيل والضمان قبل إتمام الطلب.',guide:'راجع توافق الخدمة مع بلدك وأجهزتك ونوع الحساب قبل الطلب. تأكد من مدة الباقة، وعدد الشاشات أو المستخدمين إن انطبق، وحدود الاستخدام وسياسة التفعيل والاستبدال.'},
 {name:'الحماية والاتصالات',slug:'security-internet',title:'اشتراكات VPN والحماية والإنترنت',description:'خدمات VPN والخصوصية وعروض الإنترنت المتاحة. راجع عدد الأجهزة والمدة وشروط الأهلية والتفعيل لكل عرض قبل الدفع.',guide:'اختر بناءً على عدد الأجهزة وأنظمة التشغيل وبلد الاستخدام، ثم راجع وظائف الحماية أو الاتصال المتاحة في الباقة. اسأل عن مدة الترخيص وطريقة التفعيل وحدود الأجهزة والتجديد قبل الشراء.'}
];
const productUrl=p=>origin+'/products/'+encodeURIComponent(p.id)+'.html';
const categoryUrl=c=>origin+'/categories/'+c.slug+'.html';
function categoryFor(p,groups={}){
 const tags=p.categories||[p.category];
 const found=categories.filter(c=>tags.includes(c.name)||(groups[c.name]||[]).some(x=>tags.includes(x)));
 if(found.length)return found;
 if(p.id.startsWith('windows-'))return categories.filter(c=>c.slug==='productivity-windows');
 const fallback={'التصميم':'image-design-tools','الإنتاجية':'productivity-windows','VPN والحماية':'security-internet','الاتصالات والإنترنت':'security-internet','البرمجة وتطوير المواقع':'coding-website-tools','الترفيه':'entertainment','التعليم':'education-learning'};
 return categories.filter(c=>c.slug===fallback[p.category]);
}
const indexable=p=>!p.redirectTo&&p.status!=='soon'&&(p.plans||[]).some(x=>!x.hidden);
function productTitle(p){return (p.id.startsWith('windows-')?'تفعيل '+p.name:(p.id==='turnitin'?'فحص ملف ':p.id==='we-gold-discount'?'تفعيل ':'اشتراك ')+p.name+' — المميزات والباقات')+' | ماستر ستور';}
function productDescription(p,english=false){const profiles=typeof module==='object'&&module.exports?require('./product-guide-profiles.js'):globalThis.MasterProductGuideProfiles;return shortDescription(profiles?.[p.id]?.[english?'introEn':'intro']||(english?p.descriptionEn:p.description)||p.name);}
function image(p){const candidate=p.logoUrl&&!p.logoUrl.startsWith('data:')?p.logoUrl:p.logo?'logos/'+encodeURIComponent(p.logo)+'.svg':'master-store-logo.png';try{const u=new URL(candidate,origin+'/');return u.protocol==='https:'?u.href:origin+'/master-store-logo.png';}catch{return origin+'/master-store-logo.png';}}
function shortDescription(text){return String(text||'').replace(/\s+/g,' ').trim().slice(0,220);}
function offers(p,rows,now=Date.now()){
 if(!Array.isArray(rows))return [];
 return (p.plans||[]).flatMap((plan,i)=>{
  if(plan.hidden)return [];
  const row=rows.find(x=>x.product_id===p.id&&Number(x.plan_index)===i),price=Number(row?.price_piasters);
  if(!row||!Number.isSafeInteger(price)||price<=0)return [];
  // Avoid publishing an offer if the storefront and checkout price disagree.
  if(!row.admin_overridden&&price!==Math.round(Number(plan.price)*100))return [];
  const expired=plan.offerEndsAt&&now>=Date.parse(plan.offerEndsAt);
  return [{'@type':'Offer',name:plan.name,url:productUrl(p)+'?plan='+i,price:(price/100).toFixed(2),priceCurrency:'EGP',availability:'https://schema.org/'+(row.available===true&&!expired?'InStock':'OutOfStock'),seller:{'@id':origin+'/#store'}}];
 });
}
function productGraph(p,groups,rows){
 const url=productUrl(p),category=categoryFor(p,groups)[0],list=[{name:'ماستر ستور',url:origin+'/'}];
 if(category)list.push({name:category.name,url:categoryUrl(category)});list.push({name:p.name,url});
 const offerList=offers(p,rows),entity={'@type':offerList.length?'Product':'Service','@id':url+'#product',name:p.name,description:productDescription(p),url,image:image(p)};
 if(offerList.length){entity.sku=p.id;entity.offers=offerList;}
 else entity.provider={'@id':origin+'/#store'};
 return {'@context':'https://schema.org','@graph':[
  {'@type':'Organization','@id':origin+'/#store',name:'MASTER STORE',alternateName:'ماستر ستور',url:origin+'/',logo:origin+'/master-store-logo.png'},
  {'@type':'WebPage','@id':url+'#page',url,name:productTitle(p),inLanguage:'ar',mainEntity:{'@id':url+'#product'}},
  {'@type':'BreadcrumbList','@id':url+'#breadcrumbs',itemListElement:list.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,item:x.url}))},entity
 ]};
}
const homeGraph={'@context':'https://schema.org','@graph':[
 {'@type':'WebSite','@id':origin+'/#website',name:'MASTER STORE',alternateName:['ماستر ستور','Master Store'],url:origin+'/',inLanguage:'ar'},
 {'@type':'Organization','@id':origin+'/#store',name:'MASTER STORE',alternateName:'ماستر ستور',url:origin+'/',logo:origin+'/master-store-logo.png',sameAs:profileLinks}
]};
return {origin,categories,categoryFor,categoryUrl,productUrl,productTitle,productDescription,image,indexable,shortDescription,offers,productGraph,homeGraph};
});
