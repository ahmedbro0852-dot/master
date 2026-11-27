(async function(){
  'use strict';

  const menu=document.querySelector('.menu');
  const nav=document.querySelector('.topbar nav');

  if(menu&&nav){
    menu.setAttribute('aria-expanded','false');

    function closeMenu(restoreFocus=false){
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-label',window.MasterLocale?.getState().language==='en'?'Open menu':'فتح القائمة');
      if(restoreFocus)menu.focus();
    }

    menu.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
      menu.setAttribute('aria-label',window.MasterLocale?.getState().language==='en'?(open?'Close menu':'Open menu'):(open?'إغلاق القائمة':'فتح القائمة'));
      if(open)nav.querySelector('a')?.focus();
    });

    const updateMenuLabel=()=>{const open=nav.classList.contains('open'),en=window.MasterLocale?.getState().language==='en';menu.setAttribute('aria-label',en?(open?'Close menu':'Open menu'):(open?'إغلاق القائمة':'فتح القائمة'));};
    document.addEventListener('masterstore:localechange',updateMenuLabel);updateMenuLabel();
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open'))closeMenu(true);});
    document.addEventListener('click',e=>{
      if(!nav.contains(e.target)&&!menu.contains(e.target))closeMenu();
    });
  }

  const accountLink=document.querySelector('.account-link');
  if(accountLink&&window.MasterCloud?.ready){
    let avatarSession=null;
    const drawAccountAvatar=()=>{
      const picture=avatarSession?.user&&window.MasterStore?.avatarData(avatarSession.user);
      accountLink.classList.toggle('with-avatar',!!picture);
      if(picture){accountLink.style.setProperty('--account-avatar-image','url("'+picture.path+'")');accountLink.style.setProperty('--account-avatar-position',picture.position);accountLink.dataset.avatarId=picture.id;accountLink.setAttribute('aria-label',accountLink.textContent);}
      else{accountLink.style.removeProperty('--account-avatar-image');accountLink.style.removeProperty('--account-avatar-position');delete accountLink.dataset.avatarId;accountLink.removeAttribute('aria-label');}
    };
    const updateAccountLink=session=>{avatarSession=session;accountLink.dataset.authenticated=String(!!session);window.MasterLocale?.apply();drawAccountAvatar();};
    document.addEventListener('masterstore:localechange',drawAccountAvatar);
    window.MasterCloud.client.auth.getSession().then(({data})=>updateAccountLink(data.session));
    window.MasterCloud.client.auth.onAuthStateChange((_event,session)=>updateAccountLink(session));
  }

})();
