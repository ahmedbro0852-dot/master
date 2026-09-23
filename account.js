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

  document.getElementById('editProfile')?.addEventListener('click',()=>{
    const name=prompt('الاسم',profile?.name||'');
    if(name===null)return;
    const phone=prompt('رقم واتساب',profile?.phone||'');
    if(phone===null)return;
    const email=prompt('البريد الإلكتروني',profile?.email||'');
    if(email===null)return;
    MasterStore.saveProfile({name,phone,email});
    location.reload();
  });
})();