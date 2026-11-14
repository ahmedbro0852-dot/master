// A lightweight client-side editing draft; it is intentionally independent of
// account login and stores no uploaded image bytes, codes, API keys or payments.
export const DRAFT_KEY='master-flow-video-draft-v1';
const DRAFT_MAX_AGE_MS=90*24*60*60*1000;
function normalise(input={}){
 const prompt=typeof input.prompt==='string'?input.prompt.slice(0,4000):'';
 const model=typeof input.model==='string'?input.model.slice(0,160):'';
 const ratio=['landscape','portrait'].includes(input.ratio)?input.ratio:'landscape';
 const duration=Number.isInteger(input.duration)&&input.duration>=1&&input.duration<=60?input.duration:8;
 const imageMode=!!input.imageMode;
 const imageUrl=typeof input.image==='string'&&/^https:\/\//i.test(input.image)&&input.image.length<=1800?input.image:'';
 return {prompt,model,ratio,duration,imageMode,imageUrl};
}
export function loadDraft(storage,now=Date.now()){
 try{
  const saved=JSON.parse((storage||globalThis.localStorage).getItem(DRAFT_KEY)||'null');
  if(!saved||saved.version!==1||!Number.isFinite(saved.updatedAt)||now<saved.updatedAt||now-saved.updatedAt>DRAFT_MAX_AGE_MS)return null;
  return normalise({...saved.data,image:saved.data?.imageUrl});
 }catch{return null;}
}
export function saveDraft(input,storage,now=Date.now()){
 try{
  const data=normalise(input);
  const safe={...data};delete safe.imageUrl;
  // Never put base64 uploads in localStorage; only explicit HTTPS image references.
  if(data.imageUrl)safe.imageUrl=data.imageUrl;
  (storage||globalThis.localStorage).setItem(DRAFT_KEY,JSON.stringify({version:1,updatedAt:now,data:safe}));
  return true;
 }catch{return false;}
}
export function clearDraft(storage){
 try{(storage||globalThis.localStorage).removeItem(DRAFT_KEY);return true;}catch{return false;}
}
