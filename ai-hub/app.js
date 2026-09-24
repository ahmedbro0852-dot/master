const $=id=>document.getElementById(id);

function renderIcons(root=document){
  if(window.lucide?.createIcons){
    window.lucide.createIcons({
      root,
      attrs:{'stroke-width':1.7,'aria-hidden':'true'}
    });
  }
}

const views={
  home:$('homeView'),
  discover:$('discoverView'),
  workspace:$('workspaceView'),
  pricing:$('pricingView')
};

const toolPanels={
  chat:$('chatTool'),
  images:$('imagesTool'),
  video:$('videoTool')
};

const toolLabels={chat:'Chat',images:'Images',video:'Video'};
const activityKey='nasha-activity-v1';
const chatKey='nasha-chat-v1';
const settingsKey='nasha-settings-v3';
const profileKey='nasha-profile-v1';

function switchView(name){
  document.body.classList.toggle('app-view',name==='workspace');
  Object.entries(views).forEach(([key,view])=>view?.classList.toggle('active',key===name));
  document.querySelectorAll('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===name));
  window.scrollTo({top:0,behavior:'smooth'});
}

function openTool(name){
  if(!toolPanels[name])name='chat';
  switchView('workspace');
  Object.entries(toolPanels).forEach(([key,panel])=>panel?.classList.toggle('active',key===name));
  document.querySelectorAll('[data-tool]').forEach(button=>button.classList.toggle('active',button.dataset.tool===name));
  if($('workspaceTitle'))$('workspaceTitle').textContent=toolLabels[name]||name;
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  const target=button.dataset.view;
  if(target==='workspace')openTool('chat');
  else switchView(target);
}));

document.querySelectorAll('[data-viewjump]').forEach(button=>button.addEventListener('click',event=>{
  event.preventDefault();
  const target=button.dataset.viewjump;
  if(target==='workspace')openTool('chat');
  else switchView(target);
}));

document.querySelectorAll('[data-tool]').forEach(button=>button.addEventListener('click',()=>openTool(button.dataset.tool)));
document.querySelectorAll('[data-workspace]').forEach(button=>button.addEventListener('click',event=>{
  event.preventDefault();
  openTool(button.dataset.workspace);
}));

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[char]);
}

/* local chat */
function getChat(){
  try{
    const value=JSON.parse(localStorage.getItem(chatKey)||'[]');
    return Array.isArray(value)?value:[];
  }catch{return []}
}
function setChat(items){
  localStorage.setItem(chatKey,JSON.stringify(items.slice(-60)));
}
function renderChat(){
  const messages=$('chatMessages');
  const empty=$('chatEmpty');
  if(!messages)return;
  const items=getChat();
  empty?.classList.toggle('hidden',items.length>0);
  messages.innerHTML=items.map(item=>
    '<div class="chat-message '+escapeHtml(item.role)+'"><span class="message-avatar">'+(item.role==='user'?getProfileInitial():'N')+'</span><div><small>'+(item.role==='user'?'You':'Nasha')+'</small><p>'+escapeHtml(item.text)+'</p></div></div>'
  ).join('');
  messages.scrollTop=messages.scrollHeight;
}
function sendChat(text){
  const value=String(text||'').trim();
  if(!value)return;
  const items=getChat();
  items.push({role:'user',text:value,time:new Date().toISOString()});
  setChat(items);
  addActivity('chat',value.slice(0,52),value);
  if($('chatInput'))$('chatInput').value='';
  renderChat();
  renderChatSessions();
}
function newChat(){
  localStorage.removeItem(chatKey);
  renderChat();
  openTool('chat');
  $('chatInput')?.focus();
}
$('chatSend')?.addEventListener('click',()=>sendChat($('chatInput')?.value));
$('chatInput')?.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&!event.shiftKey){
    event.preventDefault();
    sendChat(event.currentTarget.value);
  }
});
$('newChatButton')?.addEventListener('click',newChat);
document.querySelectorAll('[data-chat-suggestion]').forEach(button=>button.addEventListener('click',()=>{
  if($('chatInput'))$('chatInput').value=button.dataset.chatSuggestion;
  $('chatInput')?.focus();
}));
$('composerAttach')?.addEventListener('click',()=>showToast('Attachments will be connected later'));

/* history */
function getActivity(){
  try{
    const value=JSON.parse(localStorage.getItem(activityKey)||'[]');
    return Array.isArray(value)?value:[];
  }catch{return []}
}
function saveActivity(items){
  localStorage.setItem(activityKey,JSON.stringify(items.slice(0,60)));
  renderHistory();
  renderChatSessions();
}
function addActivity(type,title,detail=''){
  const items=getActivity();
  items.unshift({
    id:Date.now()+'-'+Math.random().toString(36).slice(2,7),
    type,title,detail,updatedAt:new Date().toISOString()
  });
  saveActivity(items);
}
function formatTime(value){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return 'Recently';
  return date.toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
}
let historyFilter='all';
function renderHistory(){
  const list=$('historyList');
  if(!list)return;
  const all=getActivity();
  const items=historyFilter==='all'?all:all.filter(item=>item.type===historyFilter);
  if(!items.length){
    list.innerHTML='<div class="empty-state">No history here yet.</div>';
    return;
  }
  const icon={chat:'message-square',image:'image',video:'video'};
  list.innerHTML=items.map(item=>
    '<button class="history-entry" data-history-type="'+escapeHtml(item.type)+'"><span><i data-lucide="'+icon[item.type]+'"></i></span><div><strong>'+escapeHtml(item.title||'Untitled')+'</strong><small>'+escapeHtml(item.type)+' · '+formatTime(item.updatedAt)+'</small></div><i data-lucide="chevron-right"></i></button>'
  ).join('');
  renderIcons(list);
  list.querySelectorAll('[data-history-type]').forEach(button=>button.addEventListener('click',()=>{
    closeDrawers();
    openTool(button.dataset.historyType==='image'?'images':button.dataset.historyType);
  }));
}
function renderChatSessions(){
  const list=$('chatSessionList');
  if(!list)return;
  const chats=getActivity().filter(item=>item.type==='chat').slice(0,7);
  const base='<button class="chat-session active" id="sessionNew"><i data-lucide="message-square"></i><span><strong>Current conversation</strong><small>Open now</small></span></button>';
  list.innerHTML=base+chats.map(item=>
    '<button class="chat-session"><i data-lucide="clock-3"></i><span><strong>'+escapeHtml(item.title)+'</strong><small>'+formatTime(item.updatedAt)+'</small></span></button>'
  ).join('');
  renderIcons(list);
}
document.querySelectorAll('[data-history-filter]').forEach(button=>button.addEventListener('click',()=>{
  historyFilter=button.dataset.historyFilter;
  document.querySelectorAll('[data-history-filter]').forEach(item=>item.classList.toggle('active',item===button));
  renderHistory();
}));
$('clearHistory')?.addEventListener('click',()=>{
  localStorage.removeItem(activityKey);
  renderHistory();
  renderChatSessions();
  showToast('History cleared');
});

/* image/video drafts */
function saveCreation(type,prompt){
  const value=String(prompt||'').trim();
  if(!value){
    showToast('Add a description first');
    return false;
  }
  addActivity(type,value.slice(0,52),value);
  return true;
}
$('imageCreateButton')?.addEventListener('click',()=>{
  if(!saveCreation('image',$('imagePrompt')?.value))return;
  $('imageStage').innerHTML='<div class="stage-empty saved-draft"><span><i data-lucide="check"></i></span><strong>Image draft saved</strong><small>Live image creation will connect with the service layer later.</small></div>';
  renderIcons($('imageStage'));
  showToast('Image draft saved to history');
});
$('videoCreateButton')?.addEventListener('click',()=>{
  if(!saveCreation('video',$('videoPrompt')?.value))return;
  $('videoStage').innerHTML='<div class="stage-empty saved-draft"><span><i data-lucide="check"></i></span><strong>Video draft saved</strong><small>Live video creation will connect with the service layer later.</small></div>';
  renderIcons($('videoStage'));
  showToast('Video draft saved to history');
});

/* drawers */
const backdrop=$('backdrop');
function openDrawer(id){
  const drawer=$(id);
  if(!drawer)return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  backdrop?.classList.add('show');
}
function closeDrawers(){
  document.querySelectorAll('.drawer.open').forEach(drawer=>{
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
  });
  backdrop?.classList.remove('show');
}
['workspaceHistory','topHistory','historyFromChat'].forEach(id=>$(id)?.addEventListener('click',()=>{
  renderHistory();openDrawer('historyDrawer');
}));
['workspaceSettings','topSettings','settingsOpen'].forEach(id=>$(id)?.addEventListener('click',()=>openDrawer('settingsDrawer')));
['accountOpen','topAccount'].forEach(id=>$(id)?.addEventListener('click',()=>openDrawer('accountDrawer')));
backdrop?.addEventListener('click',closeDrawers);
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',closeDrawers));

/* settings */
const displayName=$('displayName');
const languageSetting=$('languageSetting');
function loadSettings(){
  try{
    const settings=JSON.parse(localStorage.getItem(settingsKey)||'{}');
    if(displayName&&settings.name)displayName.value=settings.name;
    if(languageSetting&&settings.language)languageSetting.value=settings.language;
  }catch{}
}
$('saveSettings')?.addEventListener('click',()=>{
  localStorage.setItem(settingsKey,JSON.stringify({
    name:displayName?.value.trim()||'',
    language:languageSetting?.value||'English'
  }));
  if(displayName?.value.trim()){
    const profile=getProfile();
    profile.name=displayName.value.trim();
    localStorage.setItem(profileKey,JSON.stringify(profile));
    syncProfile();
  }
  closeDrawers();
  showToast('Settings saved');
});

/* account */
function getProfile(){
  try{return JSON.parse(localStorage.getItem(profileKey)||'{}')||{}}catch{return {}}
}
function getProfileInitial(){
  const profile=getProfile();
  return (profile.name||profile.email||'N').trim().charAt(0).toUpperCase()||'N';
}
function syncProfile(){
  const profile=getProfile();
  const name=profile.name||'Guest';
  const email=profile.email||'Not signed in';
  const initial=getProfileInitial();
  ['accountAvatar','topAccountAvatar','drawerAccountAvatar'].forEach(id=>{
    const el=$(id);
    if(!el)return;
    el.textContent=profile.photo?'':initial;
    el.style.backgroundImage=profile.photo?'url("'+profile.photo+'")':'';
    el.classList.toggle('has-photo',Boolean(profile.photo));
  });
  if($('accountName'))$('accountName').textContent=name;
  if($('drawerAccountName'))$('drawerAccountName').textContent=name;
  if($('drawerAccountEmail'))$('drawerAccountEmail').textContent=email;
}
$('changeProfilePhoto')?.addEventListener('click',()=>$('profilePhotoInput')?.click());
$('profilePhotoInput')?.addEventListener('change',event=>{
  const file=event.target.files?.[0];
  if(!file)return;
  if(!file.type.startsWith('image/')){showToast('Choose an image file');return}
  if(file.size>2*1024*1024){showToast('Choose an image under 2 MB');return}
  const reader=new FileReader();
  reader.onload=()=>{
    const profile=getProfile();
    profile.photo=String(reader.result||'');
    localStorage.setItem(profileKey,JSON.stringify(profile));
    syncProfile();
    showToast('Profile photo updated');
  };
  reader.readAsDataURL(file);
});
document.querySelectorAll('[data-auth-tab]').forEach(button=>button.addEventListener('click',()=>{
  const tab=button.dataset.authTab;
  document.querySelectorAll('[data-auth-tab]').forEach(item=>item.classList.toggle('active',item.dataset.authTab===tab));
  document.querySelectorAll('[data-auth-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.authPanel===tab));
}));
$('registerForm')?.addEventListener('submit',event=>{
  event.preventDefault();
  const name=$('registerName')?.value.trim();
  const email=$('registerEmail')?.value.trim();
  if(!name||!email){showToast('Add your name and email');return}
  localStorage.setItem(profileKey,JSON.stringify({name,email}));
  syncProfile();
  closeDrawers();
  showToast('Profile created locally');
});
$('signinForm')?.addEventListener('submit',event=>{
  event.preventDefault();
  const email=$('signinEmail')?.value.trim();
  if(!email){showToast('Add your email');return}
  const profile=getProfile();
  profile.email=email;
  if(!profile.name)profile.name=email.split('@')[0];
  localStorage.setItem(profileKey,JSON.stringify(profile));
  syncProfile();
  closeDrawers();
  showToast('Profile loaded locally');
});

/* mobile menu */
const mobileMenu=$('mobileMenu');
function openMobileMenu(){
  mobileMenu?.classList.add('open');
  mobileMenu?.setAttribute('aria-hidden','false');
  document.body.classList.add('menu-open');
  renderIcons();
}
function closeMobileMenu(){
  mobileMenu?.classList.remove('open');
  mobileMenu?.setAttribute('aria-hidden','true');
  document.body.classList.remove('menu-open');
}
$('mobileMenuOpen')?.addEventListener('click',openMobileMenu);
$('mobileMenuClose')?.addEventListener('click',closeMobileMenu);
document.querySelectorAll('[data-menu-view]').forEach(button=>button.addEventListener('click',()=>{
  closeMobileMenu();switchView(button.dataset.menuView);
}));
document.querySelectorAll('[data-menu-workspace]').forEach(button=>button.addEventListener('click',()=>{
  closeMobileMenu();openTool('chat');
}));

/* legal */
const legalModal=$('legalModal');
const legalTitle=$('legalTitle');
const legalBody=$('legalBody');
const legalClose=$('legalClose');
const legalCopy={
  privacy:{title:'Privacy',body:[
    'Nasha is currently a product preview. Before public launch, this page will explain what data is collected, why it is used, how long it is retained, and which service providers process it.',
    'Until live services are connected, avoid entering sensitive personal, financial, medical, or confidential information.'
  ]},
  terms:{title:'Terms',body:[
    'Nasha is currently an early product preview. Public terms of service, acceptable-use rules, billing terms, and account policies will be published before paid access opens.',
    'Features and plan limits shown in this preview may change before launch.'
  ]}
};
function openLegal(type){
  const copy=legalCopy[type];
  if(!copy||!legalModal)return;
  if(legalTitle)legalTitle.textContent=copy.title;
  if(legalBody)legalBody.innerHTML=copy.body.map(text=>'<p>'+escapeHtml(text)+'</p>').join('');
  legalModal.classList.add('open');
  legalModal.setAttribute('aria-hidden','false');
}
function closeLegal(){
  legalModal?.classList.remove('open');
  legalModal?.setAttribute('aria-hidden','true');
}
document.querySelectorAll('[data-legal]').forEach(button=>button.addEventListener('click',()=>openLegal(button.dataset.legal)));
legalClose?.addEventListener('click',closeLegal);
legalModal?.addEventListener('click',event=>{if(event.target===legalModal)closeLegal()});

/* toast + global */
const toast=$('toast');
let toastTimer;
function showToast(message){
  if(!toast)return;
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),1800);
}
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){closeDrawers();closeLegal();closeMobileMenu()}
});
const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('revealed');revealObserver.unobserve(entry.target)}
  });
},{threshold:.14}):null;
document.querySelectorAll('.reveal-item').forEach(el=>revealObserver?revealObserver.observe(el):el.classList.add('revealed'));
const marketingHeader=document.querySelector('.site-header');
function syncHeaderScroll(){marketingHeader?.classList.toggle('scrolled',window.scrollY>16)}
window.addEventListener('scroll',syncHeaderScroll,{passive:true});

loadSettings();
syncProfile();
renderChat();
renderHistory();
renderChatSessions();
renderIcons();
syncHeaderScroll();