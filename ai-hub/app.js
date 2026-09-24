const $=id=>document.getElementById(id);

const navButtons=[...document.querySelectorAll('[data-view]')];
const views={
  home:$('homeView'),
  discover:$('discoverView'),
  workspace:$('workspaceView'),
  files:$('filesView'),
  pricing:$('pricingView')
};

function switchView(name){
  navButtons.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  Object.entries(views).forEach(([key,view])=>view&&view.classList.toggle('active',key===name));
  window.scrollTo({top:0,behavior:'smooth'});
}
navButtons.forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
document.querySelectorAll('[data-viewjump]').forEach(b=>b.addEventListener('click',e=>{
  e.preventDefault();
  switchView(b.dataset.viewjump);
}));

const toolButtons=[...document.querySelectorAll('[data-tool]')];
const tools={
  chat:$('chatTool'),
  image:$('imageTool'),
  video:$('videoTool'),
  voice:$('voiceTool'),
  translate:$('translateTool')
};
const workspaceTitle=$('workspaceTitle');

function openTool(name){
  switchView('workspace');
  toolButtons.forEach(b=>b.classList.toggle('active',b.dataset.tool===name));
  Object.entries(tools).forEach(([key,panel])=>panel&&panel.classList.toggle('active',key===name));
  const labels={chat:'Documents',image:'Design',video:'Video',voice:'Audio',translate:'Translate'};
  if(workspaceTitle)workspaceTitle.textContent=labels[name]||name;
}
toolButtons.forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.tool)));
document.querySelectorAll('[data-workspace]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.workspace)));

const historyKey='nasha-history-v1';
const settingsKey='nasha-settings-v1';
const historyList=$('historyList');
const promptInput=$('promptInput');
const chatStream=$('chatStream');
const chatEmpty=$('chatEmpty');

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function getHistory(){
  try{return JSON.parse(localStorage.getItem(historyKey)||'[]')}catch{return[]}
}
function saveHistory(text){
  const all=getHistory();
  all.unshift({text,type:'chat',at:new Date().toISOString()});
  localStorage.setItem(historyKey,JSON.stringify(all.slice(0,30)));
  renderHistory();
}
function renderHistory(){
  if(!historyList)return;
  const all=getHistory();
  historyList.innerHTML=all.length
    ?all.map((x,i)=>`<button class="history-entry" data-history-index="${i}"><strong>${escapeHtml(x.text)}</strong><span>${new Date(x.at).toLocaleString()}</span></button>`).join('')
    :'<div class="history-empty">Nothing here yet.</div>';
  historyList.querySelectorAll('[data-history-index]').forEach(b=>b.addEventListener('click',()=>{
    const item=all[Number(b.dataset.historyIndex)];
    closeDrawers();
    openTool('chat');
    if(promptInput){promptInput.value=item.text;promptInput.focus();}
    const body=$('documentBody');
    if(body){body.value=item.text;body.focus();updateDocumentMeta();}
  }));
}

function sendPrompt(text){
  const value=String(text||promptInput.value).trim();
  if(!value)return;
  openTool('chat');
  if(chatEmpty)chatEmpty.style.display='none';

  const user=document.createElement('div');
  user.className='bubble user';
  user.textContent=value;
  chatStream.appendChild(user);
  promptInput.value='';
  saveHistory(value);

  const reply=document.createElement('div');
  reply.className='bubble ai generating';
  reply.textContent='Preparing…';
  chatStream.appendChild(reply);

  setTimeout(()=>{
    reply.classList.remove('generating');
    reply.textContent='This action will be available when the workspace opens access.';
    reply.scrollIntoView({behavior:'smooth',block:'end'});
  },650);
}
$('sendBtn')?.addEventListener('click',()=>sendPrompt());
promptInput?.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendPrompt();}
});
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>sendPrompt(b.dataset.prompt)));

function fakeGenerate(button,output,label){
  if(!button||!output)return;
  button.addEventListener('click',()=>{
    button.classList.add('loading');
    const old=button.textContent;
    button.textContent='Preparing…';
    output.classList.add('generating');
    setTimeout(()=>{
      button.classList.remove('loading');
      button.textContent=label||old;
      output.classList.remove('generating');
      output.innerHTML='<div class="canvas-empty"><strong>Draft ready area</strong><small>This action will be available when the workspace opens access.</small></div>';
      showToast('Preview prepared');
    },700);
  });
}
fakeGenerate($('imageCreate'),$('imageOutput'),'Create image');
fakeGenerate($('videoCreate'),$('videoOutput'),'Create video');

document.querySelectorAll('[data-voice-action]').forEach(b=>b.addEventListener('click',()=>{
  showToast(b.dataset.voiceAction+' will be available in this workspace');
}));

$('translateBtn')?.addEventListener('click',()=>{
  const source=$('translateSource');
  const result=$('translateResult');
  const button=$('translateBtn');
  if(!source.value.trim())return showToast('Add text to translate');
  button.classList.add('loading');
  button.textContent='Translating…';
  setTimeout(()=>{
    button.classList.remove('loading');
    button.textContent='Translate';
    result.value='Translation will be available when this workspace opens access.';
  },550);
});

const modelPicker=$('modelPicker');
const modelMenu=null;
modelPicker?.addEventListener('click',e=>{
  e.stopPropagation();
  modelMenu?.classList.toggle('open');
});
document.addEventListener('click',()=>modelMenu?.classList.remove('open'));
modelMenu?.addEventListener('click',e=>e.stopPropagation());
modelMenu?.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
  if(modelPicker&&modelPicker.childNodes.length) modelPicker.childNodes[0].nodeValue=b.dataset.model+' ';
  modelMenu.classList.remove('open');
  showToast(b.dataset.model+' selected');
}));

const fileInput=$('fileInput');
const chooseFiles=$('chooseFiles');
const uploadBox=$('uploadBox');
const fileQueue=$('fileQueue');
chooseFiles?.addEventListener('click',()=>fileInput.click());
fileInput?.addEventListener('change',()=>renderFiles([...fileInput.files]));
['dragenter','dragover'].forEach(evt=>uploadBox?.addEventListener(evt,e=>{
  e.preventDefault();
  uploadBox.classList.add('drag');
}));
['dragleave','drop'].forEach(evt=>uploadBox?.addEventListener(evt,e=>{
  e.preventDefault();
  uploadBox.classList.remove('drag');
}));
uploadBox?.addEventListener('drop',e=>renderFiles([...e.dataTransfer.files]));

function renderFiles(files){
  if(!fileQueue)return;
  fileQueue.innerHTML=files.map(f=>`<div class="file-item"><div><span>▤</span><div><strong>${escapeHtml(f.name)}</strong><span>${formatBytes(f.size)}</span></div></div><b>Ready</b></div>`).join('');
  if(files.length)showToast(files.length+' file'+(files.length>1?'s':'')+' added');
}
function formatBytes(n){
  if(n<1024)return n+' B';
  if(n<1048576)return (n/1024).toFixed(1)+' KB';
  return (n/1048576).toFixed(1)+' MB';
}

const backdrop=$('backdrop');
function openDrawer(id){
  const drawer=$(id);
  if(!drawer)return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  backdrop?.classList.add('show');
}
function closeDrawers(){
  document.querySelectorAll('.drawer.open').forEach(d=>{
    d.classList.remove('open');
    d.setAttribute('aria-hidden','true');
  });
  backdrop?.classList.remove('show');
}
$('historyOpen')?.addEventListener('click',()=>openDrawer('historyDrawer'));
$('settingsOpen')?.addEventListener('click',()=>openDrawer('settingsDrawer'));
$('workspaceHistory')?.addEventListener('click',()=>openDrawer('historyDrawer'));
$('workspaceSettings')?.addEventListener('click',()=>openDrawer('settingsDrawer'));
backdrop?.addEventListener('click',closeDrawers);
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeDrawers));
$('clearHistory')?.addEventListener('click',()=>{
  localStorage.removeItem(historyKey);
  renderHistory();
  showToast('History cleared');
});

const displayName=$('displayName');
const defaultMode=null;
function loadSettings(){
  try{
    const s=JSON.parse(localStorage.getItem(settingsKey)||'{}');
    if(s.name&&displayName)displayName.value=s.name;
    if(s.mode&&defaultMode){
      defaultMode.value=s.mode;
      if(modelPicker)modelPicker.childNodes[0].nodeValue=s.mode+' ';
    }
  }catch{}
}
$('saveSettings')?.addEventListener('click',()=>{
  localStorage.setItem(settingsKey,JSON.stringify({
    name:displayName?.value.trim()||'',
    mode:'workspace'
  }));
  if(modelPicker)modelPicker.childNodes[0].nodeValue=(defaultMode?.value||'Smart mode')+' ';
  closeDrawers();
  showToast('Settings saved');
});

const toast=$('toast');
let toastTimer;
function showToast(message){
  if(!toast)return;
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),1800);
}

renderHistory();
loadSettings();
const legalModal=$('legalModal');
const legalTitle=$('legalTitle');
const legalBody=$('legalBody');
const legalClose=$('legalClose');

const legalCopy={
  privacy:{
    title:'Privacy',
    body:[
      'Nasha is being prepared for public access. Before launch, this page will describe exactly what data is collected, why it is used, how long it is retained, and which service providers process it.',
      'Until live services are connected, avoid entering sensitive personal, financial, medical, or confidential information into this preview.'
    ]
  },
  terms:{
    title:'Terms',
    body:[
      'Nasha is currently an early product preview. Public terms of service, acceptable-use rules, billing terms, and account policies will be published before paid or live access opens.',
      'Features and plan limits shown during this preview may change before launch.'
    ]
  }
};

function openLegal(type){
  const copy=legalCopy[type];
  if(!copy||!legalModal)return;
  legalTitle.textContent=copy.title;
  legalBody.innerHTML=copy.body.map(p=>'<p>'+p+'</p>').join('');
  legalModal.classList.add('open');
  legalModal.setAttribute('aria-hidden','false');
  legalClose?.focus();
}
function closeLegal(){
  legalModal?.classList.remove('open');
  legalModal?.setAttribute('aria-hidden','true');
}
document.querySelectorAll('[data-legal]').forEach(b=>b.addEventListener('click',()=>openLegal(b.dataset.legal)));
legalClose?.addEventListener('click',closeLegal);
legalModal?.addEventListener('click',e=>{if(e.target===legalModal)closeLegal()});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    closeLegal();
    closeDrawers();
    modelMenu?.classList.remove('open');
  }
});
$('newChatBtn')?.addEventListener('click',()=>{
  openTool('chat');
  const title=$('documentTitle');
  const body=$('documentBody');
  if(title)title.value='Untitled document';
  if(body){body.value='';body.focus();}
  localStorage.removeItem('nasha-document-v1');
  updateDocumentMeta();
});
$('topHistory')?.addEventListener('click',()=>openDrawer('historyDrawer'));
$('topSettings')?.addEventListener('click',()=>openDrawer('settingsDrawer'));
$('chatAttach')?.addEventListener('click',()=>switchView('files'));

const documentTitle=$('documentTitle');
const documentBody=$('documentBody');
const saveState=$('saveState');
const wordCount=$('wordCount');
const documentKey='nasha-document-v1';
let documentSaveTimer;

function updateDocumentMeta(){
  const words=(documentBody?.value.trim().match(/\S+/g)||[]).length;
  if(wordCount)wordCount.textContent=words+' word'+(words===1?'':'s');
}
function saveDocument(){
  if(!documentTitle||!documentBody)return;
  localStorage.setItem(documentKey,JSON.stringify({
    title:documentTitle.value||'Untitled document',
    body:documentBody.value,
    updatedAt:new Date().toISOString()
  }));
  if(saveState){saveState.textContent='Saved';saveState.classList.remove('saving');}
  updateDocumentMeta();
}
function queueDocumentSave(){
  if(saveState){saveState.textContent='Saving…';saveState.classList.add('saving');}
  clearTimeout(documentSaveTimer);
  documentSaveTimer=setTimeout(saveDocument,350);
}
try{
  const saved=JSON.parse(localStorage.getItem(documentKey)||'null');
  if(saved&&documentTitle&&documentBody){
    documentTitle.value=saved.title||'Untitled document';
    documentBody.value=saved.body||'';
  }
}catch{}
documentTitle?.addEventListener('input',queueDocumentSave);
documentBody?.addEventListener('input',queueDocumentSave);
updateDocumentMeta();