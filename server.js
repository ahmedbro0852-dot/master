import http from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import handler from './api/inbox.js';
if(!process.env.CHROME_EXECUTABLE_PATH){
try{const folders=await readdir('/ms-playwright');const name=folders.find(n=>/^chromium-\\d+$/.test(n));if(name)process.env.CHROME_EXECUTABLE_PATH='/ms-playwright/'+name+'/chrome-linux/chrome';}catch{}
}
const staticFiles={'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8']};
const root=fileURLToPath(new URL('.',import.meta.url));
http.createServer(async(req,res)=>{
res.status=code=>{res.statusCode=code;return res};
res.json=data=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data))};
res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
try{
const path=new URL(req.url,'http://localhost').pathname;
if(path==='/api/inbox'){
if(req.method!=='POST')return handler(req,res);
let chunks=[],size=0;
for await(const chunk of req){size+=chunk.length;if(size>2048)return res.status(413).json({ok:false,message:'الطلب أكبر من المسموح'});chunks.push(chunk)}
try{req.body=JSON.parse(Buffer.concat(chunks).toString())}catch{return res.status(400).json({ok:false,message:'طلب غير صالح'})}
return await handler(req,res);
}
if(!['GET','HEAD'].includes(req.method))return res.status(405).end();
const item=staticFiles[path];if(!item)return res.status(404).end('Not found');
res.setHeader('Content-Type',item[1]);const body=await readFile(root+item[0]);res.end(req.method==='HEAD'?undefined:body);
}catch{if(!res.headersSent)res.status(500).json({ok:false,message:'تعذر إتمام الطلب'});else res.end()}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Ramz ready on port 3000'));
