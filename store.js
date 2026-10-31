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
    if((currency||getMarket().currency)==='EGP'){
      return new Intl.NumberFormat(window.MasterLocale?.getState().language==='en'?'en-EG':'ar-EG',{style:'currency',currency:'EGP',numberingSystem:'latn',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(v)||0);
    }
    return window.MasterLocale?window.MasterLocale.formatCurrency(Number(v)||0,currency||getMarket().currency):Number(v).toLocaleString('en-US')+' ج';
  }
  function money(v){
    return window.MasterLocale?window.MasterLocale.money(Number(v)||0):Number(v).toLocaleString('en-US')+' ج';
  }
  function planAmount(plan,key){
    if(plan?.manualPrice&&(!key||key==='price')&&getMarket().currency==='EGP')return Number(plan.price)||0;
    return window.MasterLocale?window.MasterLocale.planAmount(plan,key):Number(plan?.[key||'price']||0);
  }
  function planMoney(plan,key){
    if(plan?.manualPrice&&(!key||key==='price')&&getMarket().currency==='EGP')return formatCurrency(plan.price,'EGP');
    return window.MasterLocale?window.MasterLocale.planMoney(plan,key):money(plan?.[key||'price']||0);
  }
  function previousPrice(plan,currency){
    if(!plan||plan.available===false)return null;
    const value=Number(plan.previousStorePrice||(!plan.storePriceHistoryKnown&&!plan.officialPrice?plan.oldPrice:0));
    const previous=currency==='EGP'?value:planAmount({price:value});
    const current=currency==='EGP'?Number(plan.price):planAmount(plan);
    if(!(value>0)||!Number.isFinite(previous)||!Number.isFinite(current)||previous<=current||current<=0)return null;
    return {value,previous,current,saving:previous-current,percent:Math.round((previous-current)/previous*1000)/10,money:currency==='EGP'?formatCurrency(value,'EGP'):planMoney({price:value})};
  }
  function previousPriceMarkup(plan,currency){
    const prior=previousPrice(plan,currency);if(!prior)return '';
    const english=window.MasterLocale?.getState().language==='en';
    return '<span class="plan-previous-price" aria-label="'+escapeHtml((english?'Previous store price: ':'سعر المتجر السابق: ')+prior.money)+'"><small>'+ (english?'Previously':'بدلًا من')+'</small><del>'+escapeHtml(prior.money)+'</del></span>';
  }
  function priceMarkup(plan,options={}){
    const current=options.currency==='EGP'?formatCurrency(plan.price,'EGP'):planMoney(plan),prior=previousPrice(plan,options.currency),english=window.MasterLocale?.getState().language==='en';
    return '<span class="store-price-pair plan-price-tag"><strong class="store-price-current">'+escapeHtml(current)+'</strong>'+previousPriceMarkup(plan,options.currency)+(prior&&options.showSaving!==false?'<span class="price-drop-badge" dir="ltr" aria-label="'+(english?'Save ':'توفير ')+prior.percent+'%">−'+prior.percent+'%</span>':'')+'</span>';
  }
  function officialDiscount(plan){
    if(!plan?.officialPrice||plan.priceComparison?.status==='unavailable')return null;
    const official=planAmount(plan,'oldPrice'),price=planAmount(plan);
    if(!Number.isFinite(official)||official<=0||!Number.isFinite(price)||price<0)return null;
    const percent=Math.max(0,Math.min(100,Math.floor((official-price)/official*1000+1e-8)/10));
    return {percent,saving:Math.max(0,official-price),estimated:!!plan.officialPrice.estimated};
  }
  function orderMoney(order){
    if(order&&order.displayCurrency&&order.displayTotal!=null){
      return formatCurrency(order.displayTotal,order.displayCurrency);
    }
    return money(order?.total||0);
  }
  function avatarData(user){
    let hash=2166136261;for(const c of String(user?.id||'')){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}
    const requested=user?.user_metadata?.master_avatar;
    const index=typeof requested==='string'&&/^avatar-(0[1-9]|[12][0-9]|3[0-2])$/.test(requested)?Number(requested.slice(-2))-1:(hash>>>0)%32;
    return {id:'avatar-'+String(index+1).padStart(2,'0'),path:'images/avatars/avatars-3d-'+(Math.floor(index/8)+1)+'.webp',position:((index%4)/3*100)+'% '+(Math.floor((index%8)/4)*100)+'%'};
  }
  function paymentOptions(){return ['InstaPay','Vodafone Cash','Taptap Send','CliQ','Sham Cash','PayPal','Barq','Binance / USDT'];}
  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  window.MasterStore={
    getProfile,saveProfile,clearProfile,getOrders,saveOrder,clearOrders,createOrderId,
    money,localizedAmount,formatCurrency,planAmount,planMoney,previousPrice,previousPriceMarkup,priceMarkup,officialDiscount,orderMoney,getMarket,avatarData,paymentOptions,escapeHtml
  };
})();
