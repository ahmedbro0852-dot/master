export const MAX_REFERENCE_BYTES=3*1024*1024;
export function validateReferenceImage(value){
 if(typeof value!=='string')throw Error('صورة البداية غير صالحة');
 if(value.startsWith('data:')){
  const match=/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if(!match||match[2].length>4*Math.ceil(MAX_REFERENCE_BYTES/3))throw Error('ارفع صورة JPG أو PNG أو WebP بحجم مناسب');
  const bytes=Buffer.from(match[2],'base64');
  if(bytes.length>MAX_REFERENCE_BYTES||bytes.length<12)throw Error('حجم الصورة غير مناسب؛ الحد 3 ميجابايت بعد التجهيز');
  const valid=match[1]==='jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:match[1]==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
  if(!valid)throw Error('محتوى الصورة لا يطابق نوع الملف');
  return value;
 }
 let url;try{url=new URL(value)}catch{throw Error('رابط الصورة غير صالح')}
 if(url.protocol!=='https:'||url.username||url.password)throw Error('رابط الصورة يجب أن يكون HTTPS');
 return url.href;
}
