(function(){
  'use strict';
  if(!window.supabase){window.MasterCloud={ready:false};return;}
  const url='https://gmysuhoebcapigdidnnv.supabase.co';
  const key='sb_publishable_zHcukZ2xWD8RqrYu3i-Wzw_Kd4c8x-h';
  const client=window.supabase.createClient(url,key,{auth:{storageKey:'master-store-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const redirect=location.origin+'/account.html';
  const errors={
    EDIT_CONFLICT:['البيانات اتعدلت من مكان تاني. حدث اللوحة وراجع القيم قبل الحفظ.','Data changed elsewhere. Refresh and review before saving.'],
    INVALID_PLAN:['راجع السعر وحد الكمية.','Check the price and quantity limit.'],
    INVALID_DISCOUNT:['نسب الخصم من ٠ إلى ٥٠٪ ولازم تزيد مع العدد.','Discounts must be between 0 and 50% and rise with quantity.'],
    INVALID_ADJUSTMENT:['راجع المبلغ واكتب سبب تعديل الرصيد من ٦ حروف على الأقل.','Check the amount and enter a reason of at least 6 characters.'],
    CUSTOMER_NOT_FOUND:['حساب العميل غير موجود.','Customer account not found.'],
    INVALID_CART:['راجع كميات السلة. الحد الأقصى ٥ من الباقة و٥٠ اشتراك إجمالي.','Check quantities. Maximum 5 per plan and 50 subscriptions in total.'],
    invalid_credentials:['الإيميل أو كلمة السر غير صحيحة.','Invalid email or password.'],
    email_not_confirmed:['أكد الإيميل من الرسالة اللي وصلتك، وبعدها سجل الدخول.','Confirm your email before signing in.'],
    signup_disabled:['إنشاء الحسابات غير متاح حاليًا. تواصل مع الدعم.','Registration is currently unavailable. Contact support.'],
    over_email_send_rate_limit:['استنى شوية قبل طلب رسالة جديدة.','Please wait before requesting another email.'],
    email_address_not_authorized:['إرسال رسائل التأكيد مش جاهز حاليًا. تواصل مع الدعم.','Email confirmation is not configured yet. Contact support.'],
    INSUFFICIENT_BALANCE:['رصيدك مش كفاية. اشحن المحفظة أو اختار وسيلة دفع تانية.','Insufficient balance. Top up or choose another payment method.'],
    PRICE_CHANGED:['سعر الباقة اتحدث. اقفل نافذة الطلب وافتحها تاني لمراجعة السعر.','The price changed. Reopen checkout to review the price.'],
    PLAN_UNAVAILABLE:['الباقة غير متاحة حاليًا.','This plan is currently unavailable.'],
    PENDING_LIMIT:['عندك 3 طلبات شحن منتظرة. تابعها مع الدعم قبل طلب شحن جديد.','You already have 3 pending top-ups. Contact support.'],
    REQUEST_CONFLICT:['الطلب مسجل ببيانات مختلفة. راجعه من صفحة الحساب.','A conflicting request already exists. Check your account.'],
    ADMIN_REQUIRED:['العملية دي متاحة لإدارة المتجر فقط.','This action is restricted to store administrators.'],
    INVALID_TOPUP:['راجع المبلغ ورقم التحويل: من 50 إلى 50,000 جنيه.','Check the amount and transfer reference: EGP 50–50,000.'],
    ORDER_LIMIT:['طلبات كتير في وقت قصير. جرّب لاحقًا أو تواصل مع الدعم.','Too many orders. Try later or contact support.']
  };
  function errorText(error){
    const english=window.MasterLocale?.getState().language==='en';
    const code=error?.code||'';const message=error?.message||'';
    const found=errors[code]||Object.entries(errors).find(([k])=>message.includes(k))?.[1];
    if(found)return found[english?1:0];
    if(/email.*not.*authorized|email.*not.*allowed/i.test(message))return errors.email_address_not_authorized[english?1:0];
    return english?'Could not complete the request. Check your connection and try again.':'تعذر إتمام العملية. راجع الاتصال وحاول تاني.';
  }
  async function unwrap(promise){const {data,error}=await promise;if(error)throw error;return data;}
  async function user(){const {data,error}=await client.auth.getUser();if(error||!data.user)return null;return data.user;}
  async function dashboard(){
    const u=await user();if(!u)return null;
    await unwrap(client.from('master_store_profiles').upsert({user_id:u.id,name:String(u.user_metadata?.name||'').slice(0,80),phone:''},{onConflict:'user_id',ignoreDuplicates:true}));
    const [profile,wallet,topups,orders,ledger,admin]=await Promise.all([
      unwrap(client.from('master_store_profiles').select('*').eq('user_id',u.id).maybeSingle()),
      unwrap(client.from('master_store_wallets').select('balance_piasters').eq('user_id',u.id).maybeSingle()),
      unwrap(client.from('master_store_topups').select('*').eq('user_id',u.id).order('created_at',{ascending:false}).limit(50)),
      unwrap(client.from('master_store_orders').select('*').eq('user_id',u.id).order('created_at',{ascending:false}).limit(100)),
      unwrap(client.from('master_store_ledger').select('*').eq('user_id',u.id).order('created_at',{ascending:false}).limit(100)),
      unwrap(client.from('master_store_admins').select('user_id').eq('user_id',u.id).maybeSingle())
    ]);
    return {user:u,profile:profile||{name:u.user_metadata?.name||'',phone:''},balance:wallet?.balance_piasters||0,topups,orders,ledger,isAdmin:!!admin};
  }
  async function quote(product,planIndex){return unwrap(client.from('master_store_plans').select('*').eq('product_id',product).eq('plan_index',planIndex).eq('available',true).single());}
  async function placeOrder(order,quoteAmount,id){return unwrap(client.rpc('master_store_place_order',{
    request_id:id,product_key:order.productId,plan_number:order.planIndex,qty:order.quantity,
    contact:order.customer,method:order.payment,quoted_amount:quoteAmount
  }));}
  function asLocalOrder(o){return {id:o.id,createdAt:o.created_at,productId:o.product_id,product:o.product,plan:o.plan,duration:o.duration,quantity:o.quantity,total:o.amount_piasters/100,displayTotal:o.amount_piasters/100,displayCurrency:'EGP',payment:o.payment,status:o.status,customer:o.customer};}
  const providersReady=fetch(url+'/auth/v1/settings',{headers:{apikey:key},signal:AbortSignal.timeout(8000)}).then(r=>r.ok?r.json():null).then(settings=>settings?.external||{}).catch(()=>({}));
  const googleReady=providersReady.then(x=>!!x.google),githubReady=providersReady.then(x=>!!x.github);
  window.MasterCloud={ready:true,client,user,dashboard,quote,placeOrder,asLocalOrder,errorText,unwrap,redirect,googleReady,githubReady};
})();
