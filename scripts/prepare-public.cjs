'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),output=path.join(root,'_site');
const publicFiles=new Set(require('./public-assets.json'));
const rootFile=name=>publicFiles.has(name);
const assetFile=name=>/\.(?:html|css|js|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf)$/i.test(name)||['LICENSE','supabase-LICENSE','ATTRIBUTION.md'].includes(name);
const directories=['logos','images','assets','vendor','products','categories'];
function copyTree(from,to){fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})){if(entry.isSymbolicLink())continue;const source=path.join(from,entry.name),target=path.join(to,entry.name);if(entry.isDirectory())copyTree(source,target);else if(entry.isFile()&&assetFile(entry.name))fs.copyFileSync(source,target);}}
function prepare(){fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output);for(const entry of fs.readdirSync(root,{withFileTypes:true}))if(entry.isFile()&&!entry.name.startsWith('.')&&rootFile(entry.name))fs.copyFileSync(path.join(root,entry.name),path.join(output,entry.name));for(const name of directories)if(fs.existsSync(path.join(root,name)))copyTree(path.join(root,name),path.join(output,name));const logo=Buffer.from(fs.readFileSync(path.join(root,'scripts/storefront-logo.webp.b64'),'utf8').trim(),'base64');if(logo.toString('ascii',0,4)!=='RIFF'||logo.toString('ascii',8,12)!=='WEBP'||logo.length>40000)throw Error('Invalid optimized logo');fs.mkdirSync(path.join(output,'assets'),{recursive:true});fs.writeFileSync(path.join(output,'assets','storefront-logo-480.webp'),logo);fs.writeFileSync(path.join(output,'.nojekyll'),'');return output;}
if(require.main===module){prepare();console.log('Prepared public storefront assets in _site; server modules, SQL, tests and configuration excluded.');}
module.exports={prepare,rootFile,assetFile,directories};
