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
const settingsKey='nasha-settings-v4';
const profileKey='nasha-profile-v1';
const modelPrefsKey='nasha-model-prefs-v1';

const modelCatalog=[
  {id:'gpt-5.6-sol',provider:'OpenAI',name:'GPT-5.6 Sol',tag:'Flagship',speed:'Balanced',reasoning:'High',best:'Complex work, coding, research',description:'Flagship GPT-5.6 model for complex knowledge work, coding, research, science and design.'},
  {id:'gpt-5.6-terra',provider:'OpenAI',name:'GPT-5.6 Terra',tag:'Balanced',speed:'Fast',reasoning:'Medium',best:'Everyday work',description:'Balanced GPT-5.6 option for capability, speed and cost in everyday work.'},
  {id:'gpt-5.6-luna',provider:'OpenAI',name:'GPT-5.6 Luna',tag:'Fastest',speed:'Very fast',reasoning:'Think',best:'Quick chat and routine tasks',description:'Fastest and lowest-cost GPT-5.6 family option, also used for default Free and Go chat.'},
  {id:'gpt-5.6-sol-pro',provider:'OpenAI',name:'GPT-5.6 Sol Pro',tag:'Pro',speed:'Deliberate',reasoning:'Maximum',best:'Hard, long-running tasks',description:'Higher-capability GPT-5.6 option for difficult tasks and longer-running workflows.'},
  {id:'gpt-6-pro',provider:'OpenAI',name:'GPT-6 Pro',tag:'Astra',speed:'Deliberate',reasoning:'Maximum',best:'Frontier difficult work',description:'GPT-6 Pro, powered by Astra. Access depends on plan and product.'},

  {id:'claude-fable-5.1',provider:'Anthropic',name:'Claude Fable 5.1',tag:'Latest',speed:'Fast',reasoning:'Adaptive',best:'General work',description:'September 2026 Claude 5.1 family model.'},
  {id:'claude-mythos-5.1',provider:'Anthropic',name:'Claude Mythos 5.1',tag:'Latest',speed:'Balanced',reasoning:'High',best:'Reasoning and long tasks',description:'September 2026 Claude 5.1 family model.'},
  {id:'claude-opus-5',provider:'Anthropic',name:'Claude Opus 5',tag:'Opus',speed:'Deliberate',reasoning:'High',best:'Complex tasks',description:'Claude Opus 5 family model released in 2026.'},
  {id:'claude-sonnet-5',provider:'Anthropic',name:'Claude Sonnet 5',tag:'Sonnet',speed:'Fast',reasoning:'High',best:'Coding and daily work',description:'Claude Sonnet 5 family model released in 2026.'},

  {id:'gemini-3.8-flash',provider:'Google',name:'Gemini 3.8 Flash',tag:'Latest Flash',speed:'Very fast',reasoning:'High',best:'Agents, coding, multimodal',description:'Google model for long-horizon software engineering, autonomous agents and complex workflows.'},
  {id:'gemini-3.7-flash',provider:'Google',name:'Gemini 3.7 Flash',tag:'Previous',speed:'Fast',reasoning:'High',best:'Coding and agentic tasks',description:'Previous-generation Flash model for complex coding and reliable multi-step execution.'},
  {id:'gemini-3.6-flash',provider:'Google',name:'Gemini 3.6 Flash',tag:'Multimodal',speed:'Fast',reasoning:'Medium',best:'Everyday multimodal tasks',description:'Flash generation balancing speed and multimodal capability.'},
  {id:'gemini-3.5-flash-lite',provider:'Google',name:'Gemini 3.5 Flash-Lite',tag:'Lite',speed:'Very fast',reasoning:'Light',best:'High-throughput tasks',description:'Fast, cost-efficient Gemini option for high-throughput workloads.'},

  {id:'grok-4.7',provider:'xAI',name:'Grok 4.7',tag:'Latest',speed:'Fast',reasoning:'High',best:'Coding and knowledge work',description:'Current Grok flagship for coding and knowledge work with stronger long-task verification.'},
  {id:'grok-4.6',provider:'xAI',name:'Grok 4.6',tag:'Agentic',speed:'Balanced',reasoning:'High',best:'Long-running agents',description:'Grok generation focused on long-running agents and interactive visual work.'},
  {id:'grok-4.5',provider:'xAI',name:'Grok 4.5',tag:'General',speed:'Balanced',reasoning:'High',best:'Engineering and agentic work',description:'Grok model for coding, agentic tasks and knowledge work.'},

  {id:'deepseek-v4.1-flash',provider:'DeepSeek',name:'DeepSeek V4.1 Flash',tag:'Latest Flash',speed:'Very fast',reasoning:'High',best:'Multimodal and high throughput',description:'Latest Flash model with native multimodal visual understanding and higher throughput.'},
  {id:'deepseek-v4-pro',provider:'DeepSeek',name:'DeepSeek V4 Pro',tag:'Pro',speed:'Balanced',reasoning:'High',best:'Advanced tasks',description:'Higher-tier DeepSeek V4 model that remains available through the API.'}
];

const providerClass={OpenAI:'openai',Anthropic:'anthropic',Google:'google',xAI:'xai',DeepSeek:'deepseek'};

function getModelPrefs(){
  try{
    const saved=JSON.parse(localStorage.getItem(modelPrefsKey)||'{}')||{};
    return {
      modelId:saved.modelId||'gpt-5.6-sol',
      mode:saved.mode||'Chat',
      reasoning:saved.reasoning||'Medium'
    };
  }catch{return {modelId:'gpt-5.6-sol',mode:'Chat',reasoning:'Medium'}}
}
function saveModelPrefs(next){
  const current=getModelPrefs();
  const value={...current,...next};
  localStorage.setItem(modelPrefsKey,JSON.stringify(value));
  syncModelUI();
}
function selectedModel(){
  const prefs=getModelPrefs();
  return modelCatalog.find(model=>model.id===prefs.modelId)||modelCatalog[0];
}
function syncModelUI(){
  const model=selectedModel();
  const prefs=getModelPrefs();
  const cls=providerClass[model.provider]||'openai';
  if($('selectedProviderLabel'))$('selectedProviderLabel').textContent=model.provider;
  if($('selectedModelLabel'))$('selectedModelLabel').textContent=model.name;
  if($('currentModelName'))$('currentModelName').textContent=model.name;
  if($('currentModelDescription'))$('currentModelDescription').textContent=model.description;
  if($('selectedModeLabel'))$('selectedModeLabel').textContent=prefs.mode;
  if($('settingsModelName'))$('settingsModelName').textContent=model.name;
  if($('settingsModeName'))$('settingsModeName').textContent=prefs.mode+' mode';
  ['currentModelDot'].forEach(id=>{
    const el=$(id); if(el)el.className='model-provider-dot '+cls+'-dot';
  });
  document.querySelectorAll('.model-picker-button .model-provider-dot').forEach(el=>el.className='model-provider-dot '+cls+'-dot');
  document.querySelectorAll('[data-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===prefs.mode));
  document.querySelectorAll('[data-reasoning]').forEach(btn=>btn.classList.toggle('active',btn.dataset.reasoning===prefs.reasoning));
  renderModelList();
}
let providerFilter='all';
let modelQuery='';
function renderModelList(){
  const list=$('modelList');
  if(!list)return;
  const prefs=getModelPrefs();
  const q=modelQuery.trim().toLowerCase();
  const items=modelCatalog.filter(model=>
    (providerFilter==='all'||model.provider===providerFilter)&&
    (!q||(model.name+' '+model.provider+' '+model.best+' '+model.description).toLowerCase().includes(q))
  );
  list.innerHTML=items.map(model=>{
    const cls=providerClass[model.provider]||'openai';
    const active=model.id===prefs.modelId?' active':'';
    return '<button class="model-card'+active+'" data-model-id="'+escapeHtml(model.id)+'">'+
      '<span class="model-provider-dot '+cls+'-dot"></span>'+
      '<div class="model-card-copy"><div><strong>'+escapeHtml(model.name)+'</strong><b>'+escapeHtml(model.tag)+'</b></div>'+
      '<small>'+escapeHtml(model.provider)+' · '+escapeHtml(model.best)+'</small>'+
      '<p>'+escapeHtml(model.description)+'</p>'+
      '<div class="model-meta"><span><i data-lucide="gauge"></i>'+escapeHtml(model.speed)+'</span><span><i data-lucide="brain"></i>'+escapeHtml(model.reasoning)+'</span></div></div>'+
      '<i class="model-check" data-lucide="'+(active?'check':'chevron-right')+'"></i></button>';
  }).join('')||'<div class="empty-state">No models match your search.</div>';
  renderIcons(list);
  list.querySelectorAll('[data-model-id]').forEach(button=>button.addEventListener('click',()=>{
    saveModelPrefs({modelId:button.dataset.modelId});
    showToast('Model set to '+selectedModel().name);
  }));
}

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
function getSettings(){
  try{return JSON.parse(localStorage.getItem(settingsKey)||'{}')||{}}catch{return {}}
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
  const settings=getSettings();
  messages.innerHTML=items.map((item,index)=>
    '<div class="chat-message '+escapeHtml(item.role)+'"><span class="message-avatar">'+(item.role==='user'?getProfileInitial():'N')+'</span><div class="message-body"><div class="message-topline"><small class="message-author">'+(item.role==='user'?'You':'Nasha · '+selectedModel().name)+'</small><button class="message-copy" data-copy-message="'+index+'" aria-label="Copy message"><i data-lucide="copy"></i></button></div><p>'+escapeHtml(item.text)+'</p>'+(settings.showMessageTime===false?'':'<time>'+formatMessageTime(item.time)+'</time>')+'</div></div>'
  ).join('');
  renderIcons(messages);
  const firstUser=items.find(item=>item.role==='user');
  if($('chatThreadTitle'))$('chatThreadTitle').textContent=firstUser?.text?.slice(0,42)||'New conversation';
  if($('chatThreadMeta'))$('chatThreadMeta').textContent=items.length?items.length+' message'+(items.length===1?'':'s'):'Local draft';
  messages.scrollTop=messages.scrollHeight;
}
function formatMessageTime(value){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return '';
  return date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}
let replyTimer;
function setChatStatus(text,state=''){
  const line=$('chatStatusLine');
  if(!line)return;
  line.className='chat-status-line '+state;
  line.innerHTML=text?'<span class="status-dot"></span><span>'+escapeHtml(text)+'</span>':'';
}
function updateComposerState(){
  const input=$('chatInput');
  const send=$('chatSend');
  const count=$('chatCharCount');
  if(!input)return;
  const length=input.value.length;
  if(count)count.textContent=length+' / 4000';
  if(send)send.disabled=!input.value.trim();
  input.style.height='auto';
  input.style.height=Math.min(input.scrollHeight,140)+'px';
}
$('chatMessages')?.addEventListener('click',async event=>{
  const button=event.target.closest('[data-copy-message]');
  if(!button)return;
  const item=getChat()[Number(button.dataset.copyMessage)];
  if(!item)return;
  try{
    await navigator.clipboard.writeText(item.text);
    showToast('Message copied');
  }catch{
    showToast('Could not copy message');
  }
});

function sendChat(text){
  const value=String(text||'').trim();
  if(!value)return;
  const settings=getSettings();
  const items=getChat();
  const now=new Date().toISOString();
  items.push({role:'user',text:value,time:now,attachment:pendingAttachment?.name||''});
  setChat(items);
  if(settings.saveHistory!==false)addActivity('chat',value.slice(0,52),value);
  if($('chatInput'))$('chatInput').value='';
  pendingAttachment=null;
  if(chatFileInput)chatFileInput.value='';
  if($('attachmentRow'))$('attachmentRow').hidden=true;
  updateComposerState();
  renderChat();
  renderChatSessions();
  setChatStatus('Sending…','sending');
  clearTimeout(replyTimer);
  replyTimer=setTimeout(()=>{
    setChatStatus('Nasha is preparing a reply…','replying');
    replyTimer=setTimeout(()=>{
      const updated=getChat();
      updated.push({
        role:'assistant',
        text:'Preview response · '+selectedModel().name+' · '+getModelPrefs().mode+' mode. Live model responses will start here once the provider connection is added.',
        time:new Date().toISOString()
      });
      setChat(updated);
      renderChat();
      setChatStatus('');
    },650);
  },280);
}
function newChat(){
  localStorage.removeItem(chatKey);
  renderChat();
  openTool('chat');
  $('chatInput')?.focus();
}
$('chatSend')?.addEventListener('click',()=>sendChat($('chatInput')?.value));
$('chatInput')?.addEventListener('input',updateComposerState);
$('chatInput')?.addEventListener('keydown',event=>{
  const settings=getSettings();
  if(event.key==='Enter'&&!event.shiftKey&&settings.enterToSend!==false){
    event.preventDefault();
    sendChat(event.currentTarget.value);
  }
});
$('newChatButton')?.addEventListener('click',newChat);
$('clearConversation')?.addEventListener('click',()=>{
  localStorage.removeItem(chatKey);
  setChatStatus('');
  renderChat();
  updateComposerState();
  showToast('Conversation cleared');
});
$('copyConversation')?.addEventListener('click',async()=>{
  const items=getChat();
  if(!items.length){showToast('Nothing to copy');return}
  const text=items.map(item=>(item.role==='user'?'You':'Nasha')+': '+item.text).join('\n\n');
  try{
    await navigator.clipboard.writeText(text);
    showToast('Conversation copied');
  }catch{
    showToast('Could not copy conversation');
  }
});
document.querySelectorAll('[data-chat-suggestion]').forEach(button=>button.addEventListener('click',()=>{
  if($('chatInput'))$('chatInput').value=button.dataset.chatSuggestion;
  $('chatInput')?.focus();
}));
const chatFileInput=$('chatFileInput');
let pendingAttachment=null;
$('composerAttach')?.addEventListener('click',()=>chatFileInput?.click());
chatFileInput?.addEventListener('change',event=>{
  const file=event.target.files?.[0];
  if(!file)return;
  pendingAttachment=file;
  if($('attachmentName'))$('attachmentName').textContent=file.name;
  if($('attachmentRow'))$('attachmentRow').hidden=false;
  renderIcons($('attachmentRow'));
});
$('removeAttachment')?.addEventListener('click',()=>{
  pendingAttachment=null;
  if(chatFileInput)chatFileInput.value='';
  if($('attachmentRow'))$('attachmentRow').hidden=true;
});


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
  syncHistoryCounts();
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
let historyQuery='';
function renderHistory(){
  const list=$('historyList');
  if(!list)return;
  const all=getActivity();
  const filtered=historyFilter==='all'?all:all.filter(item=>item.type===historyFilter);
  const query=historyQuery.trim().toLowerCase();
  const items=query?filtered.filter(item=>(item.title+' '+item.detail).toLowerCase().includes(query)):filtered;
  if(!items.length){
    list.innerHTML='<div class="empty-state">No history here yet.</div>';
    return;
  }
  const icon={chat:'message-square',image:'image',video:'video'};
  list.innerHTML=items.map(item=>
    '<button class="history-entry" data-history-id="'+escapeHtml(item.id)+'" data-history-type="'+escapeHtml(item.type)+'"><span><i data-lucide="'+icon[item.type]+'"></i></span><div><strong>'+escapeHtml(item.title||'Untitled')+'</strong><small>'+escapeHtml(item.type)+' · '+formatTime(item.updatedAt)+'</small></div><i data-lucide="chevron-right"></i></button>'
  ).join('');
  renderIcons(list);
  list.querySelectorAll('[data-history-id]').forEach(button=>button.addEventListener('click',()=>{
    const item=getActivity().find(entry=>entry.id===button.dataset.historyId);
    if(!item)return;
    closeDrawers();
    if(item.type==='chat'){
      openTool('chat');
      if($('chatInput'))$('chatInput').value=item.detail||item.title||'';
      $('chatInput')?.focus();
    }else if(item.type==='image'){
      openTool('images');
      if($('imagePrompt'))$('imagePrompt').value=item.detail||item.title||'';
      $('imagePrompt')?.focus();
    }else if(item.type==='video'){
      openTool('video');
      if($('videoPrompt'))$('videoPrompt').value=item.detail||item.title||'';
      $('videoPrompt')?.focus();
    }
  }));
}
function renderChatSessions(){
  const list=$('chatSessionList');
  if(!list)return;
  const chats=getActivity().filter(item=>item.type==='chat').slice(0,7);
  const base='<button class="chat-session active" id="sessionNew"><i data-lucide="message-square"></i><span><strong>Current conversation</strong><small>Open now</small></span></button>';
  list.innerHTML=base+chats.map(item=>
    '<button class="chat-session" data-chat-history-id="'+escapeHtml(item.id)+'"><i data-lucide="clock-3"></i><span><strong>'+escapeHtml(item.title)+'</strong><small>'+formatTime(item.updatedAt)+'</small></span></button>'
  ).join('');
  renderIcons(list);
  list.querySelectorAll('[data-chat-history-id]').forEach(button=>button.addEventListener('click',()=>{
    const item=getActivity().find(entry=>entry.id===button.dataset.chatHistoryId);
    if(!item)return;
    if($('chatInput'))$('chatInput').value=item.detail||item.title||'';
    $('chatInput')?.focus();
  }));
}
$('historySearch')?.addEventListener('input',event=>{
  historyQuery=event.currentTarget.value||'';
  renderHistory();
});
document.querySelectorAll('[data-history-filter]').forEach(button=>button.addEventListener('click',()=>{
  historyFilter=button.dataset.historyFilter;
  document.querySelectorAll('[data-history-filter]').forEach(item=>item.classList.toggle('active',item===button));
  renderHistory();
}));
$('clearHistory')?.addEventListener('click',()=>{
  localStorage.removeItem(activityKey);
  renderHistory();
  renderChatSessions();
  syncHistoryCounts();
  showToast('History cleared');
});

function syncHistoryCounts(){
  const count=getActivity().length;
  if($('historyCount'))$('historyCount').textContent=String(count);
  if($('topHistoryCount'))$('topHistoryCount').textContent=String(count);
}
 
function bindPromptCounter(inputId,countId,resetId){
  const input=$(inputId);
  const count=$(countId);
  const update=()=>{if(count)count.textContent=(input?.value.length||0)+' / 1500'};
  input?.addEventListener('input',update);
  $(resetId)?.addEventListener('click',()=>{
    if(input){input.value='';input.focus()}
    update();
  });
  update();
}
bindPromptCounter('imagePrompt','imagePromptCount','resetImagePrompt');
bindPromptCounter('videoPrompt','videoPromptCount','resetVideoPrompt');

/* image/video drafts */
function saveCreation(type,prompt){
  const value=String(prompt||'').trim();
  if(!value){
    showToast('Add a description first');
    return false;
  }
  if(getSettings().saveHistory!==false)addActivity(type,value.slice(0,52),value);
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
['modelPickerOpen','modePickerOpen','settingsModelOpen'].forEach(id=>$(id)?.addEventListener('click',()=>{
  renderModelList();
  openDrawer('modelDrawer');
}));
['accountOpen','topAccount'].forEach(id=>$(id)?.addEventListener('click',()=>openDrawer('accountDrawer')));
backdrop?.addEventListener('click',closeDrawers);
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',closeDrawers));

$('modelSearch')?.addEventListener('input',event=>{
  modelQuery=event.currentTarget.value||'';
  renderModelList();
});
document.querySelectorAll('[data-provider-filter]').forEach(button=>button.addEventListener('click',()=>{
  providerFilter=button.dataset.providerFilter;
  document.querySelectorAll('[data-provider-filter]').forEach(item=>item.classList.toggle('active',item===button));
  renderModelList();
}));
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
  saveModelPrefs({mode:button.dataset.mode});
  showToast(button.dataset.mode+' mode selected');
}));
document.querySelectorAll('[data-reasoning]').forEach(button=>button.addEventListener('click',()=>{
  saveModelPrefs({reasoning:button.dataset.reasoning});
  showToast(button.dataset.reasoning+' reasoning selected');
}));

/* settings */
const displayName=$('displayName');
const languageSetting=$('languageSetting');
function applySettings(settings=getSettings()){
  if($('enterToSend'))$('enterToSend').checked=settings.enterToSend!==false;
  if($('showMessageTime'))$('showMessageTime').checked=settings.showMessageTime!==false;
  if($('saveHistorySetting'))$('saveHistorySetting').checked=settings.saveHistory!==false;
  if($('compactMode'))$('compactMode').checked=Boolean(settings.compactMode);
  document.body.classList.toggle('compact-workspace',Boolean(settings.compactMode));
  const hint=$('composerHint');
  if(hint)hint.textContent=settings.enterToSend===false?'Use the send button · Enter makes a new line':'Enter to send · Shift + Enter for new line';
  renderChat();
}
function loadSettings(){
  const settings=getSettings();
  if(displayName&&settings.name)displayName.value=settings.name;
  if(languageSetting&&settings.language)languageSetting.value=settings.language;
  applySettings(settings);
}
$('saveSettings')?.addEventListener('click',()=>{
  const settings={
    name:displayName?.value.trim()||'',
    language:languageSetting?.value||'English',
    enterToSend:$('enterToSend')?.checked!==false,
    showMessageTime:$('showMessageTime')?.checked!==false,
    saveHistory:$('saveHistorySetting')?.checked!==false,
    compactMode:Boolean($('compactMode')?.checked)
  };
  localStorage.setItem(settingsKey,JSON.stringify(settings));
  if(settings.name){
    const profile=getProfile();
    profile.name=settings.name;
    localStorage.setItem(profileKey,JSON.stringify(profile));
    syncProfile();
  }
  applySettings(settings);
  closeDrawers();
  showToast('Settings saved');
});
$('clearLocalData')?.addEventListener('click',()=>{
  localStorage.removeItem(chatKey);
  localStorage.removeItem(activityKey);
  localStorage.removeItem(profileKey);
  localStorage.removeItem(modelPrefsKey);
  renderChat();
  renderHistory();
  renderChatSessions();
  syncHistoryCounts();
  syncProfile();
  closeDrawers();
  showToast('Local workspace data cleared');
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
syncHistoryCounts();
updateComposerState();
syncModelUI();
renderIcons();
syncHeaderScroll();