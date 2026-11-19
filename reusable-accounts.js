(function () {
  'use strict';
  const C = window.MasterCloud;
  const root = document.getElementById('reuseRoot');
  const ACCOUNTS = 'master_store_reusable_accounts';
  const RENTALS = 'master_store_account_rentals';
  let accounts = [], rentals = [], busy = false, authorized = false;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function today() {
    const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get = name => parts.find(p=>p.type===name).value;
    return get('year')+'-'+get('month')+'-'+get('day');
  }
  function addDays(date,n) {
    const d = new Date(date+'T12:00:00Z');
    d.setUTCDate(d.getUTCDate()+n);
    return d.toISOString().slice(0,10);
  }
  const days = end => Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(today()+'T12:00:00Z'))/86400000);
  const displayDate = date => date ? new Intl.DateTimeFormat('ar-EG',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(new Date(date+'T12:00:00Z')) : 'لم يُحدَّد';
  const activeFor = id => rentals.find(r=>r.account_id===id && r.status==='active');
  function statusMessage(message, isError) {
    const box = root.querySelector('#reuseFeedback');
    if (!box) return;
    box.textContent = message;
    box.className = 'reuse-feedback' + (isError?' error':'');
    box.hidden = false;
  }
  function draw() {
    const active = accounts.filter(a=>activeFor(a.id));
    const soon = active.filter(a=>days(activeFor(a.id).ends_on)>=0 && days(activeFor(a.id).ends_on)<=3);
    const urgent = active.filter(a=>days(activeFor(a.id).ends_on)>=0 && days(activeFor(a.id).ends_on)<=2);
    const overdue = active.filter(a=>days(activeFor(a.id).ends_on)<0);
    const ready = accounts.filter(a=>!a.retired && !activeFor(a.id));
    root.querySelector('#reuseSummary').innerHTML =
      '<article><span>حسابات مع العملاء</span><b>'+active.length+'</b></article>'+
      '<article class="attention"><span>خلال 3 أيام</span><b>'+soon.length+'</b></article>'+
      '<article class="urgent"><span>خلال يومين</span><b>'+urgent.length+'</b></article>'+
      '<article class="late"><span>فات موعدها</span><b>'+overdue.length+'</b></article>'+
      '<article><span>جاهزة لإعادة البيع</span><b>'+ready.length+'</b></article>';
    const list = root.querySelector('#reuseList');
    const sorted = [...accounts].sort((a,b)=>{
      const ar=activeFor(a.id),br=activeFor(b.id);
      return (ar ? days(ar.ends_on) : 999999) - (br ? days(br.ends_on) : 999999);
    });
    list.innerHTML = sorted.length ? sorted.map(a=>{
      const rental=activeFor(a.id), left=rental?days(rental.ends_on):null;
      const state=a.retired?'مستبعد من إعادة البيع':!rental?'جاهز لإعادة البيع':left<0?'انتهت المدة — راجع الاسترداد':left===0?'موعد الانتهاء اليوم':left<=2?'تنبيه عاجل: باقي '+left+' يوم':left===3?'تنبيه: باقي 3 أيام':'مع العميل — باقي '+left+' يوم';
      const cls=a.retired?'retired':!rental?'ready':left<0?'overdue':left<=2?'urgent':left===3?'soon':'active';
      const history=rentals.filter(r=>r.account_id===a.id).sort((x,y)=>y.created_at.localeCompare(x.created_at));
      return '<article class="reuse-account">'+
        '<div class="reuse-account-header"><div><strong>'+esc(a.product)+' — '+esc(a.plan)+'</strong><p class="reuse-email" dir="ltr">'+esc(a.login_email)+'</p></div><span class="reuse-badge '+cls+'">'+esc(state)+'</span></div>'+
        '<div class="reuse-details"><span>الاشتراك الأصلي: <b>'+Number(a.supplier_term_months)+' شهور</b></span><span>نهاية صلاحية المزوّد: <b>'+displayDate(a.supplier_ends_on)+'</b></span>'+
        (rental?'<span>العميل: <b>'+esc(rental.customer_label||'غير مسجل')+'</b></span><span>التسليم: <b>'+displayDate(rental.starts_on)+'</b></span><span>نهاية حق الاستخدام: <b>'+displayDate(rental.ends_on)+'</b></span><span>التنبيه الأول: <b>'+displayDate(addDays(rental.ends_on,-3))+'</b></span><span>التنبيه العاجل: <b>'+displayDate(addDays(rental.ends_on,-2))+'</b></span>':'')+'</div>'+
        '<div class="reuse-actions">'+(!rental&&!a.retired?'<button type="button" class="primary" data-rent="'+a.id+'">تسجيل بيع جديد</button>':'')+
        (rental?'<button type="button" class="ghost-btn" data-close="'+rental.id+'" '+(left>0?'disabled title="لا يجوز الاسترداد قبل اكتمال مدة العميل"':'')+'>تأكيد استرداد الحساب</button>':'')+
        '<button type="button" class="ghost-btn" data-expiry="'+a.id+'">تعديل نهاية الاشتراك الأصلي</button></div>'+
        (a.internal_note?'<p class="reuse-note">'+esc(a.internal_note)+'</p>':'')+
        '<details class="reuse-history"><summary>سجل دورات البيع ('+history.length+')</summary><div>'+history.map(r=>'<p><b>'+displayDate(r.starts_on)+' ← '+displayDate(r.ends_on)+'</b> · '+esc(r.customer_label||'عميل غير مسجل')+' · '+(r.status==='active'?'الحساب مع العميل':'تم الاسترداد')+'</p>').join('')+'</div></details>'+
      '</article>';
    }).join('') : '<p class="reuse-empty">لا توجد حسابات مسجلة. أضف أول حساب من النموذج أعلاه.</p>';
  }
  async function load() {
    const res=await Promise.all([
      C.client.from(ACCOUNTS).select('*').order('created_at',{ascending:false}).limit(500),
      C.client.from(RENTALS).select('*').order('created_at',{ascending:false}).limit(1500)
    ]);
    for(const item of res) if(item.error) throw item.error;
    accounts=res[0].data||[]; rentals=res[1].data||[]; draw();
  }
  function layout() {
    root.innerHTML = '<div class="reuse-heading"><span>MASTER STORE / مخزون الحسابات</span><h1>الحسابات القابلة لإعادة البيع</h1><p>سجّل مدة العميل منفصلة عن مدة اشتراك الحساب الأصلية. التنبيهات تبدأ قبل 3 أيام، والاسترداد بعد اكتمال مدة العميل فقط.</p></div>'+
      '<div id="reuseSummary" class="reuse-stats"></div><div id="reuseFeedback" class="reuse-feedback" role="status" hidden></div>'+
      '<section class="reuse-panel"><details><summary>+ إضافة حساب للمخزون</summary><form id="reuseAddAccount" class="reuse-form">'+
      '<label>الإيميل المستخدم للدخول <input name="login_email" type="email" maxlength="254" required autocomplete="off"></label>'+
      '<label>الخدمة <input name="product" maxlength="120" placeholder="ElevenLabs" required></label>'+
      '<label>الباقة <input name="plan" maxlength="120" placeholder="Creator"></label>'+
      '<label>مدة الاشتراك الأصلي (بالشهور) <input name="supplier_term_months" type="number" min="1" max="60" value="3" required></label>'+
      '<label>تاريخ انتهاء الاشتراك الأصلي (اختياري) <input name="supplier_ends_on" type="date"></label>'+
      '<label class="reuse-wide">ملاحظات داخلية <textarea name="internal_note" rows="2" maxlength="1000"></textarea></label>'+
      '<button type="submit" class="primary">حفظ الحساب</button><small class="reuse-wide">لا نخزن كلمة مرور الحساب أو مفتاح التحقق الثنائي هنا.</small></form></details></section>'+
      '<section id="reuseAssign" class="reuse-panel" hidden><h2 id="reuseAssignTitle">تسجيل بيع جديد</h2><form id="reuseRentForm" class="reuse-form">'+
      '<input name="account_id" type="hidden"><label>اسم العميل أو رقم الطلب (اختياري) <input name="customer_label" maxlength="180"></label>'+
      '<label>تاريخ التسليم <input name="starts_on" type="date" required></label>'+
      '<label>المدة المباعة بالأيام <input name="term_days" type="number" value="30" min="1" max="365" required></label>'+
      '<label class="reuse-wide">ملاحظة خاصة بالدورة <textarea name="internal_note" rows="2" maxlength="1000"></textarea></label>'+
      '<button type="submit" class="primary">حفظ الدورة</button><button type="button" id="reuseCancel" class="ghost-btn">إلغاء</button></form></section>'+
      '<div class="reuse-list-heading"><h2>سجل الحسابات</h2><button type="button" id="reuseRefresh" class="ghost-btn">تحديث التنبيهات</button></div><div id="reuseList" class="reuse-list"></div>';
    root.querySelector('#reuseRefresh').onclick=()=>perform(load);
    root.querySelector('#reuseCancel').onclick=()=>{root.querySelector('#reuseAssign').hidden=true;};
    root.querySelector('#reuseAddAccount').onsubmit=e=>{e.preventDefault();perform(async()=>{
      const f=e.currentTarget,v=new FormData(f);
      const record={login_email:String(v.get('login_email')||'').trim().toLowerCase(),product:String(v.get('product')||'').trim(),plan:String(v.get('plan')||'').trim(),supplier_term_months:Number(v.get('supplier_term_months')),supplier_ends_on:v.get('supplier_ends_on')||null,internal_note:String(v.get('internal_note')||'').trim()};
      const out=await C.client.from(ACCOUNTS).insert(record).select('id').single();
      if(out.error)throw out.error;
      f.reset();f.closest('details').open=false;
      await load();statusMessage('تم حفظ الحساب. يمكنك الآن تسجيل تسليمه للعميل.');
    });};
    root.querySelector('#reuseRentForm').onsubmit=e=>{e.preventDefault();perform(async()=>{
      const f=e.currentTarget,v=new FormData(f), account=accounts.find(a=>a.id===v.get('account_id'));
      if(!account||activeFor(account.id)||account.retired)throw Error('الحساب غير متاح للبيع الآن.');
      const start=String(v.get('starts_on')),term=Number(v.get('term_days')),end=addDays(start,term);
      if(account.supplier_ends_on && end>account.supplier_ends_on)throw Error('مدة العميل تتجاوز صلاحية حساب المزوّد؛ راجع الاشتراك أولًا.');
      const result=await C.client.from(RENTALS).insert({account_id:account.id,customer_label:String(v.get('customer_label')||'').trim(),starts_on:start,ends_on:end,internal_note:String(v.get('internal_note')||'').trim()}).select('id').single();
      if(result.error)throw result.error;
      root.querySelector('#reuseAssign').hidden=true;
      await load();statusMessage('تم تسجيل البيع. سيظهر التنبيه قبل نهاية المدة بـ3 أيام ويومين.');
    });};
    root.querySelector('#reuseList').onclick=e=>{
      const rent=e.target.closest('[data-rent]'),close=e.target.closest('[data-close]'),expiry=e.target.closest('[data-expiry]');
      if(rent){const a=accounts.find(x=>x.id===rent.dataset.rent);if(!a)return;const section=root.querySelector('#reuseAssign'),f=root.querySelector('#reuseRentForm');f.reset();f.elements.account_id.value=a.id;f.elements.starts_on.value=today();root.querySelector('#reuseAssignTitle').textContent='تسجيل بيع جديد — '+a.product+' / '+a.login_email;section.hidden=false;section.scrollIntoView({behavior:'smooth',block:'start'});}
      if(close){const r=rentals.find(x=>x.id===close.dataset.close);if(!r||days(r.ends_on)>0)return;if(!confirm('هل استرددت الحساب فعليًا وألغيت وصول العميل السابق؟ لن يُحذف سجل البيع.'))return;perform(async()=>{const x=await C.client.from(RENTALS).update({status:'closed',closed_at:new Date().toISOString()}).eq('id',r.id).eq('status','active').select('id');if(x.error)throw x.error;if(!x.data.length)throw Error('السجل تغير. حدّث البيانات.');await load();statusMessage('تم تسجيل الاسترداد؛ الحساب متاح لدورة بيع جديدة بعد التحقق من صلاحيته.');});}
      if(expiry){const a=accounts.find(x=>x.id===expiry.dataset.expiry);if(!a)return;const next=prompt('أدخل تاريخ انتهاء الاشتراك الأصلي بصيغة YYYY-MM-DD. اتركه فارغًا إذا لم يُعرف.',a.supplier_ends_on||'');if(next===null)return;if(next!==''&&!/^\d{4}-\d{2}-\d{2}$/.test(next)){statusMessage('اكتب تاريخًا صحيحًا بالصيغة YYYY-MM-DD.',true);return;}perform(async()=>{const x=await C.client.from(ACCOUNTS).update({supplier_ends_on:next||null}).eq('id',a.id).select('id');if(x.error)throw x.error;await load();statusMessage('تم تحديث تاريخ انتهاء الاشتراك الأصلي.');});}
    };
  }
  async function perform(fn) {
    if(busy)return;busy=true;
    const buttons=[...root.querySelectorAll('button')].map(button=>({button,disabled:button.disabled}));buttons.forEach(x=>{x.button.disabled=true;});
    try{await fn();}catch(err){statusMessage(err.code==='23505'?'هذا الحساب مسجل بالفعل أو لديه دورة بيع مفتوحة.':String(err.message||err),true);}
    finally{busy=false;buttons.forEach(x=>{if(x.button.isConnected)x.button.disabled=x.disabled;});draw();}
  }
  async function init() {
    try {
      if(!C||!C.ready)throw Error('اتصال قاعدة البيانات غير متاح.');
      const user=await C.user();
      if(!user){root.innerHTML='<section class="reuse-panel"><h1>تسجيل دخول الإدارة</h1><p>سجل الدخول بحساب مدير المتجر أولًا.</p><a class="primary" href="account.html">تسجيل الدخول</a></section>';return;}
      const access=await C.client.from('master_store_admins').select('user_id').eq('user_id',user.id).maybeSingle();
      if(access.error)throw access.error;
      if(!access.data){root.innerHTML='<section class="reuse-panel"><h1>الإدارة فقط</h1><p>هذا الحساب لا يمتلك صلاحية إدارة المتجر.</p></section>';return;}
      authorized=true;layout();await load();
    }catch(err){root.textContent='تعذّر تحميل لوحة الحسابات: '+String(err.message||err);}
  }
  C?.client?.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){authorized=false;accounts=[];rentals=[];root.textContent='انتهت جلسة الإدارة. يرجى تسجيل الدخول.';}});
  setInterval(()=>{if(authorized&&!busy&&!document.hidden)load().catch(err=>statusMessage(String(err.message||err),true));},60000);
  init();
})();