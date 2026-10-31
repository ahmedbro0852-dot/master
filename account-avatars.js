(function(){
  'use strict';
  const ids=Object.freeze(Array.from({length:32},(_,i)=>'avatar-'+String(i+1).padStart(2,'0')));
  const valid=id=>id==='auto'||id==='initials'||ids.includes(id);
  const path=id=>ids.includes(id)?'images/avatars/avatars-3d-'+(Math.floor(ids.indexOf(id)/8)+1)+'.webp':'';
  // A user's random UUID seeds a stable automatic avatar across devices.
  // Presentation preference only; never used for authorization.
  function automaticId(userId){return window.MasterStore.avatarData({id:userId}).id;}
  function mount({root,user,onSaved}){
    const holder=root.querySelector('.account-avatar');
    if(!holder||!user?.id)return;
    const C=window.MasterCloud,en=()=>window.MasterLocale?.getState().language==='en';
    const t=(ar,english)=>en()?english:ar;
    const automatic=automaticId(user.id);
    let saved=ids.includes(user.user_metadata?.master_avatar)?user.user_metadata.master_avatar:'auto';
    holder.removeAttribute('aria-hidden');holder.classList.add('has-avatar-picker');holder.textContent='';
    const trigger=document.createElement('button');trigger.type='button';trigger.className='avatar-trigger';
    trigger.setAttribute('aria-label',t('تغيير الصورة الشخصية','Change profile picture'));
    trigger.setAttribute('aria-haspopup','dialog');
    const portrait=document.createElement('span');portrait.className='avatar-portrait';
    const caption=document.createElement('small');
    const updateCaption=()=>{caption.textContent=saved==='auto'?t('اختار وثبّت','Choose & pin'):t('تغيير الصورة','Change picture');};
    updateCaption();
    trigger.append(portrait,caption);holder.append(trigger);
    function paint(target,id){
      id=ids.includes(id)?id:automatic;
      target.replaceChildren();target.dataset.avatar=id;target.classList.toggle('avatar-sprite',!!path(id));
      if(path(id)){
        const index=ids.indexOf(id)%8,img=document.createElement('img');
        img.src=path(id);img.alt='';img.width=320;img.height=160;
        img.style.left=-(index%4)*100+'%';img.style.top=-Math.floor(index/4)*100+'%';
        target.append(img);
      }
    }
    paint(portrait,saved);
    trigger.onclick=()=>{
      if(root.querySelector('#avatarDialog'))return;
      let chosen=saved,busy=false;
      const dialog=document.createElement('dialog');dialog.id='avatarDialog';dialog.className='avatar-dialog';
      dialog.dir=en()?'ltr':'rtl';dialog.setAttribute('aria-labelledby','avatarDialogTitle');
      dialog.innerHTML='<form class="avatar-form"><header class="avatar-heading"><div><span class="avatar-kicker">'+t('شخصية تشبهك','Make it yours')+'</span><h2 id="avatarDialogTitle">'+t('اختار صورتك الشخصية','Choose your avatar')+'</h2><p>'+t('اختر من 32 شخصية 3D وثبّت المفضلة لحسابك.','Choose from 32 3D characters and pin your favorite.')+'</p></div><button type="button" class="avatar-close" aria-label="'+t('إغلاق','Close')+'">×</button></header><div class="avatar-preview-row"><span class="avatar-preview"></span><div><b class="avatar-mode"></b><p class="avatar-preview-hint"></p><button type="button" class="avatar-shuffle">↻ '+t('جرّب اختيار عشوائي','Try a random pick')+'</button></div></div><div class="avatar-filters" role="group" aria-label="'+t('نوع الشخصية','Character type')+'"><button type="button" data-avatar-filter="all" aria-pressed="true">'+t('الكل','All')+' <span>32</span></button><button type="button" data-avatar-filter="people" aria-pressed="false">'+t('شخصيات','People')+' <span>24</span></button><button type="button" data-avatar-filter="robots" aria-pressed="false">'+t('روبوتات','Robots')+' <span>8</span></button></div><fieldset class="avatar-options"><legend class="avatar-sr-only">'+t('الصور المتاحة','Available pictures')+'</legend></fieldset><p class="avatar-save-status" role="status" aria-live="polite" hidden></p><footer class="avatar-actions"><button type="submit" class="primary"></button><button type="button" class="ghost-btn avatar-cancel">'+t('إلغاء','Cancel')+'</button></footer></form>';
      const options=dialog.querySelector('.avatar-options'),preview=dialog.querySelector('.avatar-preview');
      paint(preview,chosen);
      const updatePreview=()=>{paint(preview,chosen);dialog.querySelector('.avatar-mode').textContent=chosen==='auto'?t('اختيار تلقائي لحسابك','Your automatic avatar'):t('صورتك المختارة','Your selected picture');dialog.querySelector('.avatar-preview-hint').textContent=chosen==='auto'?t('اختار أي صورة وثبّتها وقت ما تحب.','Choose and pin a picture whenever you like.'):t('اضغط تثبيت الصورة علشان تحفظ اختيارك.','Pin this picture to save your choice.');dialog.querySelector('[type=submit]').textContent=chosen==='auto'?t('حفظ الوضع التلقائي','Use automatic avatar'):t('تثبيت الصورة','Pin picture');};
      for(const [i,id] of ['auto',...ids].entries()){
        const label=document.createElement('label');label.className='avatar-option';
        label.dataset.kind=id==='auto'?'auto':i<=24?'people':'robots';
        const radio=document.createElement('input');radio.type='radio';radio.name='avatar';radio.value=id;radio.checked=id===chosen;
        radio.setAttribute('aria-label',id==='auto'?t('اختيار تلقائي','Automatic avatar'):t('أفاتار '+i,'Avatar '+i));
        const face=document.createElement('span');face.className='avatar-option-face';paint(face,id);
        label.append(radio,face);options.append(label);
        const check=document.createElement('span');check.className='avatar-check';check.textContent='✓';check.setAttribute('aria-hidden','true');label.append(check);
        if(id!=='auto'){const number=document.createElement('span');number.className='avatar-number';number.textContent=String(i).padStart(2,'0');number.setAttribute('aria-hidden','true');label.append(number);}
        if(id==='auto'){const badge=document.createElement('span');badge.className='avatar-auto-badge';badge.textContent=t('تلقائي','Auto');label.append(badge);}
        radio.onchange=()=>{chosen=id;updatePreview();};
      }
      updatePreview();
      function filter(kind){dialog.querySelectorAll('[data-avatar-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.avatarFilter===kind)));options.querySelectorAll('.avatar-option').forEach(label=>label.hidden=kind!=='all'&&label.dataset.kind!=='auto'&&label.dataset.kind!==kind);options.scrollTop=0;}
      dialog.querySelectorAll('[data-avatar-filter]').forEach(b=>b.onclick=()=>filter(b.dataset.avatarFilter));
      dialog.querySelector('.avatar-shuffle').onclick=()=>{const pool=ids.filter(id=>id!==preview.dataset.avatar),random=new Uint32Array(1);crypto.getRandomValues(random);chosen=pool[random[0]%pool.length];filter('all');options.querySelector('input[value="'+chosen+'"]').checked=true;updatePreview();};
      const status=dialog.querySelector('.avatar-save-status'),submit=dialog.querySelector('[type=submit]');
      const setBusy=value=>{busy=value;dialog.setAttribute('aria-busy',String(value));dialog.querySelectorAll('button,input').forEach(x=>x.disabled=value);if(value)submit.textContent=t('جاري الحفظ…','Saving…');else updatePreview();};
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
          saved=chosen;paint(portrait,saved);updateCaption();onSaved?.(result.data.user);
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
  window.MasterAvatars={mount,ids,valid,path,automaticId};
})();
