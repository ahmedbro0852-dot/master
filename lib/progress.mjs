// The provider exposes job states, not a percentage. This is a labelled UI
// estimate; it never marks a pending or failed generation as complete.
export function estimatedProgress(job,now=Date.now()){
 if(job.status==='succeeded'&&(job.output?.url||job.payload?.output?.url))return 100;
 if(['failed','canceled'].includes(job.status))return null;
 const timestamp=Date.parse(job.status==='processing'?(job.payload?.started_at||job.started_at||job.created_at):job.created_at);
 const seconds=Number.isFinite(timestamp)?Math.max(0,(now-timestamp)/1000):0;
 if(job.status==='submitting')return Math.min(12,1+Math.floor(seconds/3));
 if(job.status==='queued')return Math.min(28,13+Math.floor(seconds/6));
 if(job.status==='processing')return Math.min(94,30+Math.floor(65*(1-Math.exp(-seconds/105))));
 return 95;
}
export function progressStage(job){if(job.status==='succeeded')return 'الفيديو جاهز';if(job.status==='processing')return 'بنجهّز مشاهد الفيديو';if(job.status==='queued')return 'مستنيين دورك في التوليد';return 'استلمنا طلبك بنجاح';}
