const navItems=[...document.querySelectorAll('.nav-item')];
const views={chat:document.getElementById('chatView'),images:document.getElementById('imagesView'),video:document.getElementById('videoView'),models:document.getElementById('modelsView')};

function switchView(name){
  navItems.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  Object.entries(views).forEach(([key,el])=>el.classList.toggle('active',key===name));
}
navItems.forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
document.querySelectorAll('[data-viewjump]').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.viewjump)));

const modelPicker=document.getElementById('modelPicker');
const modelMenu=document.getElementById('modelMenu');
const selectedModel=document.getElementById('selectedModel');
modelPicker.addEventListener('click',(e)=>{e.stopPropagation();modelMenu.classList.toggle('open')});
document.addEventListener('click',()=>modelMenu.classList.remove('open'));
modelMenu.addEventListener('click',e=>e.stopPropagation());
modelMenu.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
  selectedModel.textContent=btn.dataset.model;
  modelMenu.classList.remove('open');
}));

const input=document.getElementById('promptInput');
const stream=document.getElementById('chatStream');
function autoResize(){input.style.height='auto';input.style.height=Math.min(input.scrollHeight,140)+'px'}
input.addEventListener('input',autoResize);

function sendPrompt(text){
  const value=(text||input.value).trim();
  if(!value)return;
  const user=document.createElement('div');
  user.className='bubble user';
  user.textContent=value;
  stream.appendChild(user);
  input.value=''; autoResize();

  const ai=document.createElement('div');
  ai.className='bubble ai';
  ai.innerHTML='<strong>'+selectedModel.textContent+'</strong><br><span>Demo mode: the interface is ready. Connect provider APIs to return live AI responses here.</span>';
  setTimeout(()=>{stream.appendChild(ai);ai.scrollIntoView({behavior:'smooth',block:'end'})},350);
}
document.getElementById('sendBtn').addEventListener('click',()=>sendPrompt());
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendPrompt()}});
document.querySelectorAll('[data-prompt]').forEach(btn=>btn.addEventListener('click',()=>{switchView('chat');sendPrompt(btn.dataset.prompt)}));
document.getElementById('newChatBtn').addEventListener('click',()=>{stream.innerHTML='';switchView('chat');input.focus()});

const models=[
  {name:'GPT',mark:'G',desc:'Strong general-purpose reasoning, coding, writing and multimodal tasks.',tags:['Chat','Vision','Code','Reasoning']},
  {name:'Claude',mark:'C',desc:'Excellent long-form writing, document analysis and thoughtful reasoning.',tags:['Chat','Files','Writing','Reasoning']},
  {name:'Gemini',mark:'◈',desc:'Multimodal generation and analysis with long-context workflows.',tags:['Chat','Vision','Image','Video']},
  {name:'Grok',mark:'X',desc:'Fast general-purpose assistant for research, writing and ideation.',tags:['Chat','Research','Reasoning']},
  {name:'DeepSeek',mark:'D',desc:'Efficient reasoning and coding model for technical workloads.',tags:['Chat','Code','Reasoning']},
  {name:'Flux',mark:'F',desc:'High-quality image generation for design, product and creative work.',tags:['Image','Design','Creative']}
];
document.getElementById('modelsGrid').innerHTML=models.map(m=>`<article class="model-card"><div class="model-card-top"><div class="logo">${m.mark}</div><h3>${m.name}</h3></div><p>${m.desc}</p><div class="tags">${m.tags.map(t=>`<span>${t}</span>`).join('')}</div></article>`).join('');