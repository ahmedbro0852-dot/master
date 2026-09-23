(function(){
  'use strict';
  const PROFILE_KEY='masterStoreProfileV1';
  const ORDERS_KEY='masterStoreOrdersV1';

  function safeJSON(value,fallback){
    try{return JSON.parse(value);}catch{return fallback;}
  }
  function getProfile(){
    return safeJSON(localStorage.getItem(PROFILE_KEY),null);
  }
  function saveProfile(profile){
    const clean={
      name:String(profile.name||'').trim().slice(0,80),
      phone:String(profile.phone||'').trim().slice(0,30),
      email:String(profile.email||'').trim().slice(0,120)
    };
    localStorage.setItem(PROFILE_KEY,JSON.stringify(clean));
    return clean;
  }
  function clearProfile(){
    localStorage.removeItem(PROFILE_KEY);
  }
  function getOrders(){
    const x=safeJSON(localStorage.getItem(ORDERS_KEY),[]);
    return Array.isArray(x)?x:[];
  }
  function saveOrder(order){
    const orders=getOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY,JSON.stringify(orders.slice(0,100)));
    return order;
  }
  function clearOrders(){
    localStorage.removeItem(ORDERS_KEY);
  }
  function createOrderId(){
    const d=new Date();
    const stamp=[
      d.getFullYear().toString().slice(-2),
      String(d.getMonth()+1).padStart(2,'0'),
      String(d.getDate()).padStart(2,'0')
    ].join('');
    const rnd=Math.random().toString(36).slice(2,6).toUpperCase();
    return 'MS-'+stamp+'-'+rnd;
  }
  function getMarket(){
    return window.MasterLocale?window.MasterLocale.currentMarket():{code:'EG',currency:'EGP'};
  }
  function localizedAmount(v){
    return window.MasterLocale?window.MasterLocale.convertEGP(Number(v)||0):Number(v)||0;
  }
  function formatCurrency(v,currency){
    return window.MasterLocale?window.MasterLocale.formatCurrency(Number(v)||0,currency||getMarket().currency):Number(v).toLocaleString('en-US')+' ج';
  }
  function money(v){
    return window.MasterLocale?window.MasterLocale.money(Number(v)||0):Number(v).toLocaleString('en-US')+' ج';
  }
  function planAmount(plan,key){
    return window.MasterLocale?window.MasterLocale.planAmount(plan,key):Number(plan?.[key||'price']||0);
  }
  function planMoney(plan,key){
    return window.MasterLocale?window.MasterLocale.planMoney(plan,key):money(plan?.[key||'price']||0);
  }
  function orderMoney(order){
    if(order&&order.displayCurrency&&order.displayTotal!=null){
      return formatCurrency(order.displayTotal,order.displayCurrency);
    }
    return money(order?.total||0);
  }
  function paymentOptions(){
    const market=getMarket();
    const en=window.MasterLocale?.getState().language==='en';
    if(market.code==='EG')return ['InstaPay','Vodafone Cash','Binance / USDT'];
    return ['Binance / USDT',en?'Local payment method — confirmed by support':'طريقة دفع محلية — بعد التأكيد'];
  }
  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  window.MasterStore={
    getProfile,saveProfile,clearProfile,getOrders,saveOrder,clearOrders,createOrderId,
    money,localizedAmount,formatCurrency,planAmount,planMoney,orderMoney,getMarket,paymentOptions,escapeHtml
  };
})();