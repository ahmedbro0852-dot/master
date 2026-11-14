import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/studio.mjs';
process.env.FLOW_BACKEND_URL='https://backend.test';process.env.FLOW_GATEWAY_SECRET='test-only';process.env.ROYAL_API_KEY='test-only';
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.statusCode=c;return this},json(body){this.body=body;return this},redirect(c,u){this.statusCode=c;this.url=u;return this}}}
const model={model_id:'veo-test',api_name:'veo-test',display_name:'Veo Test',media_type:'video',prompt_max:4000,duration_default:8,duration_options:[8],aspect_ratios:['landscape'],resolution:'720p',prices:[{duration_sec:8,cost_usd_cents:2}]};
const req=(action,body)=>({query:{action},method:body?'POST':'GET',headers:{origin:'https://studio.test',host:'studio.test','content-type':'application/json',cookie:'flow_session='+'a'.repeat(64)},body});
test('anonymous requests cannot read balance or spend',async()=>{const r=response(),q=req('account');q.headers.cookie='';await handler(q,r);assert.equal(r.statusCode,401)});
test('cross-origin mutation rejected before backend access',async()=>{const r=response(),q=req('generate',{});q.headers.origin='https://other.test';await handler(q,r);assert.equal(r.statusCode,403)});
test('server uses live quote instead of forged client cost and forces one output',async()=>{
 const calls=[];global.fetch=async(u,init)=>{if(u.endsWith('/models'))return Response.json({data:[model]});if(u.endsWith('/jobs')){const b=JSON.parse(init.body);assert.equal(b.input.count,1);return Response.json({external_id:'job_test',status:'queued'})}const b=JSON.parse(init.body);calls.push(b);if(b.action==='account')return Response.json({balance_cents:30,jobs:[]});if(b.action==='reserve')return Response.json({job:{id:b.data.id}});return Response.json({id:b.data.id,status:'queued',payload:{}})};
 const r=response();await handler(req('generate',{id:'00000000-0000-4000-8000-000000000001',model_id:'veo-test',prompt:'ocean',duration:8,ratio:'landscape',cost_cents:0,count:100}),r);assert.equal(r.statusCode,200);assert.equal(calls.find(x=>x.action==='reserve').data.cost_cents,2);
});
test('repeated request never calls provider again',async()=>{let jobs=0;global.fetch=async(u,init)=>{if(u.endsWith('/jobs'))jobs++;const b=JSON.parse(init.body);if(b.action==='account')return Response.json({balance_cents:28,jobs:[]});return Response.json({existing:true,job:{id:b.data.id,status:'queued',payload:{}}})};const r=response();await handler(req('generate',{id:'00000000-0000-4000-8000-000000000001',model_id:'veo-test',prompt:'ocean',duration:8,ratio:'landscape'}),r);assert.equal(jobs,0);assert.equal(r.statusCode,200)});
