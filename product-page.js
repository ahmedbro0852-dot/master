(function(){
  'use strict';
  const Catalog=window.MasterCatalog;
  const MasterStore=window.MasterStore;
  if(!Catalog||!MasterStore)return;
  const getProduct=Catalog.getProduct;
  const statusLabel=Catalog.statusLabel;
  const root=document.getElementById('productPage');
  const dialog=document.getElementById('checkoutDialog');
  const checkoutContent=document.getElementById('checkoutContent');
  const toast=document.getElementById('toast');
  const params=new URLSearchParams(location.search);
  const p=getProduct(params.get('id'));

  function showToast(text){
    toast.textContent=text;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),1800);
  }

  function icon(product){
    const fallback=(product.name||'M').split(/\s+/).map(x=>x[0]).join('').slice(0,2);
    const local=product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg?v=20260923-brand4':'';
    const src=product.logoUrl||local;
    const fallbackAttr=product.logoUrl&&local?' data-fallback="'+MasterStore.escapeHtml(local)+'"':'';
    const onerror=product.logoUrl&&local
      ? "if(this.dataset.fallback&&!this.dataset.usedFallback){this.dataset.usedFallback='1';this.src=this.dataset.fallback;return;}this.style.display='none';this.nextElementSibling.style.display='grid'"
      : "this.style.display='none';this.nextElementSibling.style.display='grid'";
    return '<span class="product-logo big">'+(src?'<img src="'+MasterStore.escapeHtml(src)+'"'+fallbackAttr+' alt="'+MasterStore.escapeHtml(product.name)+'" onerror="'+onerror+'">':'')+'<span class="logo-fallback">'+fallback+'</span></span>';
  }

  if(!p){
    root.innerHTML='<section class="not-found"><h1>المنتج غير موجود</h1><p>ارجع للمتجر واختار خدمة متاحة.</p><a class="primary" href="index.html#products">العودة للمنتجات</a></section>';
    return;
  }

  document.title=p.name+' | MASTER STORE';

  const active=p.status==='available';
  const plans=p.plans||[];

  root.innerHTML=
    '<section class="product-hero">'+
      '<a class="back-link" href="index.html#products">← كل المنتجات</a>'+
      '<div class="product-title">'+icon(p)+'<div><span class="eyebrow">'+MasterStore.escapeHtml(p.category)+'</span><h1>'+MasterStore.escapeHtml(p.name)+'</h1><p>'+MasterStore.escapeHtml(p.description||'')+'</p></div></div>'+
      '<span class="status '+(p.status==='available'?'ok':p.status==='soon'?'soon':'out')+'">'+statusLabel(p.status)+'</span>'+
    '</section>'+
    '<section class="product-layout">'+
      '<div class="plans-block"><h2>اختار الباقة</h2>'+
        (plans.length?plans.map((plan,i)=>
          '<label class="plan-option">'+
            '<input type="radio" name="plan" value="'+i+'" '+(i===0?'checked':'')+' '+(!active?'disabled':'')+'>'+
            '<span><b>'+MasterStore.escapeHtml(plan.name||plan.duration)+'</b><small>'+MasterStore.escapeHtml(plan.duration||'')+'</small></span>'+
            '<strong>'+MasterStore.money(plan.price)+'</strong>'+
          '</label>'
        ).join(''):'<div class="notice">الخدمة غير متاحة للطلب حاليًا.</div>')+
      '</div>'+
      '<aside class="summary-card">'+
        '<h2>تفاصيل الباقة</h2>'+
        '<div id="planDetails"></div>'+
        (active?'<button id="buyBtn" class="primary full" type="button">اطلب الباقة</button>':'<button class="primary full disabled" disabled>غير متاح حاليًا</button>')+
        '<p class="safe-note">بعد إرسال الطلب، فريق الدعم هيتواصل معاك لتأكيد التوفر وبيانات الدفع.</p>'+
      '</aside>'+
    '</section>';

  const planDetails=document.getElementById('planDetails');
  const radios=[...document.querySelectorAll('input[name="plan"]')];

  function selectedPlan(){
    const r=radios.find(x=>x.checked);
    return plans[Number(r?.value||0)]||null;
  }

  function renderDetails(){
    const plan=selectedPlan();
    if(!plan){planDetails.innerHTML='';return;}
    const notes=[...(p.notes||[]),...(plan.notes||[])];
    const features=plan.features||[];
    const saving=plan.oldPrice&&Number(plan.oldPrice)>Number(plan.price)?Number(plan.oldPrice)-Number(plan.price):0;
    planDetails.innerHTML=
      '<dl class="details-list">'+
        '<div><dt>السعر</dt><dd>'+MasterStore.money(plan.price)+'</dd></div>'+
        (plan.oldPrice?'<div><dt>السعر قبل العرض</dt><dd><del>'+MasterStore.money(plan.oldPrice)+'</del>'+(saving?' <strong class="saving">وفر '+MasterStore.money(saving)+'</strong>':'')+'</dd></div>':'')+
        '<div><dt>المدة</dt><dd>'+MasterStore.escapeHtml(plan.duration||'غير محددة')+'</dd></div>'+
        '<div><dt>نوع الحساب</dt><dd>'+MasterStore.escapeHtml(plan.account||'يُؤكد قبل الدفع')+'</dd></div>'+
        '<div><dt>التفعيل</dt><dd>'+MasterStore.escapeHtml(plan.activation||'يُؤكد قبل الدفع')+'</dd></div>'+
        '<div><dt>الضمان</dt><dd>'+MasterStore.escapeHtml(plan.warranty||'غير محدد')+'</dd></div>'+
        (plan.credits?'<div><dt>الرصيد</dt><dd>'+MasterStore.escapeHtml(plan.credits)+'</dd></div>':'')+
      '</dl>'+
      (features.length?'<div class="plan-features"><b>مميزات الباقة</b><ul>'+features.map(n=>'<li>'+MasterStore.escapeHtml(n)+'</li>').join('')+'</ul></div>':'')+
      (notes.length?'<div class="plan-notes"><b>ملاحظات مهمة</b><ul>'+notes.map(n=>'<li>'+MasterStore.escapeHtml(n)+'</li>').join('')+'</ul></div>':'');
  }
  radios.forEach(r=>r.onchange=renderDetails);
  renderDetails();

  document.getElementById('buyBtn')?.addEventListener('click',()=>{
    const plan=selectedPlan();
    if(!plan)return;
    const profile=MasterStore.getProfile()||{};
    const maxQty=p.id==='gamma-account'?1:5;

    checkoutContent.innerHTML=
      '<button class="dialog-close" type="button" aria-label="إغلاق">×</button>'+
      '<div class="checkout-head"><span class="eyebrow">إتمام الطلب</span><h2>بيانات التواصل</h2><p>أدخل بياناتك لإرسال الطلب، وفريق الدعم هيتابع معاك لتأكيد التوفر والدفع.</p></div>'+
      '<div class="checkout-summary"><b>'+MasterStore.escapeHtml(p.name)+'</b><span>'+MasterStore.escapeHtml(plan.name)+' — '+MasterStore.escapeHtml(plan.duration)+'</span><strong>'+MasterStore.money(plan.price)+'</strong></div>'+
      '<form id="checkoutForm" class="checkout-form">'+
        '<label><span>الاسم</span><input name="name" maxlength="80" required value="'+MasterStore.escapeHtml(profile.name||'')+'" placeholder="اسمك الكامل" autocomplete="name"></label>'+
        '<label><span>رقم واتساب</span><input name="phone" maxlength="30" inputmode="tel" required value="'+MasterStore.escapeHtml(profile.phone||'')+'" placeholder="01xxxxxxxxx" autocomplete="tel"></label>'+
        '<label><span>البريد الإلكتروني</span><input name="email" maxlength="120" type="email" required value="'+MasterStore.escapeHtml(profile.email||'')+'" placeholder="name@example.com" autocomplete="email"></label>'+
        '<label><span>الكمية</span><select name="quantity">'+Array.from({length:maxQty},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join('')+'</select></label>'+
        '<label><span>طريقة الدفع المفضلة</span><select name="payment"><option>InstaPay</option><option>Vodafone Cash</option><option>Binance / USDT</option></select></label>'+
        '<label class="terms-check"><input name="agree" type="checkbox" required><span>راجعت السعر والمدة وطريقة التفعيل والضمان وأوافق على تفاصيل الباقة.</span></label>'+
        '<button class="primary full" type="submit">إرسال الطلب على واتساب</button>'+
        '<small class="form-note">بياناتك تستخدم لإتمام الطلب والتواصل معك فقط.</small>'+
      '</form>';

    dialog.showModal();
    checkoutContent.querySelector('.dialog-close').onclick=()=>dialog.close();

    checkoutContent.querySelector('#checkoutForm').onsubmit=(e)=>{
      e.preventDefault();
      const form=new FormData(e.currentTarget);
      const customer=MasterStore.saveProfile({
        name:form.get('name'),phone:form.get('phone'),email:form.get('email')
      });
      const qty=Number(form.get('quantity')||1);
      const total=Number(plan.price)*qty;
      const order={
        id:MasterStore.createOrderId(),
        createdAt:new Date().toISOString(),
        productId:p.id,
        product:p.name,
        plan:plan.name,
        duration:plan.duration,
        quantity:qty,
        unitPrice:Number(plan.price),
        total,
        payment:String(form.get('payment')||''),
        status:'بانتظار التأكيد',
        customer
      };
      MasterStore.saveOrder(order);

      const msg=[
        'طلب جديد من MASTER STORE',
        'رقم الطلب: '+order.id,
        'المنتج: '+order.product,
        'الباقة: '+order.plan,
        'المدة: '+order.duration,
        'الكمية: '+order.quantity,
        'الإجمالي: '+MasterStore.money(order.total),
        'الاسم: '+customer.name,
        'واتساب: '+customer.phone,
        'البريد: '+customer.email,
        'طريقة الدفع المفضلة: '+order.payment,
        '',
        'أرغب في تأكيد الطلب واستكمال الدفع.'
      ].join('\n');

      dialog.close();
      showToast('تم تجهيز طلبك بنجاح');
      window.open('https://wa.me/201500950624?text='+encodeURIComponent(msg),'_blank','noopener');
    };
  });

  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();