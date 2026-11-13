'use strict';
const assert = require('node:assert/strict');
const handler = require('../api/meta-publish.js');
const {validateContent, isAuthorized} = require('../lib/meta-publisher.cjs');
const secret = 'not-a-real-secret-only-for-tests-12345';
const token = 'not-a-real-meta-access-token-for-test';
process.env.META_PUBLISH_SECRET = secret;
process.env.META_PAGE_ACCESS_TOKEN = token;
process.env.META_PAGE_ID = '1467051823151353';
const message = 'Gamma Pro monthly plan test - no prices';
const imageUrl = 'https://static.metricool.com/planner/202611/mock.png';
const headers = { authorization: `Bearer ${secret}` };
let calls = [];
const fetchBackup = global.fetch;
function res() {
  return { statusCode: 200, headers: {}, setHeader(k,v) {this.headers[k]=v;return this;}, status(k) {this.statusCode=k;return this;}, json(obj) {this.body=obj;return this;} };
}
async function run(body, override = {}) {let response=res();await handler({method:'POST',headers,body,...override},response);return response;}
(async () => {
  assert.equal(isAuthorized(`Bearer ${secret}`,secret),true);
  assert.equal(isAuthorized('Bearer bad',secret),false);
  assert.equal(validateContent({message,imageUrl:'http://127.0.0.1/mock.png'},['static.metricool.com']).error,'image_host_not_allowed');
  assert.equal(validateContent({message,imageUrl:'https://static.metricool.com.evil.test/image.png'},['static.metricool.com']).error,'image_host_not_allowed');
  assert.equal((await run({message,imageUrl},{headers:{}})).statusCode,401);
  assert.equal((await run({message,imageUrl},{method:'GET'})).statusCode,405);
  assert.equal((await run({message,imageUrl:'https://evil.example/img.png'})).statusCode,400);
  const dry = await run({message,imageUrl,dryRun:true});
  assert.equal(dry.statusCode,200);
  assert.equal(dry.body.dryRun,true);
  global.fetch = async (url,opts) => {
    calls.push({url:String(url),opts});
    if (opts.method === 'GET') return {ok:true,json:async()=>({data:[]})};
    return {ok:true,json:async()=>({id:'991',post_id:'1467051823151353_991'})};
  };
  let result = await run({message,imageUrl});
  assert.equal(result.statusCode,200);
  assert.equal(result.body.duplicate,false);
  assert.equal(calls.length,2);
  assert(calls[1].url.endsWith('/photos'));
  assert.equal(calls[1].opts.body.get('caption'),message);
  assert.equal(calls[1].opts.body.get('url'),imageUrl);
  assert.equal(calls[1].opts.headers.Authorization,`Bearer ${token}`);
  calls=[];
  global.fetch = async () => ({ok:true,json:async()=>({data:[{id:'already',message}]})});
  result=await run({message,imageUrl});
  assert.equal(result.body.duplicate,true);
  global.fetch = async () => ({ok:false,status:401,json:async()=>({error:{code:190,message:'SECRET'}})});
  result=await run({message,imageUrl});
  assert.equal(result.statusCode,503);
  assert(!JSON.stringify(result.body).includes('SECRET'));
  console.log('PASS: protected Meta publishing, image validation, dry run, Graph photo request and duplicate prevention');
})().finally(()=>{global.fetch=fetchBackup}).catch(e=>{console.error(e);process.exitCode=1});
