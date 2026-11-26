'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),output=path.join(root,'_site');
const publicFiles=new Set(require('./public-assets.json'));
const rootFile=name=>publicFiles.has(name);
const assetFile=name=>/\.(?:html|css|js|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf)$/i.test(name)||['LICENSE','supabase-LICENSE','ATTRIBUTION.md'].includes(name);
const directories=['logos','images','assets','vendor','products','categories'];
function copyTree(from,to){fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})){if(entry.isSymbolicLink())continue;const source=path.join(from,entry.name),target=path.join(to,entry.name);if(entry.isDirectory())copyTree(source,target);else if(entry.isFile()&&assetFile(entry.name))fs.copyFileSync(source,target);}}

function optimizeStorefront(){
 const font=require('./alexandria-fonts.json'),dir=path.join(output,'assets','fonts');fs.mkdirSync(dir,{recursive:true});
 for(const [name,encoded] of Object.entries(font.fonts)){
  if(!/^alexandria-[a-z-]+\.woff2$/.test(name))throw Error('Unexpected font asset');
  const bytes=Buffer.from(encoded,'base64');if(bytes.toString('ascii',0,4)!=='wOF2')throw Error('Invalid font');
  fs.writeFileSync(path.join(dir,name),bytes);
 }
 fs.writeFileSync(path.join(dir,'alexandria.css'),font.css);
 fs.writeFileSync(path.join(dir,'OFL.txt'),font.license);
 const pages=[path.join(output,'index.html'),path.join(output,'product.html'),...['products','categories'].flatMap(d=>fs.readdirSync(path.join(output,d)).filter(f=>f.endsWith('.html')).map(f=>path.join(output,d,f))),...['categories.html','common-problems.html','warranty.html'].map(f=>path.join(output,f))];
 for(const file of pages){if(!fs.existsSync(file))continue;let html=fs.readFileSync(file,'utf8');html=html.replace(/<link\b[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?family=Alexandria:wght@[^"]+"[^>]*>/g,'<link rel="stylesheet" href="/assets/fonts/alexandria.css">');html=html.replace(/(locale\.js\?v=)[^"']+/g,(_,prefix)=>prefix+'20261127-render-dedup1').replace(/(app\.js\?v=)[^"']+/g,(_,prefix)=>prefix+'20261127-render-dedup1');fs.writeFileSync(file,html);}
 const catalogPath=path.join(output,'catalog.js'),source=fs.readFileSync(catalogPath,'utf8'),start=source.indexOf('['),end=source.indexOf('\n];',start);
 if(start<0||end<0)throw Error('Unexpected catalog structure');
 const original=JSON.parse(source.slice(start,end+2)),compact=JSON.stringify(original);
 const result=source.slice(0,start)+compact+source.slice(end+2);
 // Confirm the published catalog retains identical records; never change prices or account terms.
 if(JSON.stringify(JSON.parse(result.slice(start,start+compact.length)))!==compact)throw Error('Catalog integrity failure');
 fs.writeFileSync(catalogPath,result);
 console.log('Performance: local Alexandria variable fonts; catalog '+Buffer.byteLength(source)+' → '+Buffer.byteLength(result)+' bytes.');
}

function prepare(){fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output);for(const entry of fs.readdirSync(root,{withFileTypes:true}))if(entry.isFile()&&!entry.name.startsWith('.')&&rootFile(entry.name))fs.copyFileSync(path.join(root,entry.name),path.join(output,entry.name));for(const name of directories)if(fs.existsSync(path.join(root,name)))copyTree(path.join(root,name),path.join(output,name));const logo=Buffer.from(fs.readFileSync(path.join(root,'scripts/storefront-logo.webp.b64'),'utf8').trim(),'base64');if(logo.toString('ascii',0,4)!=='RIFF'||logo.toString('ascii',8,12)!=='WEBP'||logo.length>40000)throw Error('Invalid optimized logo');fs.mkdirSync(path.join(output,'assets'),{recursive:true});fs.writeFileSync(path.join(output,'assets','storefront-logo-480.webp'),logo);optimizeStorefront();fs.writeFileSync(path.join(output,'.nojekyll'),'');return output;}
if(require.main===module){prepare();console.log('Prepared public storefront assets in _site; server modules, SQL, tests and configuration excluded.');}
module.exports={prepare,rootFile,assetFile,directories};
