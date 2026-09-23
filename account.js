(function(){
  'use strict';
  const Store=window.MasterStore;
  const Locale=window.MasterLocale;
  if(!Store)return;

  const root=document.getElementById('accountContent');
  let profileDialog=null;
  const en=()=>Locale?.getState().language==='en';
  const ui=(ar,enText)=>en()?enText:ar;

  function orderCard(o){
    const date=new Date(o.createdAt);
    const follow='https://wa.me/201500950624?text='+encodeURIComponent('متابعة طلب MASTER STORE رقم '+o.id);
    return '<article class="order-card">'+
      '<div class="order-top"><div><small>'+ui('رقم الطلب','Order ID')+'</small><b>'+Store.escapeHtml(o.id)+'</b></div><span class="status soon">'+ui(o.status||'بانتظار التأكيد','Pending confirmation')+'</span></div>'+
      '<h3>'+Store.escapeHtml(o.product)+'</h3>'+
      '<p>'+Store.escapeHtml(o.plan)+' — '+Store.escapeHtml(o.duration||'')+'</p>'+
      '<div class="order-meta"><span>'+ui('الكمية','Quantity')+': '+Number(o.quantity||1)+'</span><span>'+ui('الإجمالي','Total')+': '+Store.orderMoney(o)+'</span><span>'+date.toLocaleDateString(en()?'en-US':'ar-EG')+'</span></div>'+
      '<a class="order-follow" target="_blank" rel="noopener" href="'+follow+'">'+ui('متابعة الطلب على واتساب','Track order on WhatsApp')+'</a>'+
    '</article>';
  }

  function ensureDialog(){
    if(profileDialog)return;
    profileDialog=document.createElement('dialog');
    profileDialog.id='profileDialog';
    profileDialog.className='profile-dialog';
    document.body.appendChild(profileDialog);
  }

  function renderDialog(){
    ensureDialog();
    profileDialog.innerHTML=
      '<div class="profile-dialog-inner">'+
        '<div class="profile-dialog-head"><div><h2>'+ui('تعديل بيانات التواصل','Edit contact details')+'</h2><p>'+ui('حدّث البيانات المستخدمة في متابعة طلباتك.','Update the contact details used to follow up on your orders.')+'</p></div><button class="profile-dialog-close" type="button" aria-label="'+ui('إغلاق','Close')+'">×</button></div>'+
        '<form id="profileForm" class="profile-form">'+
          '<label><span>'+ui('الاسم','Name')+'</span><input name="name" maxlength="80" required></label>'+
          '<label><span>'+ui('رقم واتساب','WhatsApp number')+'</span><input name="phone" maxlength="30" inputmode="tel" required></label>'+
          '<label><span>'+ui('البريد الإلكتروني','Email')+'</span><input name="email" maxlength="120" type="email" required></label>'+
          '<div class="profile-form-actions"><button class="ghost-btn profile-cancel" type="button">'+ui('إلغاء','Cancel')+'</button><button class="primary" type="submit">'+ui('حفظ التعديلات','Save changes')+'</button></div>'+
        '</form>'+
      '</div>';
    profileDialog.querySelector('.profile-dialog-close')?.addEventListener('click',()=>profileDialog.close());
    profileDialog.querySelector('.profile-cancel')?.addEventListener('click',()=>profileDialog.close());
    profileDialog.querySelector('#profileForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      const form=new FormData(e.currentTarget);
      Store.saveProfile({name:form.get('name'),phone:form.get('phone'),email:form.get('email')});
      profileDialog.close();
      render();
    });
  }

  function openProfileDialog(){
    renderDialog();
    const current=Store.getProfile()||{};
    const form=profileDialog.querySelector('#profileForm');
    form.elements.name.value=current.name||'';
    form.elements.phone.value=current.phone||'';
    form.elements.email.value=current.email||'';
    profileDialog.showModal();
  }

  function render(){
    const profile=Store.getProfile();
    const orders=Store.getOrders();

    if(!profile&&!orders.length){
      root.innerHTML='<div class="empty-account"><h2>'+ui('لسه ماعملتش طلب','No orders yet')+'</h2><p>'+ui('اختار الخدمة المناسبة، ولما ترسل أول طلب هتقدر ترجع هنا لمتابعته بسهولة.','Choose a service and your first order will appear here for easy tracking.')+'</p><a class="primary" href="index.html#products">'+ui('اختار منتج','Choose a product')+'</a></div>';
      return;
    }

    root.innerHTML=
      '<section class="profile-card">'+
        '<div><span class="eyebrow">'+ui('بيانات التواصل','Contact details')+'</span><h2>'+Store.escapeHtml(profile?.name||ui('عميل MASTER STORE','MASTER STORE customer'))+'</h2><p>'+Store.escapeHtml(profile?.phone||'')+(profile?.email?' • '+Store.escapeHtml(profile.email):'')+'</p></div>'+
        '<button id="editProfile" class="ghost-btn" type="button">'+ui('تعديل البيانات','Edit details')+'</button>'+
      '</section>'+
      '<section class="orders-section"><div class="section-head small"><div><span class="eyebrow">'+ui('طلباتك','Your orders')+'</span><h2>'+ui('سجل الطلبات','Order history')+'</h2></div></div>'+
        (orders.length?'<div class="orders-list">'+orders.map(orderCard).join('')+'</div>':'<div class="notice">'+ui('لسه مفيش طلبات محفوظة.','No saved orders yet.')+'</div>')+
      '</section>'+
      '<section class="device-note"><b>'+ui('خصوصية بياناتك','Your privacy')+'</b><p>'+ui('بيانات الطلبات محفوظة على المتصفح الحالي لتسهيل المتابعة، لذلك قد لا تظهر تلقائيًا عند استخدام جهاز مختلف.','Order data is stored in this browser for easier tracking and may not appear automatically on another device.')+'</p></section>';

    document.getElementById('editProfile')?.addEventListener('click',openProfileDialog);
  }

  render();
  document.addEventListener('masterstore:localechange',()=>{
    render();
    if(profileDialog?.open)renderDialog();
  });
})();