const navButtons=[...document.querySelectorAll('[data-view]')];
const views={
  home:document.getElementById('homeView'),
  discover:document.getElementById('discoverView'),
  workspace:document.getElementById('workspaceView'),
  files:document.getElementById('filesView')
};

function switchView(name){
  navButtons.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  Object.entries(views).forEach(([k,v])=>v.classList.toggle('active',k===name));
  window.scrollTo({top:0,behavior:'smooth'});
}

navButtons.forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
document.querySelectorAll('[data-viewjump]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();switchView(b.dataset.viewjump)}));

const toolButtons=[...document.querySelectorAll('[data-tool]')];
const tools={
  chat:document.getElementById('chatTool'),
  image:document.getElementById('imageTool'),
  video:document.getElementById('videoTool'),
  voice:document.getElementById('voiceTool'),
  translate:document.getElementById('translateTool')
};
const workspaceTitle=document.getElementById('workspaceTitle');

function openTool(name){
  switchView('workspace');
  toolButtons.forEach(b=>b.classList.toggle('active',b.dataset.tool===name));
  Object.entries(tools).forEach(([k,v])=>v.classList.toggle('active',k===name));
  workspaceTitle.textContent=name.charAt(0).toUpperCase()+name.slice(1);
}

toolButtons.forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.tool)));
document.querySelectorAll('[data-workspace]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.workspace)));

const input=document.getElementById('promptInput');
const stream=document.getElementById('chatStream');

function sendPrompt(text){
  const value=(text||input.value).trim();
  if(!value)return;
  openTool('chat');

  const user=document.createElement('div');
  user.className='bubble user';
  user.textContent=value;
  stream.appendChild(user);
  input.value='';

  const reply=document.createElement('div');
  reply.className='bubble ai';
  reply.textContent='Preview mode. Live responses will appear here when the service backend is connected.';
  setTimeout(()=>{
    stream.appendChild(reply);
    reply.scrollIntoView({behavior:'smooth',block:'end'});
  },180);
}

document.getElementById('sendBtn').addEventListener('click',()=>sendPrompt());
input.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendPrompt();}
});
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>sendPrompt(b.dataset.prompt)));

const modelPicker=document.getElementById('modelPicker');
const modelMenu=document.getElementById('modelMenu');
modelPicker.addEventListener('click',e=>{
  e.stopPropagation();
  modelMenu.classList.toggle('open');
});
document.addEventListener('click',()=>modelMenu.classList.remove('open'));
modelMenu.addEventListener('click',e=>e.stopPropagation());
modelMenu.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
  modelPicker.firstChild.textContent=b.dataset.model+' ';
  modelMenu.classList.remove('open');
}));