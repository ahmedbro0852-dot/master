(function () {
 'use strict';
 const C=window.MasterCloud,root=document.getElementById('crmRoot');
 if(!root||!C?.client)return;
 function today(){
   const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
   const v=k=>p.find(x=>x.type===k).value;
   return v('year')+'-'+v('month')+'-'+v('day');
 }
 function plus(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
 async function refresh(){
   const anchor=root.querySelector('.crm-heading');
   if(!anchor)return;
   const end=plus(today(),3);
   const res=await C.client.from('master_store_account_rentals').select('ends_on').eq('status','active').lte('ends_on',end).limit(500);
   if(res.error)return;
   const rows=res.data||[],late=rows.filter(x=>x.ends_on<today()).length;
   let banner=root.querySelector('#masterReuseAlert');
   if(!banner){banner=document.createElement('div');banner.id='masterReuseAlert';banner.setAttribute('role','status');banner.style.cssText='border:1px solid #f3c58b;background:#fff5e6;border-radius:14px;padding:16px;margin:16px 0;font:600 13px/2 Alexandria,system-ui,sans-serif;';anchor.after(banner);}
   banner.hidden=rows.length===0;
   if(rows.length){banner.replaceChildren();const msg=document.createElement('span');msg.textContent='🔔 حسابات اقترب موعد استردادها: '+rows.length+' خلال 3 أيام أو أقل'+(late?'، منها '+late+' فات موعدها':'')+'. ';const link=document.createElement('a');link.href='reusable-accounts.html';link.textContent='فتح إدارة الحسابات ←';link.style.cssText='color:#522ba4;text-decoration:underline;';banner.append(msg,link);}
 }
 let timer=0;
 function schedule(){if(timer)return;timer=setInterval(()=>{if(!document.hidden)refresh().catch(()=>{});},60000);refresh().catch(()=>{});}
 const obs=new MutationObserver(()=>{if(root.querySelector('.crm-heading'))schedule();});
 obs.observe(root,{childList:true,subtree:true});
 schedule();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh().catch(()=>{});});
})();