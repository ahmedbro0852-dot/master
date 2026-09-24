const navButtons=[...document.querySelectorAll('[data-view]')];
const views={
  home:document.getElementById('homeView'),
  discover:document.getElementById('discoverView'),
  workspace:document.getElementById('workspaceView'),
  files:document.getElementById('filesView'),
  pricing:document.getElementById('pricingView')
};

function switchView(name){
  navButtons.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  Object.entries(views).forEach(([k,v])=>v&&v.classList.toggle('active',k===name));
  window.scrollTo({top:0,behavior:'smooth'});
}
navButtons.forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
document.querySelectorAll('[data-viewjump]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();switchView(b.dataset.viewjump)}));

const toolButtons=[...document.querySelectorAll('[data-tool]')];
const tools={chat:chatTool,image:imageTool,video:videoTool,voice:voiceTool,translate:translateTool};
function openTool(name){
  switchView('workspace');
  toolButtons.forEach(b=>b.classList.toggle('active',b.dataset.tool===name));
  Object.entries(tools).forEach(([k,v])=>v.classList.toggle('active',k===name));
  workspaceTitle.textContent=name.charAt(0).toUpperCase()+name.slice(1);
}
toolButtons.forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.tool)));
document.querySelectorAll('[data-workspace]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.workspace)));

const historyKey='nasha-history-v1';
const settingsKey='nasha-settings-v1';
function getHistory(){try{return JSON.parse(localStorage.getItem(historyKey)||'[]')}catch{return[]}}
function saveHistory(item){
  const all=getHistory();
  all.unshift({text:item,type:'chat',at:new Date().toISOString()});
  localStorage.setItem(historyKey,JSON.stringify(all.slice(0,30)));
  renderHistory();
}
function renderHistory(){
  const all=getHistory();
  historyList.innerHTML=all.length?all.map((x,i)=>`<button class="history-entry" data-history-index="${i}"><strong>${escapeHtml(x.text)}</strong><span>${new Date(x.at).toLocaleString()}</span></button>`).join(''):'<div class="history-empty">Nothing here yet.</div>';
  historyList.querySelectorAll('[data-history-index]').forEach(b=>b.addEventListener('click',()=>{const item=all[Number(b.dataset.historyIndex)];closeDrawers();openTool('chat');promptInput.value=item.text;promptInput.focus()}));
}
function escapeHtml(str){return str.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

const input=document.getElementById('promptInput');
const stream=document.getElementById('chatStream');
function sendPrompt(text){
  const value=(text||input.value).trim();
  if(!value)return;
  openTool('chat');
  chatEmpty.style.display='none';
  const user=document.createElement('div');user.className='bubble user';user.textContent=value;stream.appendChild(user);
  input.value='';saveHistory(value);
  const reply=document.createElement('div');reply.className='bubble ai generating';reply.textContent='Preparing preview…';stream.appendChild(reply);
  setTimeout(()=>{reply.classList.remove('generating');reply.textContent='Preview mode is ready. The final live response will come from the connected provider once API keys are added.';reply.scrollIntoView({behavior:'smooth',block:'end'})},650);
}
sendBtn.addEventListener('click',()=>sendPrompt());
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendPrompt()}});
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>sendPrompt(b.dataset.prompt)));

function fakeGenerate(button,output,label){
  if(!button)return;
  button.addEventListener('click',()=>{
    button.classList.add('loading');button.textContent='Preparing…';
    output.classList.add('generating');
    setTimeout(()=>{button.classList.remove('loading');button.textContent=label;output.classList.remove('generating');output.innerHTML='<span>Ready for live generation when the provider is connected.</span>';showToast('Preview prepared')},700);
  });
}
fakeGenerate(imageCreate,imageOutput,'Create image');
fakeGenerate(videoCreate,videoOutput,'Create video');

document.querySelectorAll('[data-voice-action]').forEach(b=>b.addEventListener('click',()=>showToast(b.dataset.voiceAction+' is ready for backend connection')));

translateBtn.addEventListener('click',()=>{
  if(!translateSource.value.trim())return showToast('Add text to translate');
  translateBtn.classList.add('loading');translateBtn.textContent='Translating…';
  setTimeout(()=>{translateBtn.classList.remove('loading');translateBtn.textContent='Translate';translateResult.value='Preview only — live translation will appear here after provider connection.'},550);
});

const modelPicker=document.getElementById('modelPicker');
modelPicker.addEventListener('click',e=>{e.stopPropagation();modelMenu.classList.toggle('open')});
document.addEventListener('click',()=>modelMenu.classList.remove('open'));
modelMenu.addEventListener('click',e=>e.stopPropagation());
modelMenu.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{modelPicker.firstChild.textContent=b.dataset.model+' ';modelMenu.classList.remove('open');showToast(b.dataset.model+' selected')}));

const fileInput=document.getElementById('fileInput');
chooseFiles.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',()=>renderFiles([...fileInput.files]));
['dragenter','dragover'].forEach(evt=>uploadBox.addEventListener(evt,e=>{e.preventDefault();uploadBox.classList.add('drag')}));
['dragleave','drop'].forEach(evt=>uploadBox.addEventListener(evt,e=>{e.preventDefault();uploadBox.classList.remove('drag')}));
uploadBox.addEventListener('drop',e=>renderFiles([...e.dataTransfer.files]));
function renderFiles(files){
  fileQueue.innerHTML=files.map(f=>`<div class="file-item"><div><span>▤</span><div><strong>${escapeHtml(f.name)}</strong><span>${formatBytes(f.size)}</span></div></div><b>Ready</b></div>`).join('');
  if(files.length)showToast(files.length+' file'+(files.length>1?'s':'')+' added');
}
function formatBytes(n){if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(1)+' MB'}

function openDrawer(id){document.getElementById(id).classList.add('open');document.getElementById(id).setAttribute('aria-hidden','false');backdrop.classList.add('show')}
function closeDrawers(){document.querySelectorAll('.drawer.open').forEach(d=>{d.classList.remove('open');d.setAttribute('aria-hidden','true')});backdrop.classList.remove('show')}
historyOpen.addEventListener('click',()=>openDrawer('historyDrawer'));
settingsOpen.addEventListener('click',()=>openDrawer('settingsDrawer'));
workspaceHistory.addEventListener('click',()=>openDrawer('historyDrawer'));
workspaceSettings.addEventListener('click',()=>openDrawer('settingsDrawer'));
backdrop.addEventListener('click',closeDrawers);
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeDrawers));
clearHistory.addEventListener('click',()=>{localStorage.removeItem(historyKey);renderHistory();showToast('History cleared')});

function loadSettings(){try{const s=JSON.parse(localStorage.getItem(settingsKey)||'{}');if(s.name)displayName.value=s.name;if(s.mode){defaultMode.value=s.mode;modelPicker.firstChild.textContent=s.mode+' '}}catch{}}
saveSettings.addEventListener('click',()=>{localStorage.setItem(settingsKey,JSON.stringify({name:displayName.value.trim(),mode:defaultMode.value}));modelPicker.firstChild.textContent=defaultMode.value+' ';closeDrawers();showToast('Settings saved')});

let toastTimer;
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1800)}
renderHistory();loadSettings();