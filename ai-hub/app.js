const navItems=[...document.querySelectorAll('[data-view]')];
const views={
  home:document.getElementById('homeView'),
  chat:document.getElementById('chatView'),
  images:document.getElementById('imagesView'),
  video:document.getElementById('videoView'),
  voice:document.getElementById('voiceView'),
  files:document.getElementById('filesView'),
  translate:document.getElementById('translateView')
};
function switchView(name){
  navItems.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  Object.entries(views).forEach(([key,el])=>el.classList.toggle('active',key===name));
  window.scrollTo({top:0,behavior:'smooth'});
}
navItems.forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
document.querySelectorAll('[data-viewjump]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();switchView(btn.dataset.viewjump)}));

const modelPicker=document.getElementById('modelPicker');
const modelMenu=document.getElementById('modelMenu');
modelPicker.addEventListener('click',e=>{e.stopPropagation();modelMenu.classList.toggle('open')});
document.addEventListener('click',()=>modelMenu.classList.remove('open'));
modelMenu.addEventListener('click',e=>e.stopPropagation());
modelMenu.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{modelPicker.firstChild.textContent=btn.dataset.model+' ';modelMenu.classList.remove('open')}));

const input=document.getElementById('promptInput');
const stream=document.getElementById('chatStream');
function sendPrompt(text){
  const value=(text||input.value).trim();
  if(!value)return;
  switchView('chat');
  const u=document.createElement('div');u.className='bubble user';u.textContent=value;stream.appendChild(u);
  input.value='';
  const a=document.createElement('div');a.className='bubble ai';a.textContent='This is the interface preview. Live model responses will appear here once the backend is connected.';
  setTimeout(()=>{stream.appendChild(a);a.scrollIntoView({behavior:'smooth',block:'end'})},180);
}
document.getElementById('sendBtn').addEventListener('click',()=>sendPrompt());
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendPrompt()}});
document.getElementById('newChatBtn').addEventListener('click',()=>{stream.innerHTML='';input.focus()});

const homePrompt=document.getElementById('homePrompt');
document.getElementById('homeSend').addEventListener('click',()=>{const v=homePrompt.value.trim();if(v){homePrompt.value='';sendPrompt(v)}});
homePrompt.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();document.getElementById('homeSend').click()}});
document.querySelectorAll('[data-prompt]').forEach(btn=>btn.addEventListener('click',()=>sendPrompt(btn.dataset.prompt)));