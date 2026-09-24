const $=id=>document.getElementById(id);

function renderIcons(root=document){
  if(window.lucide?.createIcons){
    window.lucide.createIcons({
      root,
      attrs:{
        'stroke-width':1.7,
        'aria-hidden':'true'
      }
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
  overview:$('overviewTool'),
  documents:$('documentsTool'),
  design:$('designTool'),
  video:$('videoTool'),
  audio:$('audioTool'),
  translate:$('translateTool'),
  files:$('filesTool')
};

const toolLabels={
  overview:'Home',
  documents:'Documents',
  design:'Design',
  video:'Video',
  audio:'Audio',
  translate:'Translate',
  files:'Files'
};

const recentKey='nasha-recent-v2';
const documentKey='nasha-document-v2';
const settingsKey='nasha-settings-v2';

function switchView(name){
  document.body.classList.toggle('app-view',name==='workspace');
  Object.entries(views).forEach(([key,view])=>{
    if(view)view.classList.toggle('active',key===name);
  });
  document.querySelectorAll('[data-view]').forEach(button=>{
    button.classList.toggle('active',button.dataset.view===name);
  });
  window.scrollTo({top:0,behavior:'smooth'});
}

function openTool(name){
  if(!toolPanels[name])name='overview';
  switchView('workspace');
  Object.entries(toolPanels).forEach(([key,panel])=>{
    if(panel)panel.classList.toggle('active',key===name);
  });
  document.querySelectorAll('[data-tool]').forEach(button=>{
    button.classList.toggle('active',button.dataset.tool===name);
  });
  const title=$('workspaceTitle');
  if(title)title.textContent=toolLabels[name]||name;
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('[data-view]').forEach(button=>{
  button.addEventListener('click',()=>{
    const target=button.dataset.view;
    if(target==='workspace')openTool('overview');
    else switchView(target);
  });
});

document.querySelectorAll('[data-viewjump]').forEach(button=>{
  button.addEventListener('click',event=>{
    event.preventDefault();
    const target=button.dataset.viewjump;
    if(target==='workspace')openTool('overview');
    else switchView(target);
  });
});

document.querySelectorAll('[data-tool]').forEach(button=>{
  button.addEventListener('click',()=>openTool(button.dataset.tool));
});

document.querySelectorAll('[data-workspace]').forEach(button=>{
  button.addEventListener('click',event=>{
    event.preventDefault();
    openTool(button.dataset.workspace);
  });
});

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  })[char]);
}


/* document */
const documentTitle=$('documentTitle');
const documentBody=$('documentBody');
const saveState=$('saveState');
const wordCount=$('wordCount');
let saveTimer;

function documentPlainText(){
  return (documentBody?.innerText||'').trim();
}

function updateWordCount(){
  const words=documentPlainText().match(/\S+/g)||[];
  if(wordCount)wordCount.textContent=words.length+' word'+(words.length===1?'':'s');
}

function getRecent(){
  try{
    const parsed=JSON.parse(localStorage.getItem(recentKey)||'[]');
    return Array.isArray(parsed)?parsed:[];
  }catch{
    return [];
  }
}

function setRecent(items){
  localStorage.setItem(recentKey,JSON.stringify(items.slice(0,12)));
  renderRecent();
  refreshOverview();
}

function pushRecent(item){
  const items=getRecent().filter(existing=>existing.id!==item.id);
  items.unshift(item);
  setRecent(items);
}

function saveDocument(){
  if(!documentTitle||!documentBody)return;
  const payload={
    title:documentTitle.value.trim()||'Untitled document',
    html:documentBody.innerHTML,
    text:documentPlainText(),
    updatedAt:new Date().toISOString()
  };
  localStorage.setItem(documentKey,JSON.stringify(payload));
  pushRecent({
    id:'document-main',
    type:'document',
    title:payload.title,
    detail:payload.text?payload.text.slice(0,80):'Document',
    updatedAt:payload.updatedAt
  });
  if(saveState){
    saveState.textContent='Saved';
    saveState.classList.remove('saving');
  }
  updateWordCount();
}

function queueDocumentSave(){
  if(saveState){
    saveState.textContent='Saving…';
    saveState.classList.add('saving');
  }
  updateWordCount();
  clearTimeout(saveTimer);
  saveTimer=setTimeout(saveDocument,450);
}

function loadDocument(){
  try{
    const saved=JSON.parse(localStorage.getItem(documentKey)||'null');
    if(saved&&documentTitle&&documentBody){
      documentTitle.value=saved.title||'Untitled document';
      documentBody.innerHTML=saved.html||'';
    }
  }catch{}
  updateWordCount();
}

function newDocument(){
  openTool('documents');
  if(documentTitle)documentTitle.value='Untitled document';
  if(documentBody){
    documentBody.innerHTML='';
    documentBody.focus();
  }
  localStorage.removeItem(documentKey);
  if(saveState){
    saveState.textContent='Saved';
    saveState.classList.remove('saving');
  }
  updateWordCount();
  refreshOverview();
}

documentTitle?.addEventListener('input',queueDocumentSave);
documentBody?.addEventListener('input',queueDocumentSave);
$('newDocumentBtn')?.addEventListener('click',newDocument);
$('overviewNewDocument')?.addEventListener('click',newDocument);

document.querySelectorAll('[data-command]').forEach(button=>{
  button.addEventListener('click',()=>{
    const command=button.dataset.command;
    const value=button.dataset.value||null;
    documentBody?.focus();
    try{document.execCommand(command,false,value)}catch{}
    queueDocumentSave();
  });
});

$('insertLinkButton')?.addEventListener('click',()=>{
  documentBody?.focus();
  const url=window.prompt('Paste a link');
  if(!url)return;
  try{document.execCommand('createLink',false,url)}catch{}
  queueDocumentSave();
});

$('attachFromDocument')?.addEventListener('click',()=>openTool('files'));

$('shareDocument')?.addEventListener('click',async()=>{
  const shareText=(documentTitle?.value||'Untitled document')+'\n\n'+documentPlainText();
  try{
    if(navigator.share){
      await navigator.share({title:documentTitle?.value||'Nasha document',text:shareText});
      return;
    }
    await navigator.clipboard.writeText(shareText);
    showToast('Document copied');
  }catch{
    showToast('Share cancelled');
  }
});

/* recent */
function formatRecentTime(value){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return 'Saved locally';
  return date.toLocaleString([],{
    month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'
  });
}

function renderRecent(){
  const list=$('recentList');
  if(!list)return;
  const items=getRecent();
  if(!items.length){
    list.innerHTML='<div class="empty-state">Nothing here yet.</div>';
    return;
  }
  list.innerHTML=items.map((item,index)=>{
    return '<button class="recent-entry" data-recent-index="'+index+'"><strong>'+
      escapeHtml(item.title||'Untitled')+'</strong><small>'+
      escapeHtml((item.type||'work')+' · '+formatRecentTime(item.updatedAt))+
      '</small></button>';
  }).join('');
  renderIcons(list);
  list.querySelectorAll('[data-recent-index]').forEach(button=>{
    button.addEventListener('click',()=>{
      const item=items[Number(button.dataset.recentIndex)];
      closeDrawers();
      if(item?.type==='file')openTool('files');
      else openTool('documents');
    });
  });
}

function refreshOverview(){
  const title=$('recentDocumentTitle');
  const meta=$('recentDocumentMeta');
  try{
    const saved=JSON.parse(localStorage.getItem(documentKey)||'null');
    if(saved){
      if(title)title.textContent=saved.title||'Untitled document';
      if(meta)meta.textContent='Edited '+formatRecentTime(saved.updatedAt);
    }else{
      if(title)title.textContent='Untitled document';
      if(meta)meta.textContent='No saved document yet';
    }
  }catch{}
}

$('clearRecent')?.addEventListener('click',()=>{
  localStorage.removeItem(recentKey);
  renderRecent();
  refreshOverview();
  showToast('Recent work cleared');
});

$('overviewRecent')?.addEventListener('click',()=>openDrawer('recentDrawer'));

/* studio preview actions */
function previewAction(button,output,label){
  if(!button||!output)return;
  button.addEventListener('click',()=>{
    button.classList.add('loading');
    const original=button.textContent;
    button.textContent='Preparing…';
    setTimeout(()=>{
      button.classList.remove('loading');
      button.textContent=original;
      output.innerHTML='<div class="canvas-empty"><strong>'+escapeHtml(label)+'</strong><small>Creation is not active in this preview yet.</small></div>';
      showToast('Draft area prepared');
    },500);
  });
}

previewAction($('designCreate'),$('designOutput'),'Design draft');
previewAction($('videoCreate'),$('videoOutput'),'Video draft');

document.querySelectorAll('[data-audio-action]').forEach(button=>{
  button.addEventListener('click',()=>{
    showToast(button.dataset.audioAction+' is not active in this preview yet');
  });
});

$('translateButton')?.addEventListener('click',()=>{
  const source=$('translateSource');
  const result=$('translateResult');
  const button=$('translateButton');
  if(!source?.value.trim()){
    showToast('Add text to translate');
    source?.focus();
    return;
  }
  button.classList.add('loading');
  const original=button.textContent;
  button.textContent='Translating…';
  setTimeout(()=>{
    button.classList.remove('loading');
    button.textContent=original;
    if(result)result.value='Translation is not active in this preview yet.';
  },450);
});

/* files */
const fileInput=$('fileInput');
const chooseFiles=$('chooseFiles');
const uploadArea=$('uploadArea');
const fileList=$('fileList');

chooseFiles?.addEventListener('click',()=>fileInput?.click());
uploadArea?.addEventListener('click',()=>fileInput?.click());
fileInput?.addEventListener('change',()=>renderFiles([...(fileInput.files||[])]));

['dragenter','dragover'].forEach(eventName=>{
  uploadArea?.addEventListener(eventName,event=>{
    event.preventDefault();
    uploadArea.classList.add('drag');
  });
});
['dragleave','drop'].forEach(eventName=>{
  uploadArea?.addEventListener(eventName,event=>{
    event.preventDefault();
    uploadArea.classList.remove('drag');
  });
});
uploadArea?.addEventListener('drop',event=>{
  renderFiles([...(event.dataTransfer?.files||[])]);
});

function formatBytes(bytes){
  if(bytes<1024)return bytes+' B';
  if(bytes<1048576)return (bytes/1024).toFixed(1)+' KB';
  return (bytes/1048576).toFixed(1)+' MB';
}

function renderFiles(files){
  if(!fileList)return;
  if(!files.length){
    fileList.innerHTML='';
    return;
  }
  fileList.innerHTML=files.map(file=>{
    return '<div class="file-row"><div><span class="file-icon"><i data-lucide="file-text" class="icon"></i></span><div><strong>'+
      escapeHtml(file.name)+'</strong><small>'+formatBytes(file.size)+'</small></div></div><b>Ready</b></div>';
  }).join('');
  renderIcons(fileList);
  files.forEach(file=>{
    pushRecent({
      id:'file-'+file.name+'-'+file.size,
      type:'file',
      title:file.name,
      detail:formatBytes(file.size),
      updatedAt:new Date().toISOString()
    });
  });
  showToast(files.length+' file'+(files.length===1?'':'s')+' added');
}

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

$('settingsOpen')?.addEventListener('click',()=>openDrawer('settingsDrawer'));
$('workspaceRecent')?.addEventListener('click',()=>openDrawer('recentDrawer'));
$('workspaceSettings')?.addEventListener('click',()=>openDrawer('settingsDrawer'));
$('topRecent')?.addEventListener('click',()=>openDrawer('recentDrawer'));
$('topSettings')?.addEventListener('click',()=>openDrawer('settingsDrawer'));
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
  closeDrawers();
  showToast('Settings saved');
});

/* legal */
const legalModal=$('legalModal');
const legalTitle=$('legalTitle');
const legalBody=$('legalBody');
const legalClose=$('legalClose');

const legalCopy={
  privacy:{
    title:'Privacy',
    body:[
      'Nasha is currently a product preview. Before public launch, this page will explain what data is collected, why it is used, how long it is retained, and which service providers process it.',
      'Until live services are connected, avoid entering sensitive personal, financial, medical, or confidential information.'
    ]
  },
  terms:{
    title:'Terms',
    body:[
      'Nasha is currently an early product preview. Public terms of service, acceptable-use rules, billing terms, and account policies will be published before paid access opens.',
      'Features and plan limits shown in this preview may change before launch.'
    ]
  }
};

function openLegal(type){
  const copy=legalCopy[type];
  if(!copy||!legalModal)return;
  if(legalTitle)legalTitle.textContent=copy.title;
  if(legalBody)legalBody.innerHTML=copy.body.map(text=>'<p>'+escapeHtml(text)+'</p>').join('');
  legalModal.classList.add('open');
  legalModal.setAttribute('aria-hidden','false');
  legalClose?.focus();
}

function closeLegal(){
  legalModal?.classList.remove('open');
  legalModal?.setAttribute('aria-hidden','true');
}

document.querySelectorAll('[data-legal]').forEach(button=>{
  button.addEventListener('click',()=>openLegal(button.dataset.legal));
});
legalClose?.addEventListener('click',closeLegal);
legalModal?.addEventListener('click',event=>{
  if(event.target===legalModal)closeLegal();
});

/* toast */
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
  if(event.key==='Escape'){
    closeDrawers();
    closeLegal();
  }
});

loadDocument();
loadSettings();
renderRecent();
refreshOverview();
renderIcons();
const heroSlides=[...document.querySelectorAll('.reference-slide')];
const heroDots=[...document.querySelectorAll('[data-hero-dot]')];
let heroIndex=0;
let heroTimer;

function showHeroSlide(index){
  if(!heroSlides.length)return;
  heroIndex=(index+heroSlides.length)%heroSlides.length;
  heroSlides.forEach((slide,i)=>slide.classList.toggle('active',i===heroIndex));
  heroDots.forEach((dot,i)=>dot.classList.toggle('active',i===heroIndex));
  renderIcons();
}
function scheduleHero(){
  clearInterval(heroTimer);
  heroTimer=setInterval(()=>showHeroSlide(heroIndex+1),6500);
}
heroDots.forEach(dot=>dot.addEventListener('click',()=>{
  showHeroSlide(Number(dot.dataset.heroDot));
  scheduleHero();
}));
scheduleHero();
$('sidebarNewDocument')?.addEventListener('click',newDocument);

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
  closeMobileMenu();
  switchView(button.dataset.menuView);
}));
document.querySelectorAll('[data-menu-workspace]').forEach(button=>button.addEventListener('click',()=>{
  closeMobileMenu();
  openTool(button.dataset.menuWorkspace);
}));

const referenceHero=$('referenceHero');
referenceHero?.addEventListener('mouseenter',()=>clearInterval(heroTimer));
referenceHero?.addEventListener('mouseleave',scheduleHero);

const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.14}):null;
document.querySelectorAll('.reveal-item').forEach(el=>{
  if(revealObserver)revealObserver.observe(el);
  else el.classList.add('revealed');
});
