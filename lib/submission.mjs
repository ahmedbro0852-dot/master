// Keep one durable browser-side request identifier per identical submission.
// If an HTTP response is lost after the server reserves credit, retrying the same
// video must reuse its UUID so the database can return the existing job.
export const SUBMISSION_STORAGE_KEY='master-flow-pending-submission-v1';
const LIFETIME_MS=30*60*1000;
export async function submissionId(payload,storage=globalThis.sessionStorage,clock=Date.now()){
 const bytes=new TextEncoder().encode(JSON.stringify(payload));
 const digest=Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
 try{
  const prior=JSON.parse(storage.getItem(SUBMISSION_STORAGE_KEY)||'null');
  if(prior?.digest===digest&&typeof prior.id==='string'&&/^[a-f0-9-]{36}$/i.test(prior.id)&&Number.isFinite(prior.at)&&clock>=prior.at&&clock-prior.at<LIFETIME_MS)return prior.id;
 }catch{}
 const id=globalThis.crypto.randomUUID();
 try{storage.setItem(SUBMISSION_STORAGE_KEY,JSON.stringify({id,digest,at:clock}));}catch{}
 return id;
}
export function clearSubmissionId(storage=globalThis.sessionStorage){
 try{storage.removeItem(SUBMISSION_STORAGE_KEY)}catch{}
}
