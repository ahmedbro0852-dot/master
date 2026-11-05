(function(){
'use strict';
const BUCKET='master-crm-attachments',TABLE='master_crm_attachments';
const TYPES={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
const MAX_SIZE=4*1024*1024,MAX_PER_ORDER=12,TEMPLATES_KEY='master-crm-service-templates-v1';
const C=window.MasterCloud;
function validImage(file){return !!(file&&TYPES[file.type]&&file.size>0&&file.size<=MAX_SIZE);}
function safeFilename(name){return String(name||'photo').replace(/[<>:"/\\|?*\x00-\x1f]/g,'').trim().slice(0,180)||'photo';}
function imagePath(subscriptionId,uuid,mime){return subscriptionId+'/'+uuid+'.'+TYPES[mime];}
function fetchTemplates(){try{const value=JSON.parse(localStorage.getItem(TEMPLATES_KEY)||'[]');return Array.isArray(value)?value.filter(x=>x&&typeof x.name==='string'&&typeof x.product==='string').slice(0,12):[];}catch{return [];}}
function saveTemplates(rows){try{localStorage.setItem(TEMPLATES_KEY,JSON.stringify(rows.slice(0,12)));return true;}catch{return false;}}
function attachForm(form,{isExisting=false,isWebsite=false,isRenewal=false,onMessage}={}){
 if(!form||isExisting||isWebsite)return;
 const target=[...form.querySelectorAll('.crm-form-section')].find(el=>el.querySelector('[name=product]'));
 if(!target)return;
 const wrap=document.createElement('div');wrap.className='crm-enhance-template wide';
 wrap.innerHTML='<div><strong>⚡ نماذج خدمات لتسجيل أسرع</strong><small>احفظ اسم الخدمة والباقة والمدة فقط. السعر وحالة الدفع وبيانات العميل لا تُنسخ.</small></div><div class="crm-enhance-template-row"><select aria-label="النماذج المحفوظة" data-template-select><option value="">اختر نموذج خدمة محفوظًا</option></select><button type="button" data-template-apply class="ghost-btn">تعبئة الخدمة</button></div><div class="crm-enhance-template-row"><input type="text" maxlength="70" data-template-name placeholder="اسم للنموذج، مثل: شات بلس شهر" aria-label="اسم النموذج"><button type="button" class="ghost-btn" data-template-save>حفظ كنموذج</button></div><button class="crm-enhance-today" type="button" data-fill-start>📅 استخدم تاريخ اليوم كبداية التفعيل</button>';
 target.prepend(wrap);
 const pick=wrap.querySelector('[data-template-select]'),name=wrap.querySelector('[data-template-name]');
 function draw(){pick.replaceChildren();const option=document.createElement('option');option.value='';option.textContent='اختر نموذج خدمة محفوظًا';pick.append(option);for(const item of fetchTemplates()){const node=document.createElement('option');node.value=item.id;node.textContent=item.name;pick.append(node);}}
 draw();
 wrap.querySelector('[data-template-apply]').addEventListener('click',()=>{
  const item=fetchTemplates().find(x=>x.id===pick.value);
  if(!item){onMessage?.('اختر نموذج خدمة أولًا.',true);return;}
  for(const key of ['product','plan','duration'])if(form.elements[key])form.elements[key].value=item[key]||'';
  for(const key of ['term_count','term_unit','warranty_count','warranty_unit'])if(form.elements[key]&&item[key])form.elements[key].value=item[key];
  form.elements.product?.focus();onMessage?.('تم تعبئة بيانات الخدمة. راجع السعر والعميل والضمان قبل الحفظ.');
 });
 wrap.querySelector('[data-template-save]').addEventListener('click',()=>{
  const title=name.value.trim(),product=form.elements.product?.value.trim();
  if(!title||!product){onMessage?.('اكتب اسم النموذج واختر الخدمة قبل الحفظ.',true);return;}
  const item={id:crypto.randomUUID(),name:title.slice(0,70)};
  for(const key of ['product','plan','duration','term_count','term_unit','warranty_count','warranty_unit'])item[key]=String(form.elements[key]?.value||'').slice(0,160);
  const list=fetchTemplates().filter(x=>x.name!==item.name);
  if(!saveTemplates([item,...list])){onMessage?.('تعذر حفظ النماذج على هذا المتصفح.',true);return;}
  draw();pick.value=item.id;onMessage?.('تم حفظ نموذج الخدمة على هذا الجهاز فقط. لم تُحفظ أي بيانات للعملاء.');
 });
 wrap.querySelector('[data-fill-start]').addEventListener('click',()=>{
  if(!form.elements.starts_on)return;
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  form.elements.starts_on.value=date;
  form.elements.starts_on.dispatchEvent(new Event('change',{bubbles:true}));
  onMessage?.('تم تعيين تاريخ اليوم كبداية. احسب نهاية الاشتراك والضمان قبل الحفظ.');
 });
}
function mount({root,findOrder,refresh,onMessage,isAdmin}){
 if(!root||typeof findOrder!=='function'||!isAdmin?.())return null;
 const notify=(text,error=false)=>onMessage?.(text,!!error);
 const group=document.createElement('div');group.className='crm-enhance-quick';group.innerHTML='<strong>⚡ وصول سريع</strong><button type="button" data-jump="pending">بانتظار التفعيل</button><button type="button" data-jump="unpaid">غير مدفوع</button><button type="button" data-jump="warranty">ضمان قرب الانتهاء</button><button type="button" data-focus-search>⌕ بحث فوري <kbd>Ctrl+K</kbd></button>';
 root.querySelector('.crm-intro')?.after(group);
 group.querySelectorAll('[data-jump]').forEach(button=>button.addEventListener('click',()=>{
  root.querySelector('[data-stat="'+button.dataset.jump+'"]')?.click();
 }));
 group.querySelector('[data-focus-search]').onclick=()=>root.querySelector('#crmSearch')?.focus();
 const keydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!e.shiftKey&&isAdmin()){e.preventDefault();root.querySelector('#crmSearch')?.focus();}};
 document.addEventListener('keydown',keydown);
 const photos=document.createElement('dialog');photos.className='crm-enhance-dialog';photos.setAttribute('aria-label','صور ومرفقات الطلب');
 photos.innerHTML='<div class="crm-enhance-dialog-head"><div><h2 id="crmPhotoTitle">صور الطلب</h2><p>صور خاصة بالإدارة فقط، ولا تُعرض للعميل أو على الموقع.</p></div><button type="button" class="ghost-btn" data-photo-close aria-label="إغلاق">✕</button></div><label class="crm-enhance-upload"><b>📷 إضافة صور الطلب أو إثبات التسليم</b><small>PNG / JPG / WEBP — حتى 4 ميجابايت للصورة، وبحد أقصى 12 صورة لكل طلب.</small><input type="file" data-photo-upload accept="image/jpeg,image/png,image/webp" multiple></label><p class="crm-enhance-status" role="status" data-photo-status></p><div class="crm-enhance-gallery" data-photo-gallery></div>';
 const note=document.createElement('dialog');note.className='crm-enhance-dialog crm-enhance-note';
 note.innerHTML='<form method="dialog" data-note-form><div class="crm-enhance-dialog-head"><div><h2>✍️ متابعة سريعة للطلب</h2><p data-note-title></p></div><button type="button" class="ghost-btn" data-note-close aria-label="إغلاق">✕</button></div><label>المتابعة الجديدة<textarea data-note-text maxlength="500" minlength="2" required rows="5" placeholder="مثال: تم التواصل مع العميل وبانتظار تأكيد التفعيل"></textarea></label><p>المتابعة ستُضاف للملاحظات الداخلية بتاريخها، بدون تغيير السعر أو حالة الدفع.</p><div class="crm-enhance-note-actions"><button type="submit" class="primary" data-note-save>حفظ المتابعة</button></div></form>';
 root.append(photos,note);
 const gallery=photos.querySelector('[data-photo-gallery]'),fileInput=photos.querySelector('[data-photo-upload]'),status=photos.querySelector('[data-photo-status]');
 let openOrderId=null,uploading=false;
 const setStatus=(value,error=false)=>{status.textContent=String(value||'');status.dataset.error=String(!!error);};
 const storage=()=>C.client.storage.from(BUCKET);
 async function galleryLoad(){
  if(!openOrderId||!isAdmin())return;
  const current=openOrderId;gallery.replaceChildren();
  const result=await C.client.from(TABLE).select('id,object_path,filename,mime_type,byte_size,created_at').eq('subscription_id',current).order('created_at',{ascending:false}).limit(MAX_PER_ORDER+1);
  if(result.error)throw result.error;
  if(current!==openOrderId||!isAdmin())return;
  const records=result.data||[];
  setStatus(records.length+' من '+MAX_PER_ORDER+' صورة محفوظة.');
  fileInput.disabled=records.length>=MAX_PER_ORDER;
  if(!records.length){const empty=document.createElement('p');empty.className='crm-enhance-empty';empty.textContent='مفيش صور مرفقة حتى الآن. ارفع أول صورة من الزر فوق.';gallery.append(empty);return;}
  for(const entry of records){
   const item=document.createElement('figure');item.className='crm-enhance-image';
   const image=document.createElement('img');image.alt='صورة الطلب: '+entry.filename;image.loading='lazy';image.decoding='async';
   const info=document.createElement('figcaption');info.textContent=entry.filename+' · '+Math.ceil(Number(entry.byte_size)/1024)+' ك.ب';
   const footer=document.createElement('div');footer.className='crm-enhance-image-actions';
   const download=document.createElement('button');download.type='button';download.className='ghost-btn';download.textContent='فتح الصورة';
   download.disabled=true;
   const remove=document.createElement('button');remove.type='button';remove.className='ghost-btn danger';remove.textContent='حذف';
   footer.append(download,remove);item.append(image,info,footer);gallery.append(item);
   const signed=await storage().createSignedUrl(entry.object_path,300);
   if(signed.error){image.alt='تعذر تحميل الصورة. أعد فتح المرفقات.';download.remove();continue;}
   if(current!==openOrderId||!isAdmin())return;
   image.src=signed.data.signedUrl;
   download.disabled=false;download.addEventListener('click',()=>window.open(signed.data.signedUrl,'_blank','noopener,noreferrer'));
   remove.addEventListener('click',async()=>{
    if(uploading||!isAdmin()||current!==openOrderId)return;
    if(!confirm('تأكيد حذف الصورة "'+entry.filename+'" نهائيًا؟'))return;
    uploading=true;remove.disabled=true;
    try{
     const del=await storage().remove([entry.object_path]);if(del.error)throw del.error;
     const row=await C.client.from(TABLE).delete().eq('id',entry.id).eq('subscription_id',current).select('id');
     if(row.error)throw row.error;
     if(row.data?.length!==1)throw Error('تعذر تحديث سجل الصور. حاول إعادة فتح المرفقات.');
     await galleryLoad();notify('تم حذف الصورة من مرفقات الطلب.');
    }catch(e){setStatus('تعذر حذف الصورة: '+String(e.message||e),true);}
    finally{uploading=false;remove.disabled=false;}
   });
  }
 }
 async function openPhotos(order){
  if(!order||!isAdmin())return;
  openOrderId=order.id;photos.querySelector('#crmPhotoTitle').textContent='📷 صور طلب '+order.reference;
  fileInput.value='';setStatus('جاري تحميل الصور…');
  if(!photos.open)photos.showModal();
  try{await galleryLoad();}catch(e){setStatus('تعذر قراءة الصور: '+String(e.message||e),true);}
 }
 photos.querySelector('[data-photo-close]').onclick=()=>{if(!uploading)photos.close();};
 photos.addEventListener('cancel',e=>{if(uploading)e.preventDefault();});
 photos.addEventListener('close',()=>{openOrderId=null;gallery.replaceChildren();fileInput.value='';});
 fileInput.addEventListener('change',async()=>{
  if(uploading||!isAdmin()||!openOrderId)return;
  const chosen=[...fileInput.files];fileInput.value='';
  if(!chosen.length)return;
  if(chosen.some(file=>!validImage(file))){setStatus('اختر JPG أو PNG أو WEBP فقط، وحجم الصورة بحد أقصى 4 ميجابايت.',true);return;}
  const orderId=openOrderId;uploading=true;fileInput.disabled=true;
  try{
   const existing=await C.client.from(TABLE).select('id',{count:'exact',head:true}).eq('subscription_id',orderId);
   if(existing.error)throw existing.error;
   if(chosen.length+Number(existing.count||0)>MAX_PER_ORDER)throw Error('عدد الصور بعد الرفع سيتجاوز الحد المسموح (12 صورة).');
   for(let i=0;i<chosen.length;i++){
    if(!isAdmin()||openOrderId!==orderId)break;
    const file=chosen[i],id=crypto.randomUUID(),path=imagePath(orderId,id,file.type);
    setStatus('جارٍ رفع الصورة '+(i+1)+' من '+chosen.length+'…');
    const result=await storage().upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
    if(result.error)throw result.error;
    const row=await C.client.from(TABLE).insert({subscription_id:orderId,object_path:path,filename:safeFilename(file.name),mime_type:file.type,byte_size:file.size}).select('id').single();
    if(row.error){await storage().remove([path]).catch(()=>{});throw row.error;}
   }
   await galleryLoad();notify('تم حفظ صور الطلب في مساحة الإدارة الخاصة.');
  }catch(e){setStatus('تعذر رفع الصور: '+String(e.message||e)+' — أعد فتح المرفقات لمراجعة ما تم رفعه.',true);}
  finally{uploading=false;if(openOrderId===orderId)fileInput.disabled=false;}
 });
 const noteForm=note.querySelector('[data-note-form]'),noteText=note.querySelector('[data-note-text]');
 let noteOrderId=null,noteBusy=false;
 note.querySelector('[data-note-close]').onclick=()=>{if(!noteBusy)note.close();};
 note.addEventListener('cancel',e=>{if(noteBusy)e.preventDefault();});
 note.addEventListener('close',()=>{noteOrderId=null;noteText.value='';});
 noteForm.addEventListener('submit',async e=>{
  e.preventDefault();if(noteBusy||!noteOrderId||!isAdmin())return;
  const order=findOrder(noteOrderId),text=noteText.value.trim();
  if(!order||text.length<2){notify('اكتب متابعة صحيحة وجرب مرة أخرى.',true);return;}
  const stamp=new Intl.DateTimeFormat('ar-EG',{timeZone:'Africa/Cairo',dateStyle:'short',timeStyle:'short'}).format(new Date());
  const next='['+stamp+'] '+text+(order.notes?'\n\n'+order.notes:'');
  if(next.length>4000){notify('سجل الملاحظات ممتلئ. راجع الملاحظات القديمة من تفاصيل الطلب قبل الإضافة.',true);return;}
  noteBusy=true;const button=note.querySelector('[data-note-save]');button.disabled=true;
  try{
   const result=await C.client.from('master_crm_subscriptions').update({notes:next}).eq('id',order.id).eq('updated_at',order.updated_at).select('id');
   if(result.error)throw result.error;
   if(result.data?.length!==1)throw Error('السجل اتعدل من مكان آخر. حدّثه ثم أعد إدخال المتابعة.');
   note.close();await refresh();notify('✅ تم تسجيل المتابعة بتاريخها، من غير تغيير الدفع أو الضمان.');
  }catch(error){notify('تعذر حفظ المتابعة: '+String(error.message||error),true);}
  finally{noteBusy=false;button.disabled=false;}
 });
 root.addEventListener('click',event=>{
  const photoButton=event.target.closest('[data-crm-photos]'),noteButton=event.target.closest('[data-crm-followup]');
  if(!isAdmin())return;
  if(photoButton){const order=findOrder(photoButton.dataset.crmPhotos);if(order)openPhotos(order);}
  if(noteButton){const order=findOrder(noteButton.dataset.crmFollowup);if(!order)return;
   noteOrderId=order.id;note.querySelector('[data-note-title]').textContent=order.reference+' · '+order.product;
   noteText.value='';note.showModal();noteText.focus();
  }
 });
 return {close(){document.removeEventListener('keydown',keydown);if(photos.open)photos.close();if(note.open)note.close();}};
}
window.MasterCRMEnhance={mount,attachForm,validImage,safeFilename,imagePath,fetchTemplates};
})();
