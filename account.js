(function(){
  'use strict';
  const MasterStore=window.MasterStore;
  if(!MasterStore)return;

  const root=document.getElementById('accountContent');
  const profile=MasterStore.getProfile();
  const orders=MasterStore.getOrders();

  if(!profile && !orders.length){
    root.innerHTML='<div class="empty-account"><h2>لسه ماعملتش طلب</h2><p>اختار الخدمة المناسبة، ولما ترسل أول طلب هتقدر ترجع هنا لمتابعته بسهولة.</p><a class="primary" href="index.html#products">اختار منتج</a></div>';
    return;
  }

  function orderCard(o){
    const date=new Date(o.createdAt);
    const follow='https://wa.me/201500950624?text='+encodeURIComponent('متابعة طلب MASTER STORE رقم '+o.id);
    return '<article class="order-card">'+
      '<div class="order-top"><div><small>رقم الطلب</small><b>'+MasterStore.escapeHtml(o.id)+'</b></div><span class="status soon">'+MasterStore.escapeHtml(o.status||'بانتظار التأكيد')+'</span></div>'+
      '<h3>'+MasterStore.escapeHtml(o.product)+'</h3>'+
      '<p>'+MasterStore.escapeHtml(o.plan)+' — '+MasterStore.escapeHtml(o.duration||'')+'</p>'+
      '<div class="order-meta"><span>الكمية: '+Number(o.quantity||1)+'</span><span>الإجمالي: '+MasterStore.orderMoney(o)+'</span><span>'+date.toLocaleDateString('ar-EG')+'</span></div>'+
      '<a class="order-follow" target="_blank" rel="noopener" href="'+follow+'">متابعة الطلب على واتساب</a>'+
    '</article>';
  }

  root.innerHTML=
    '<section class="profile-card">'+
      '<div><span class="eyebrow">بيانات التواصل</span><h2>'+MasterStore.escapeHtml(profile?.name||'عميل MASTER STORE')+'</h2><p>'+MasterStore.escapeHtml(profile?.phone||'')+(profile?.email?' • '+MasterStore.escapeHtml(profile.email):'')+'</p></div>'+
      '<button id="editProfile" class="ghost-btn" type="button">تعديل البيانات</button>'+
    '</section>'+
    '<section class="orders-section"><div class="section-head small"><div><span class="eyebrow">طلباتك</span><h2>سجل الطلبات</h2></div></div>'+
      (orders.length?'<div class="orders-list">'+orders.map(orderCard).join('')+'</div>':'<div class="notice">لسه مفيش طلبات محفوظة.</div>')+
    '</section>'+
    '<section class="device-note"><b>خصوصية بياناتك</b><p>بيانات الطلبات محفوظة على المتصفح الحالي لتسهيل المتابعة، لذلك قد لا تظهر تلقائيًا عند استخدام جهاز مختلف.</p></section>';

  let profileDialog=document.getElementById('profileDialog');
  if(!profileDialog){
    profileDialog=document.createElement('dialog');
    profileDialog.id='profileDialog';
    profileDialog.className='profile-dialog';
    profileDialog.innerHTML=
      '<div class="profile-dialog-inner">'+
        '<div class="profile-dialog-head"><div><h2>تعديل بيانات التواصل</h2><p>حدّث البيانات المستخدمة في متابعة طلباتك.</p></div><button class="profile-dialog-close" type="button" aria-label="إغلاق">×</button></div>'+
        '<form id="profileForm" class="profile-form">'+
          '<label><span>الاسم</span><input name="name" maxlength="80" required></label>'+
          '<label><span>رقم واتساب</span><input name="phone" maxlength="30" inputmode="tel" required></label>'+
          '<label><span>البريد الإلكتروني</span><input name="email" maxlength="120" type="email" required></label>'+
          '<div class="profile-form-actions"><button class="ghost-btn profile-cancel" type="button">إلغاء</button><button class="primary" type="submit">حفظ التعديلات</button></div>'+
        '</form>'+
      '</div>';
    document.body.appendChild(profileDialog);
  }

  function openProfileDialog(){
    const current=MasterStore.getProfile()||{};
    const form=profileDialog.querySelector('#profileForm');
    form.elements.name.value=current.name||'';
    form.elements.phone.value=current.phone||'';
    form.elements.email.value=current.email||'';
    profileDialog.showModal();
  }

  document.getElementById('editProfile')?.addEventListener('click',openProfileDialog);
  profileDialog.querySelector('.profile-dialog-close')?.addEventListener('click',()=>profileDialog.close());
  profileDialog.querySelector('.profile-cancel')?.addEventListener('click',()=>profileDialog.close());
  profileDialog.addEventListener('click',e=>{if(e.target===profileDialog)profileDialog.close();});
  profileDialog.querySelector('#profileForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const form=new FormData(e.currentTarget);
    MasterStore.saveProfile({name:form.get('name'),phone:form.get('phone'),email:form.get('email')});
    profileDialog.close();
    location.reload();
  });
})();