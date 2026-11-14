import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.100.0';
const EXPECTED_HASH='GATEWAY_HASH';
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
Deno.serve(async req=>{
 const auth=req.headers.get('x-studio-secret')||'';
 if(hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(auth)))!==EXPECTED_HASH)return Response.json({error:'Forbidden'},{status:403});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 async function rpc(action:string,data:any){const {data:x,error}=await db.rpc('master_flow_rpc',{p_action:action,p_data:data});if(error)throw Error('Database operation failed');return x;}
 try{
 const {action,data}=await req.json();
 if(action!=='archive'&&action!=='file'){const x=await rpc(action,data);return Response.json(x,{status:x.http||200});}
 const j=await rpc('job',data);if(j.error)return Response.json(j,{status:j.http});
 if(action==='file'){
 if(!j.file_key)return Response.json({error:'File not archived'},{status:404});
 const {data:f,error}=await db.storage.from('master-flow-private').createSignedUrl(j.file_key,300);
 if(error)throw error;return Response.json({url:f.signedUrl});}
 if(j.status!=='succeeded'||j.file_key)return Response.json({stored:!!j.file_key});
 const source=j.payload?.output?.url;if(!source)return Response.json({stored:false});
 const u=new URL(source);if(u.protocol!=='https:'||!(/(^|\.)royaltechno\.(cc|ai)$/.test(u.hostname)))return Response.json({stored:false});
 const r=await fetch(u);const size=Number(r.headers.get('content-length')),mime=(r.headers.get('content-type')||'').split(';')[0];
 if(!r.ok||!size||size>100*1024*1024||!['video/mp4','image/png','image/jpeg','image/webp','audio/mpeg','audio/wav'].includes(mime)){await r.body?.cancel();return Response.json({stored:false});}
 const claim=await rpc('reserve_archive',{...data,size});if(!claim.allowed){await r.body?.cancel();return Response.json({stored:false});}
 try{
 const key=j.code_id+'/'+j.id;const {error}=await db.storage.from('master-flow-private').upload(key,r.body!,{contentType:mime,upsert:true,duplex:'half'} as any);if(error)throw error;
 await rpc('stored',{...data,file_key:key});return Response.json({stored:true});
 }catch{await rpc('archive_failed',data);return Response.json({stored:false});}
 }catch{return Response.json({error:'تعذر تنفيذ العملية الآن.'},{status:502});}
});
