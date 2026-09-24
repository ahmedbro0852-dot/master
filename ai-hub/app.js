const navItems=[...document.querySelectorAll('.nav-item')];
const views={
  home:document.getElementById('homeView'),
  chat:document.getElementById('chatView'),
  images:document.getElementById('imagesView'),
  video:document.getElementById('videoView'),
  voice:document.getElementById('voiceView'),
  files:document.getElementById('filesView'),
  translate:document.getElementById('translateView'),
  models:document.getElementById('modelsView')
};
function switchView(name){
  navItems.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  Object.entries(views).forEach(([key,el])=>el&&el.classList.toggle('active',key===name));
  window.scrollTo({top:0,behavior:'smooth'});
}
navItems.forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
document.querySelectorAll('[data-viewjump]').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.viewjump)));

const modelPicker=document.getElementById('modelPicker');
const modelMenu=document.getElementById('modelMenu');
const selectedModel=document.getElementById('selectedModel');
modelPicker.addEventListener('click',e=>{e.stopPropagation();modelMenu.classList.toggle('open')});
document.addEventListener('click',()=>modelMenu.classList.remove('open'));
modelMenu.addEventListener('click',e=>e.stopPropagation());
modelMenu.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
  selectedModel.textContent=btn.dataset.model;
  modelMenu.classList.remove('open');
}));

const input=document.getElementById('promptInput');
const stream=document.getElementById('chatStream');
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,140)+'px'}
input.addEventListener('input',()=>autoResize(input));

function sendPrompt(text){
  const value=(text||input.value).trim();
  if(!value)return;
  switchView('chat');
  const user=document.createElement('div');
  user.className='bubble user';
  user.textContent=value;
  stream.appendChild(user);
  input.value='';autoResize(input);
  const ai=document.createElement('div');
  ai.className='bubble ai';
  ai.innerHTML='<strong>'+selectedModel.textContent+'</strong><br><span>Demo mode: Nasha is ready for live model APIs. This request will be routed through the selected provider once the backend is connected.</span>';
  setTimeout(()=>{stream.appendChild(ai);ai.scrollIntoView({behavior:'smooth',block:'end'})},250);
}
document.getElementById('sendBtn').addEventListener('click',()=>sendPrompt());
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendPrompt()}});
document.querySelectorAll('[data-prompt]').forEach(btn=>btn.addEventListener('click',()=>sendPrompt(btn.dataset.prompt)));
document.getElementById('newChatBtn').addEventListener('click',()=>{stream.innerHTML='';switchView('chat');input.focus()});

const homePrompt=document.getElementById('homePrompt');
homePrompt.addEventListener('input',()=>autoResize(homePrompt));
document.getElementById('homeSend').addEventListener('click',()=>{const v=homePrompt.value.trim();if(v){homePrompt.value='';sendPrompt(v)}});
homePrompt.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();document.getElementById('homeSend').click()}});

const models=[
{name:'GPT',mark:'G',desc:'A versatile assistant for everyday questions, learning, writing, reasoning and multimodal tasks.',tags:['Everyday','Writing','Vision','Reasoning']},
{name:'Claude',mark:'C',desc:'Useful for long documents, thoughtful writing, analysis and structured work.',tags:['Documents','Writing','Analysis']},
{name:'Gemini',mark:'◈',desc:'Multimodal assistance across text, images and broader creative workflows.',tags:['Multimodal','Images','Everyday']},
{name:'Grok',mark:'X',desc:'A general-purpose assistant for questions, ideas and exploration.',tags:['Chat','Ideas','General']},
{name:'DeepSeek',mark:'D',desc:'Reasoning-focused model for structured problem solving and technical tasks.',tags:['Reasoning','Math','Technical']},
{name:'Flux',mark:'F',desc:'Visual generation for creative images, concepts, designs and content.',tags:['Images','Creative','Design']}
];
document.getElementById('modelsGrid').innerHTML=models.map(m=>`<article class="model-card"><div class="model-card-top"><div class="logo">${m.mark}</div><h3>${m.name}</h3></div><p>${m.desc}</p><div class="tags">${m.tags.map(t=>`<span>${t}</span>`).join('')}</div></article>`).join('');

const languageSelect=document.getElementById('languageSelect');
languageSelect.addEventListener('change',()=>{
  document.documentElement.lang=languageSelect.value;
  if(languageSelect.value==='ar'){document.documentElement.dir='rtl'}else{document.documentElement.dir='ltr'}
});