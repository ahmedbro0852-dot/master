(function(){
'use strict';
function mount({root,product}){
 const plans=product.plans||[],choices=plans.map((plan,index)=>({plan,index})).filter(x=>!x.plan.hidden);
 if(choices.length<2||root.querySelector('[data-compare-plans]'))return;
 const S=window.MasterStore,locale=window.MasterLocale;
 const t=(ar,en)=>locale?.getState().language==='en'?en:ar;
 const tr=(value,kind)=>locale?.catalogText(value,kind,product.id)??String(value??'');
 const E=S.escapeHtml,unknown=()=>t('غير موضح؛ يُؤكد قبل الدفع','Not specified; confirm before payment');
 const launcher=document.createElement('button');launcher.type='button';launcher.className='plan-compare-launcher';launcher.dataset.comparePlans='';launcher.setAttribute('aria-haspopup','dialog');launcher.setAttribute('aria-expanded','false');
 root.querySelector('.plans-block h2').insertAdjacentElement('afterend',launcher);
 const dialog=document.createElement('dialog');dialog.className='plan-compare-dialog';dialog.setAttribute('aria-labelledby','plan-compare-title');document.body.append(dialog);
 let selected=[],focusAfter=launcher;
 const current=()=>Number(root.querySelector('input[name=plan]:checked')?.value||0);
 const available=plan=>product.status==='available'&&plan.available!==false;
 function updateLauncher(){launcher.textContent=t('قارن الباقات','Compare plans');}
 function render(){
  const checked=choices.filter(x=>selected.includes(x.index));
  const cells=(field,kind)=>checked.map(({plan})=>'<td>'+E(tr(plan[field]||unknown(),kind))+'</td>').join('');
  dialog.dir=locale?.getState().language==='en'?'ltr':'rtl';
  dialog.innerHTML='<header class="plan-compare-head"><div><h2 id="plan-compare-title">'+t('قارن باقات ','Compare plans for ')+E(product.name)+'</h2><p>'+t('قارن لحد 3 باقات · السعر للمدة الكاملة المكتوبة','Compare up to 3 plans · Prices cover each stated term')+'</p></div><button type="button" class="plan-compare-close" aria-label="'+t('إغلاق المقارنة','Close comparison')+'">×</button></header><div class="plan-compare-body"><fieldset class="plan-compare-choices"><legend>'+t('اختار الباقات للمقارنة','Choose plans to compare')+'</legend>'+choices.map(({plan,index})=>'<label><input type="checkbox" value="'+index+'" '+(selected.includes(index)?'checked':'')+' '+(!selected.includes(index)&&selected.length>=3?'disabled':'')+'><span>'+E(tr(plan.name||plan.duration,'planName'))+'</span></label>').join('')+'</fieldset><p class="plan-compare-count" role="status">'+t('محدد '+selected.length+' من 3','Selected '+selected.length+' of 3')+(selected.length<2?' · '+t('ضيف باقة أخرى للمقارنة','Add another plan to compare'):'')+'</p><p class="plan-compare-scroll-note" '+(checked.length<3?'hidden':'')+'>'+t('على الموبايل: اسحب الجدول أفقيًا لمشاهدة الباقات.','On mobile, scroll the table horizontally to view the plans.')+'</p><div class="plan-compare-scroll" role="region" tabindex="0" aria-label="'+t('جدول مقارنة الباقات','Plan comparison table')+'"><table class="'+(checked.length<3?'plan-compare-compact':'')+'"><caption class="plan-compare-caption">'+E(product.name)+' — '+t('تفاصيل الباقات المختارة','Selected plan details')+'</caption><thead><tr><th scope="col">'+t('التفاصيل','Details')+'</th>'+checked.map(({plan})=>'<th scope="col">'+E(tr(plan.name||plan.duration,'planName'))+'</th>').join('')+'</tr></thead><tbody><tr><th scope="row">'+t('سعر الباقة','Plan price')+'</th>'+checked.map(({plan})=>'<td>'+S.priceMarkup(plan)+'</td>').join('')+'</tr><tr><th scope="row">'+t('المدة','Duration')+'</th>'+cells('duration','duration')+'</tr><tr><th scope="row">'+t('الرصيد / الكلمات','Credits / words')+'</th>'+cells('credits','credits')+'</tr><tr><th scope="row">'+t('نوع الحساب','Account method')+'</th>'+cells('account','account')+'</tr><tr><th scope="row">'+t('التفعيل والتسليم','Activation & delivery')+'</th>'+cells('activation','activation')+'</tr><tr><th scope="row">'+t('الضمان','Warranty')+'</th>'+cells('warranty','warranty')+'</tr><tr><th scope="row">'+t('التوفر والاختيار','Availability & choice')+'</th>'+checked.map(({plan,index})=>'<td><button type="button" class="plan-compare-select" data-choose-plan="'+index+'" '+(!available(plan)?'disabled':'')+'>'+(!available(plan)?t('غير متاح حاليًا','Currently unavailable'):index===current()?t('الباقة المختارة ✓','Selected plan ✓'):t('اختار الباقة','Choose plan'))+'</button></td>').join('')+'</tr></tbody></table></div></div>';
  dialog.querySelector('.plan-compare-close').onclick=()=>dialog.close();
  dialog.querySelectorAll('input[type=checkbox]').forEach(input=>input.onchange=()=>{const index=Number(input.value);if(input.checked){if(selected.length<3)selected.push(index);}else if(selected.length>1)selected=selected.filter(x=>x!==index);render();dialog.querySelector('input[value="'+index+'"]')?.focus();});
  dialog.querySelectorAll('[data-choose-plan]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.choosePlan),radio=root.querySelector('input[name=plan][value="'+index+'"]');if(!radio||radio.disabled||!available(plans[index]))return;radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));focusAfter=radio;dialog.close();});
 }
 launcher.onclick=()=>{const index=current();selected=[index,...choices.map(x=>x.index).filter(x=>x!==index)].filter(i=>choices.some(x=>x.index===i)).slice(0,3);focusAfter=launcher;render();dialog.showModal();launcher.setAttribute('aria-expanded','true');dialog.querySelector('.plan-compare-close').focus();};
 dialog.addEventListener('close',()=>{launcher.setAttribute('aria-expanded','false');if(focusAfter!==launcher)focusAfter.closest('.plan-option')?.scrollIntoView({block:'center',behavior:'instant'});focusAfter.focus({preventScroll:focusAfter!==launcher});});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 document.addEventListener('masterstore:localechange',()=>{updateLauncher();if(dialog.open)render();});updateLauncher();
}
window.MasterPlanComparison=Object.freeze({mount});
})();
