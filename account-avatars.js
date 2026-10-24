(function(){
  'use strict';
  const ids=Object.freeze(Array.from({length:32},(_,i)=>'avatar-'+String(i+1).padStart(2,'0')));
  const valid=id=>id==='initials'||ids.includes(id);
  const path=id=>ids.includes(id)?'images/avatars/avatars-3d-'+(Math.floor(ids.indexOf(id)/8)+1)+'.webp':'';
  function mount({root,user,onSaved}){
    const holder=root.querySelector('.account-avatar');
    if(!holder||!user?.id)return;
    const C=window.MasterCloud,en=()=>window.MasterLocale?.getState().language==='en';
    const t=(ar,english)=>en()?english:ar;
    const letter=(holder.textContent.trim()||'M').slice(0,1);
    let saved=valid(user.user_metadata?.master_avatar)?user.user_metadata.master_avatar:'initials';
    holder.removeAttribute('aria-hidden');holder.classList.add('has-avatar-picker');holder.textContent='';
    const trigger=document.createElement('button');trigger.type='button';trigger.className='avatar-trigger';
    trigger.setAttribute('aria-label',t('تغيير الصورة الشخصية','Change profile picture'));
    trigger.setAttribute('aria-haspopup','dialog');
    const portrait=document.createElement('span');portrait.className='avatar-portrait';
    const caption=document.createElement('small');caption.textContent=t('تغيير الصورة','Change picture');
    trigger.append(portrait,caption);holder.append(trigger);
    function paint(target,id){
      target.replaceChildren();target.dataset.avatar=id;target.classList.toggle('avatar-sprite',!!path(id));
      if(path(id)){
        const index=ids.indexOf(id)%8,img=document.createElement('img');
        img.src=path(id);img.alt='';img.width=320;img.height=160;
        img.style.left=-(index%4)*100+'%';img.style.top=-Math.floor(index/4)*100+'%';
        target.append(img);
      }else target.textContent=letter;
    }
    paint(portrait,saved);
    trigger.onclick=()=>{
      if(root.querySelector('#avatarDialog'))return;
      let chosen=saved,busy=false;
      const dialog=document.createElement('dialog');dialog.id='avatarDialog';dialog.className='avatar-dialog';
      dialog.dir=en()?'ltr':'rtl';dialog.setAttribute('aria-labelledby','avatarDialogTitle');
      dialog.innerHTML='<form class="avatar-form"><header class="avatar-heading"><div><h2 id="avatarDialogTitle">'+t('اختار صورتك الشخصية','Choose your avatar')+'</h2><p>'+t('32 شخصية 3D بخلفيات ملونة. اختار الشكل اللي يناسبك.','32 colorful 3D characters. Pick your favorite.')+'</p></div><button type="button" class="avatar-close" aria-label="'+t('إغلاق','Close')+'">×</button></header><div class="avatar-preview-row"><span class="avatar-preview"></span><div><b>'+t('معاينة الصورة','Picture preview')+'</b><p>'+t('هتظهر في حسابك بعد الحفظ.','Your picture changes when you save.')+'</p></div></div><fieldset class="avatar-options"><legend class="avatar-sr-only">'+t('الصور المتاحة','Available pictures')+'</legend></fieldset><p class="avatar-save-status" role="status" aria-live="polite" hidden></p><footer class="avatar-actions"><button type="submit" class="primary">'+t('حفظ الصورة','Save picture')+'</button><button type="button" class="ghost-btn avatar-cancel">'+t('إلغاء','Cancel')+'</button></footer></form>';
      const options=dialog.querySelector('.avatar-options'),preview=dialog.querySelector('.avatar-preview');
      paint(preview,chosen);
      for(const [i,id] of ['initials',...ids].entries()){
        const label=document.createElement('label');label.className='avatar-option';
        const radio=document.createElement('input');radio.type='radio';radio.name='avatar';radio.value=id;radio.checked=id===chosen;
        radio.setAttribute('aria-label',id==='initials'?t('الحرف الأول من اسمك','Your initial'):t('أفاتار '+i,'Avatar '+i));
        const face=document.createElement('span');face.className='avatar-option-face';paint(face,id);
        label.append(radio,face);options.append(label);
        radio.onchange=()=>{chosen=id;paint(preview,id);};
      }
      const status=dialog.querySelector('.avatar-save-status'),submit=dialog.querySelector('[type=submit]');
      const setBusy=value=>{busy=value;dialog.setAttribute('aria-busy',String(value));dialog.querySelectorAll('button,input').forEach(x=>x.disabled=value);submit.textContent=value?t('جاري الحفظ…','Saving…'):t('حفظ الصورة','Save picture');};
      const close=()=>{if(!busy)dialog.close();};
      dialog.querySelector('.avatar-close').onclick=close;dialog.querySelector('.avatar-cancel').onclick=close;
      dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
      dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
      dialog.addEventListener('close',()=>{dialog.remove();if(trigger.isConnected)trigger.focus();},{once:true});
      dialog.querySelector('form').onsubmit=async e=>{
        e.preventDefault();if(busy||!valid(chosen))return;
        if(chosen===saved){dialog.close();return;}
        status.hidden=true;setBusy(true);
        try{
          const current=await C.user();
          if(!current||current.id!==user.id||!trigger.isConnected)throw Error('SESSION_CHANGED');
          const result=await C.client.auth.updateUser({data:{master_avatar:chosen}});
          if(result.error)throw result.error;
          if(result.data?.user?.id!==user.id)throw Error('SESSION_CHANGED');
          if(!trigger.isConnected)return;
          saved=chosen;paint(portrait,saved);onSaved?.(result.data.user);
          dialog.close();
        }catch(error){
          if(!dialog.isConnected)return;
          status.textContent=t('تعذر حفظ الصورة. حاول تاني؛ صورتك السابقة محفوظة.','Could not save your picture. Try again; your previous picture is unchanged.');status.hidden=false;
        }finally{if(dialog.isConnected)setBusy(false);}
      };
      root.append(dialog);dialog.showModal();
      dialog.querySelector('input:checked').focus();
    };
  }
  window.MasterAvatars={mount,ids,valid,path};
})();
