(function(){
'use strict';
const C=window.MasterCloud,menu=document.getElementById('workspaceAccount');
if(!menu)return;
const email=document.getElementById('workspaceAccountEmail'),message=document.getElementById('workspaceSessionMessage'),buttons=[...menu.querySelectorAll('[data-session-action]')];
let epoch=0,busy=false,signed=false;
const t=ar=>ar;
function display(user){signed=!!user;email.textContent=user?.email||t(user?'حساب مسجل الدخول':'لم تسجل الدخول',user?'Signed-in account':'Not signed in');buttons.forEach(b=>b.disabled=busy||!signed);}
async function refresh(){const version=++epoch;try{const user=await C.user();if(version===epoch)display(user);}catch{if(version===epoch){display(null);email.textContent=t('تعذر تحميل الحساب. حدّث الصفحة.','Could not load account. Refresh the page.');}}}
if(!C?.ready||!C.client?.auth){display(null);return;}
C.client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){epoch++;display(null);}else if(event==='SIGNED_IN'||event==='USER_UPDATED'){epoch++;display(session?.user);}});
buttons.forEach(button=>button.addEventListener('click',async()=>{
 if(busy||!signed)return;
 busy=true;buttons.forEach(b=>b.disabled=true);message.hidden=false;message.textContent=t('جارٍ تسجيل الخروج…','Signing out…');menu.setAttribute('aria-busy','true');
 try{
  const result=await C.client.auth.signOut({scope:'local'});if(result.error)throw result.error;
  epoch++;display(null);
  document.getElementById('adminContent')?.replaceChildren();document.getElementById('crmRoot')?.replaceChildren();
  location.assign(button.dataset.sessionAction==='switch'?'account.html?switch=1':'account.html');
 }catch(error){message.textContent=t('تعذر تسجيل الخروج. حاول مرة أخرى. ','Could not sign out. Try again. ')+(C.errorText?.(error)||'');}
 finally{busy=false;buttons.forEach(b=>b.disabled=!signed);menu.removeAttribute('aria-busy');}
}));
document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
refresh();
})();
