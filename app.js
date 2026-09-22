const rows = [
['Lovable Pro','AI Tools','12 شهر','1,800 ج','تفعيل مباشر على حساب Lovable','حساب العميل الشخصي — بدون طلب كلمة مرور Gmail','ضمان كامل','متاح','خطة Pro لبناء التطبيقات والمواقع بالذكاء الاصطناعي وفق الحدود الرسمية للمنصة.'],
['Lovable Pro Lite','AI Tools','12 شهر','650 ج','رابط تفعيل على البريد الشخصي — بدون بطاقة','حساب العميل','ضمان كامل','متاح','300 Credit عند التفعيل مع 5 Credits يوميًا طوال مدة الخطة.'],
['Runway Pro','AI Tools','—','—','—','—','—','غير متوفر','الخدمة غير متوفرة حاليًا.'],
['Perplexity Pro','AI Tools','شهر','550 ج','تسليم حساب جاهز','حساب خاص — تغيير البيانات مسموح','ضمان كامل','متاح','محرك بحث ذكي متقدم. قد يطلب كود تسجيل دخول أول مرة، ونرسله للعميل عند الحاجة. أجهزة غير محدودة ولا يتضمن AI Credits إضافية.'],
['Claude Pro','AI Tools','شهر','1,250 ج','تفعيل خلال ساعة إلى ساعتين','حساب العميل عبر بيانات الدخول أو كود تسجيل مؤقت','ضمان كامل لمدة شهر','متاح','تشمل الخطة جميع مزايا Claude Pro، ويتم الدفع والتفعيل من بطاقة المتجر.'],
['ChatGPT Plus','AI Tools','شهر','1,100 ج','تفعيل على حساب العميل','بيانات الحساب أو كود تسجيل دخول مؤقت','ضمان كامل لمدة شهر','متاح','تفعيل ChatGPT Plus على الحساب الشخصي للعميل مع جميع مزايا الخطة الرسمية.'],
['Grok','AI Tools','10 أيام','150 ج','تسليم حساب جاهز','إيميل وكلمة مرور','5 أيام','متاح','مساعد ذكاء اصطناعي للمحادثة والبحث وإنجاز المهام اليومية.'],
['Wink AI','AI Tools','أسبوع / شهر','150–400 ج','تسليم حساب جاهز خلال 5 دقائق','تغيير البيانات مسموح','ضمان كامل','متاح','أدوات تحسين الفيديو والصور. الاستخدام وفق الحدود الرسمية للمنصة وقد تتغير هذه الحدود من مقدم الخدمة.'],
['Gamma Plus','AI Tools','شهر','400 ج','تسليم حساب جاهز','إيميل وكلمة مرور','ضمان كامل','متاح','إنشاء عروض تقديمية ومستندات وصفحات باستخدام الذكاء الاصطناعي.'],
['Gamma Account','AI Tools','حسب العرض','800 ج','تسليم حساب جاهز خلال 10 دقائق إلى ساعة','حساب خاص واحد يضم 5 Workspaces','ضمان كامل','متاح','إجمالي 10,000 Credit موزعة على خمس مساحات عمل، بواقع 2,000 Credit لكل Workspace.'],
['ElevenLabs Pro','AI Tools','شهر','550 ج','تسليم حساب جاهز خلال 10 دقائق إلى ساعة','حساب خاص — يمكن تغيير كلمة المرور','ضمان كامل','متاح','يتضمن 131,000 Credit تُضاف مرة واحدة إلى الحساب.'],
['HeyGen AI','AI Tools','شهر - 1250 Credits','1,250 ج','تسليم حساب جاهز خلال 10 دقائق إلى ساعة','إيميل وكلمة مرور','ضمان كامل','متاح','1,250 Credit تُضاف مرة واحدة لإنشاء الفيديوهات والأفاتار والتعليق الصوتي.'],
['Midjourney','AI Tools','—','—','—','—','—','غير متوفر','الخدمة غير متوفرة حاليًا.'],
['Leonardo AI','AI Tools','—','—','—','—','—','غير متوفر','الخدمة غير متوفرة حاليًا.'],
['Manus','AI Tools','12 شهر','2,250 ج','تسليم حساب خاص','حساب خاص — يُفضل عدم تغيير البيانات','ضمان كامل','متاح','وكيل ذكاء اصطناعي لتنفيذ المهام والبحث وتنظيم سير العمل.'],
['Gumloop','AI Tools','20,000 Credits','350 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان الرصيد','متاح','20 ألف Credit لأتمتة سير العمل وربط المهام المدعومة بالذكاء الاصطناعي.'],
['Magic Patterns','AI Tools','12 شهر','450 ج','دعوة أو حساب جاهز','حسب المتوفر','ضمان كامل','متاح','أداة لإنشاء واجهات وتجارب رقمية من الأوصاف النصية.'],
['Factory Pro','AI Tools','12 شهر','1,850 ج','Workspace','احتفظ بالبيانات الأصلية','ضمان كامل','متاح','خطة للمطورين والفرق لبناء البرمجيات بمساعدة الذكاء الاصطناعي.'],
['Framer Pro','AI Tools','12 شهر','600 ج','دعوة أو حساب','حسب المتوفر','ضمان كامل','متاح','تصميم ونشر المواقع التفاعلية بسرعة ومن دون تعقيد.'],
['Supabase Pro','AI Tools','12 شهر','1,550 ج','حساب أو Organization','احتفظ بالبيانات الأصلية','ضمان كامل','متاح','قواعد بيانات ومصادقة وبنية خلفية للمشاريع الرقمية.'],
['Canva Pro','التصميم','3 سنوات','50 ج','تفعيل على البريد الشخصي','حساب العميل','ضمان سنتين','متاح','دعوة رسمية إلى Canva Pro على البريد الشخصي للعميل.'],
['CapCut Pro','التصميم','أسبوع / شهر / 3 / 6 / 12 شهر','من 50 ج','تسليم حساب جاهز خلال دقيقة إلى ساعة','إيميل وكلمة مرور — جهازان — ممنوع تغيير البيانات','ضمان كامل','متاح','جميع الخطط مضمونة بالكامل. الاشتراكات الأطول من شهر تُسلّم بحساب جديد كل شهر طوال المدة.'],
['Figma Pro','التصميم','12 شهر','750 ج','دعوة أو حساب','حسب المتوفر','ضمان كامل','متاح','تصميم واجهات المستخدم والتعاون على النماذج الأولية والمشاريع.'],
['Freepik','التصميم','شهر','450 ج','تسليم حساب Premium جاهز','إيميل وكلمة مرور','ضمان كامل','متاح','تحميل Premium مفتوح ولا تشمل الخطة AI Credits.'],
['Adobe Creative Cloud','التصميم','—','—','—','—','—','انتهى المخزون','حزمة تطبيقات Adobe الإبداعية؛ الخدمة غير متوفرة حاليًا.'],
['Duolingo Super','التعليم','سنة','300 ج','رابط تفعيل بدون بطاقة','حساب فردي على البريد الشخصي','ضمان كامل','متاح','تعلم اللغات بلا إعلانات وبقلوب غير محدودة.'],
['ELSA Speak','التعليم','7 أيام / سنة','90–1,900 ج','تسليم أو تفعيل','حساب فردي','ضمان كامل','متاح','تدريب على نطق الإنجليزية وتطوير مهارات التحدث.'],
['Coursera Plus','التعليم','3 شهور / سنة مشترك / سنة خاص','300–1,000 ج','تسليم حساب','مشترك أو خاص','ضمان كامل','متاح','الشهادات متاحة. في الحساب المشترك قد يستخدم أشخاص آخرون الحساب وربما صدرت شهادات سابقة لبعض الدورات بأسمائهم.'],
['Quizizz Premium','التعليم','12 شهر','1,500 ج','تفعيل على البريد الشخصي','الخطة Premium حسب المتوفر','ضمان كامل','متاح','إنشاء اختبارات وأنشطة تعليمية تفاعلية وإدارة مشاركة الطلاب.'],
['Wordwall Pro','التعليم','شهر / سنة','300–1,050 ج','تسليم حساب جاهز','إيميل وكلمة مرور','ضمان كامل','متاح','إنشاء أنشطة وألعاب تعليمية قابلة للمشاركة والطباعة.'],
['Turnitin','التعليم','ملف واحد','250 ج','إرسال ملف','خدمة فحص','حسب الخدمة','متاح','فحص ملف واحد وإصدار نتيجة التشابه وفق الخدمة المتاحة.'],
['Microsoft 365','الإنتاجية','سنة','200 ج','حساب جاهز أو تفعيل','احتفظ بالبيانات الأصلية عند استلام حساب جاهز','ضمان كامل','متاح','تطبيقات Microsoft للإنتاجية والمستندات والجداول والعروض.'],
['Notion Plus / Business','الإنتاجية','3 / 6 شهور','400–600 ج','حساب شخصي أو جاهز','قد يتطلب كود OTP','ضمان كامل','متاح','تنظيم العمل والمشاريع والوثائق وقواعد البيانات في مساحة واحدة.'],
['LinkedIn Premium','الإنتاجية','3 شهور','250 ج','رابط تفعيل يستخدم مرة واحدة','حساب شخصي — يلزم وجود بطاقة','ضمان كامل','متاح','مزايا مهنية إضافية للحساب الشخصي، ويُستهلك رابط التفعيل بمجرد استخدامه.'],
['Zoom Pro','الإنتاجية','12 شهر','1,800 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان كامل','متاح','اجتماعات بوقت غير محدود وفق خصائص خطة Zoom Pro.'],
['Stealth Writer','الإنتاجية','شهر','400 ج','تسليم حساب','بيانات دخول الحساب','ضمان كامل','متاح','إعادة صياغة النصوص وتحسين الأسلوب، دون ضمان تجاوز أدوات كشف المحتوى.'],
['Railway Hobby','الإنتاجية','12 شهر','650 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان كامل','متاح','خطة Hobby لتشغيل ونشر المشاريع والتطبيقات.'],
['Pangram Pro','الإنتاجية','12 شهر','650 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان كامل','متاح','أدوات احترافية لتحليل المحتوى والعمل على النصوص.'],
['Supercut Pro','الإنتاجية','12 شهر','600 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان كامل','متاح','خطة Pro لأدوات صناعة وتحرير المحتوى.'],
['Wispr Flow Pro','الإنتاجية','12 شهر','800 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان كامل','متاح','إملاء صوتي ذكي وتحويل الكلام إلى نص أثناء العمل.'],
['Mobbin Team','الإنتاجية','12 شهر','600 ج','دعوة إلى Team','احتفظ بإعدادات الفريق','ضمان كامل','متاح','مكتبة مراجع لتصميم واجهات وتجارب المستخدم.'],
['Granola Business','الإنتاجية','12 شهر','300 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان كامل','متاح','تدوين وتنظيم ملاحظات الاجتماعات بمساعدة الذكاء الاصطناعي.'],
['Jam Team','الإنتاجية','12 شهر','1,550 ج','دعوة إلى Team','احتفظ بالبيانات الأصلية','ضمان كامل','متاح','تسجيل ومشاركة مشكلات المواقع والتعاون عليها مع الفريق.'],
['Readwise + Reader','الإنتاجية','12 شهر','650 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان كامل','متاح','حفظ وتنظيم ومراجعة المقالات والكتب والملاحظات.'],
['Waking Up','الإنتاجية','12 شهر','650 ج','تسليم حساب جاهز','بيانات دخول الحساب','ضمان كامل','متاح','اشتراك كامل في تطبيق Waking Up.'],
['Linear Business','الإنتاجية','5 شهور','600 ج','دعوة أو حساب','حسب المتوفر','ضمان كامل','متاح','إدارة المشاريع والمهام للفرق بخطة Business.'],
['PostHog Scale','الإنتاجية','12 شهر','1,200 ج','تسليم حساب','بيانات دخول الحساب','ضمان كامل','متاح','تحليلات المنتجات وسلوك المستخدمين وفق خطة Scale.'],
['Customer.io Essentials','الإنتاجية','حسب العرض','650 ج','تسليم حساب','بيانات دخول الحساب','ضمان كامل','متاح','أدوات الرسائل والتواصل الآلي مع العملاء.'],
['iCloud+ 4TB','الإنتاجية','شهر','1,450 ج','دعوة Apple ID','مشاركة عائلية','ضمان كامل','متاح','ترقية مساحة iCloud+ إلى 4TB من خلال المشاركة العائلية.'],
['NordVPN','VPN والحماية','3 شهور','300 ج','تسليم حساب جاهز','إيميل وكلمة مرور','ضمان كامل','متاح','اتصال VPN آمن مع الالتزام بعدم تغيير بيانات الحساب.'],
['Proton VPN','VPN والحماية','سنة','800 ج','تسليم حساب جاهز','إيميل وكلمة مرور — جهاز واحد','ضمان كامل','متاح','خدمة VPN مخصصة للاستخدام على جهاز واحد فقط.'],
['Surfshark','VPN والحماية','شهرين','200 ج','كود تفعيل','يتطلب بطاقة أثناء التفعيل','بدون Hold Warranty','متاح','كود ترويجي لتفعيل Surfshark وفق شروط العرض.'],
['HMA VPN','VPN والحماية','30 يوم','100 ج','تسليم حساب جاهز','إيميل وكلمة مرور','حسب العرض','متاح','اتصال VPN بحساب جاهز لمدة شهر.'],
['ExpressVPN','VPN والحماية','3 أيام','50 ج','تفعيل','حسب العرض','حسب العرض','متاح','خدمة VPN قصيرة المدة للتصفح والاتصال المشفر.'],
['Spotify Premium','الترفيه','3 شهور','100 ج','تسليم حساب جاهز','إيميل وكلمة مرور','ضمان كامل','متاح','استماع للموسيقى والمحتوى الصوتي بمزايا Premium من خلال حساب جاهز.'],
['YouTube Premium','الترفيه','3 شهور','200 ج','رابط تفعيل يحتاج بطاقة','حساب شخصي','ضمان كامل','متاح','مشاهدة YouTube بلا إعلانات مع YouTube Music على الحساب الشخصي.'],
['Grammarly Premium','قريباً','—','—','—','—','—','قريباً','أدوات مساعدة للكتابة والتدقيق باللغة الإنجليزية؛ سيتم توفيرها لاحقًا.'],
['QuillBot Premium','قريباً','—','—','—','—','—','قريباً','إعادة صياغة النصوص وأدوات كتابة مساعدة؛ سيتم توفيرها لاحقًا.'],
['Envato Elements','قريباً','—','—','—','—','—','قريباً','مكتبة أصول رقمية وقوالب للمبدعين؛ سيتم توفيرها لاحقًا.'],
['Motion Array','قريباً','—','—','—','—','—','قريباً','قوالب وموارد للفيديو والمونتاج؛ سيتم توفيرها لاحقًا.'],
['Suno AI','قريباً','—','—','—','—','—','قريباً','أداة لإنشاء محتوى موسيقي بالذكاء الاصطناعي؛ سيتم توفيرها لاحقًا.'],
['Murf AI','قريباً','—','—','—','—','—','قريباً','إنشاء أصوات وتعليقات صوتية بالذكاء الاصطناعي؛ سيتم توفيرها لاحقًا.'],
['Discord Nitro','قريباً','—','—','—','—','—','قريباً','مزايا إضافية لحساب Discord؛ سيتم توفيرها لاحقًا.'],
['Kling AI','قريباً','—','—','—','—','—','انتهى المخزون','أداة لإنشاء الفيديو بالذكاء الاصطناعي؛ المخزون منتهٍ حاليًا.']
];

const categoryBenefits={
'AI Tools':['الوصول إلى المزايا المتقدمة المتاحة في الخطة','مناسب للكتابة أو البحث أو الإنتاج الإبداعي حسب الأداة','شرح طريقة الدخول أو التفعيل عند التسليم'],
'التصميم':['أدوات وموارد احترافية لصناعة المحتوى','مناسب للمصممين وصناع المحتوى','تفاصيل الخطة وحدود الاستخدام تُوضح قبل الدفع'],
'التعليم':['تجربة تعلم أو أدوات تعليمية بمزايا إضافية','تفعيل مناسب لنوع الحساب الموضح','دعم في خطوات التفعيل الأولية'],
'الإنتاجية':['مزايا تساعد على تنظيم وإنجاز العمل','الخطة والمدة موضحتان قبل التنفيذ','تسليم أو تفعيل حسب طبيعة الخدمة'],
'VPN والحماية':['اتصال مشفر وفق خصائص مقدم الخدمة','مدة استخدام واضحة قبل الطلب','تعليمات دخول أو تفعيل عند التسليم'],
'الترفيه':['مزايا Premium خلال مدة الاشتراك','تفعيل على الحساب الموضح في العرض','متابعة أولية بعد التفعيل'],
'قريباً':['يمكن متابعة حالة التوفر مع المتجر','يتم إعلان السعر والخطة عند وصول المخزون','لا يتم الدفع قبل تأكيد التوفر']};
const categoryTerms={
'AI Tools':['الرصيد والحدود تخضع للخطة وسياسة مقدم الخدمة.','يُمنع تغيير بيانات الحساب الجاهز دون موافقة.','الاستخدام المخالف لسياسات المنصة غير مشمول بالضمان.'],
'التصميم':['حدود التحميل أو التصدير تعتمد على الخطة.','لا تُشارك بيانات الحساب الجاهز مع طرف آخر.','ملكية الملفات التي ينشئها العميل مسؤوليته.'],
'التعليم':['نوع الحساب المشترك أو الخاص يُحدد قبل الدفع.','الشهادات أو الدرجات ليست مضمونة إلا إن نُص عليها.','خدمة Turnitin تشمل الفحص ولا تشمل تعديل الملف.'],
'الإنتاجية':['يجب توفير بريد صحيح عند طلب التفعيل.','المساحة والخصائص تعتمد على الخطة الفعلية.','أي تغيير أمني في الحساب قد يتطلب إعادة تحقق.'],
'VPN والحماية':['جودة الاتصال تعتمد على الجهاز والشبكة والدولة.','يُمنع استخدام الخدمة في نشاط مخالف للقانون.','عدد الأجهزة يخضع للخطة الموضحة.'],
'الترفيه':['يجب أن يكون الحساب مؤهلًا للتفعيل.','لا يتم تغيير دولة الحساب أو بياناته أثناء التفعيل.','محتوى المنصة وتوفره يخضعان لمقدم الخدمة.'],
'قريباً':['هذا المنتج غير متاح للطلب حاليًا.','لا يتم حجزه أو دفع قيمته قبل التأكيد.','السعر والخطة النهائية يعلنان عند التوفر.']};

const logoSlugs={
'Lovable Pro':'lovable','Lovable Pro Lite':'lovable','Runway Pro':'runway','Perplexity Pro':'perplexity','Claude Pro':'claude','ChatGPT Plus':'chatgpt','Grok':'grok','Gamma Plus':'gamma','Gamma Account':'gamma','ElevenLabs Pro':'elevenlabs','Midjourney':'midjourney','Manus':'manus','Framer Pro':'framer','Supabase Pro':'supabase','Canva Pro':'canva','CapCut Pro':'capcut','Figma Pro':'figma','Freepik':'freepik','Adobe Creative Cloud':'adobe','Duolingo Super':'duolingo','ELSA Speak':'elsa','Coursera Plus':'coursera','Quizizz Premium':'quizizz','Microsoft 365':'microsoft','Notion Plus / Business':'notion','LinkedIn Premium':'linkedin','Zoom Pro':'zoom','iCloud+ 4TB':'icloud','NordVPN':'nordvpn','Proton VPN':'protonvpn','Surfshark':'surfshark','HMA VPN':'hma','ExpressVPN':'expressvpn','Spotify Premium':'spotify','YouTube Premium':'youtube','Grammarly Premium':'grammarly','QuillBot Premium':'quillbot','Envato Elements':'envato','Suno AI':'suno','Discord Nitro':'discord','Kling AI':'kling'};
const planSets={
'Lovable Pro Lite':[
{name:'سنة',duration:'12 شهر',price:'650 ج',credits:'300 Credit + 5 يوميًا',activation:'رابط تفعيل على البريد الشخصي — بدون بطاقة',account:'حساب العميل',warranty:'ضمان كامل'}],
'Wink AI':[
{name:'أسبوع',duration:'7 أيام',price:'150 ج',credits:'وفق الحدود الرسمية',activation:'تسليم خلال 5 دقائق',account:'حساب جاهز — تغيير البيانات مسموح',warranty:'ضمان كامل'},
{name:'شهر',duration:'30 يوم',price:'400 ج',credits:'وفق الحدود الرسمية',activation:'تسليم خلال 5 دقائق',account:'حساب جاهز — تغيير البيانات مسموح',warranty:'ضمان كامل'}],
'CapCut Pro':[
{name:'أسبوع',duration:'7 أيام',price:'50 ج',credits:'بدون Credits مضمونة',activation:'حساب جاهز خلال دقيقة إلى ساعة',account:'جهازان — ممنوع تغيير البيانات',warranty:'ضمان كامل للخدمة'},
{name:'شهر — 500 Credit',duration:'30 يوم',price:'180 ج',credits:'500 Credit',activation:'حساب جاهز خلال دقيقة إلى ساعة',account:'جهازان — ممنوع تغيير البيانات',warranty:'ضمان كامل'},
{name:'شهر — 1500 Credit',duration:'30 يوم',price:'300 ج',credits:'1500 Credit',activation:'حساب جاهز خلال دقيقة إلى ساعة',account:'جهازان — ممنوع تغيير البيانات',warranty:'ضمان كامل'},
{name:'3 شهور',duration:'3 شهور',price:'500 ج',credits:'400–1500 Credit عشوائيًا كل شهر',activation:'حساب جديد كل شهر',account:'جهازان — ممنوع تغيير البيانات',warranty:'ضمان كامل'},
{name:'6 شهور',duration:'6 شهور',price:'900 ج',credits:'400–1500 Credit عشوائيًا كل شهر',activation:'حساب جديد كل شهر',account:'جهازان — ممنوع تغيير البيانات',warranty:'ضمان كامل'},
{name:'سنة',duration:'12 شهر',price:'1,400 ج',credits:'400–1500 Credit عشوائيًا كل شهر',activation:'حساب جديد كل شهر',account:'جهازان — ممنوع تغيير البيانات',warranty:'ضمان كامل'}],
'ELSA Speak':[
{name:'7 أيام',duration:'7 أيام',price:'90 ج'},{name:'سنة',duration:'12 شهر',price:'1,900 ج'}],
'Coursera Plus':[
{name:'3 شهور',duration:'3 شهور',price:'300 ج',account:'حسب المتوفر',warranty:'ضمان كامل'},
{name:'سنة مشتركة',duration:'12 شهر',price:'300 ج',account:'حساب مشترك — الشهادات متاحة',warranty:'ضمان كامل'},
{name:'سنة خاصة',duration:'12 شهر',price:'1,000 ج',account:'حساب خاص — الشهادات متاحة',warranty:'ضمان كامل'}],
'Wordwall Pro':[
{name:'شهر',duration:'30 يوم',price:'300 ج'},{name:'سنة',duration:'12 شهر',price:'1,050 ج'}],
'Notion Plus / Business':[
{name:'3 شهور',duration:'3 شهور',price:'400 ج'},{name:'6 شهور',duration:'6 شهور',price:'600 ج'}],
'Zoom Pro':[
{name:'سنة',duration:'12 شهر',price:'1,800 ج',account:'حساب جاهز',warranty:'ضمان كامل'}]};
const logoDomains={
'Wink AI':'wink.ai','Gumloop':'gumloop.com','Magic Patterns':'magicpatterns.com','Factory Pro':'factory.ai','HeyGen AI':'heygen.com','Railway Hobby':'railway.app','Pangram Pro':'pangram.com','Supercut Pro':'supercut.ai','Wispr Flow Pro':'wisprflow.ai','Mobbin Team':'mobbin.com','Granola Business':'granola.ai','Jam Team':'jam.dev','Readwise + Reader':'readwise.io','Waking Up':'wakingup.com','Linear Business':'linear.app','PostHog Scale':'posthog.com','Customer.io Essentials':'customer.io','Stealth Writer':'stealthwriter.ai','Wordwall Pro':'wordwall.net','Turnitin':'turnitin.com','Motion Array':'motionarray.com','Murf AI':'murf.ai'
};
const products=rows.map((r,i)=>({id:i,name:r[0],category:r[1],duration:r[2],price:r[3],activation:r[4],account:r[5],warranty:r[6],status:r[7],description:r[8],benefits:categoryBenefits[r[1]],terms:categoryTerms[r[1]],logo:logoSlugs[r[0]]||'',domain:logoDomains[r[0]]||'',plans:planSets[r[0]]||[]}));
const categories=['الكل',...new Set(products.map(p=>p.category))];
let selected='الكل';
const grid=document.querySelector('#grid'),filters=document.querySelector('#filters'),search=document.querySelector('#search'),empty=document.querySelector('#empty'),dialog=document.querySelector('#productDialog'),dialogContent=document.querySelector('#dialogContent'),checkoutDialog=document.querySelector('#checkoutDialog'),checkoutContent=document.querySelector('#checkoutContent'),toast=document.querySelector('#toast');
function initials(n){return n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function productIcon(p){const url=p.logo?`logos/${p.logo}.svg`:p.domain?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(p.domain)}&sz=128`:'';return `<span class="product-icon logo-${p.logo||'remote'} ${url?'':'logo-failed'}">${url?`<img src="${url}" alt="شعار ${p.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.classList.add('logo-failed')">`:''}<span class="fallback">${initials(p.name)}</span></span>`}
function drawFilters(){filters.innerHTML=categories.map(c=>`<button class="filter ${c===selected?'active':''}" data-c="${c}">${c}</button>`).join('');filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=b.dataset.c;drawFilters();draw()})}
function draw(){const q=search.value.trim().toLowerCase();const list=products.filter(p=>(selected==='الكل'||p.category===selected)&&Object.values(p).join(' ').toLowerCase().includes(q));grid.innerHTML=list.map(p=>`<article class="card"><div class="card-top">${productIcon(p)}<span class="badge ${p.status!=='متاح'?'soon':''}">${p.status}</span></div><h3>${p.name}</h3><span class="category">${p.category}</span><div class="meta"><span>${p.plans.length>1?'الخطط المتاحة':'المدة'}</span><b>${p.plans.length>1?p.plans.length+' خطط':p.duration}</b></div><div class="price"><strong>${p.price}</strong><div class="card-actions"><button class="details" data-id="${p.id}">التفاصيل</button><button class="order" data-order="${p.id}">${p.plans.length>1?'اختر الخطة':'اطلب'}</button></div></div></article>`).join('');empty.style.display=list.length?'none':'block';grid.querySelectorAll('.details').forEach(b=>b.onclick=()=>openDetails(+b.dataset.id));grid.querySelectorAll('.order').forEach(b=>b.onclick=()=>{const p=products[+b.dataset.order];p.plans.length>1?openDetails(p.id):orderProduct(p,resolvePlan(p))})}
function fact(label,value){return `<div class="fact"><small>${label}</small><b>${value}</b></div>`}
function resolvePlan(p,plan={}){return{name:plan.name||p.duration,duration:plan.duration||p.duration,price:plan.price||p.price,credits:plan.credits||'غير محدد',activation:plan.activation||p.activation,account:plan.account||p.account,warranty:plan.warranty||p.warranty}}
function openDetails(id){const p=products[id],plans=p.plans.length?p.plans:[resolvePlan(p)],first=resolvePlan(p,plans[0]),options=p.plans.length>1?`<label class="plan-picker"><span>اختر الخطة</span><select id="planSelect">${p.plans.map((x,i)=>`<option value="${i}">${x.name} — ${x.price}</option>`).join('')}</select></label>`:'';dialogContent.innerHTML=`<div class="detail-hero"><div class="detail-heading">${productIcon(p)}<div><h2 id="dialogTitle">${p.name}</h2><p>${p.category}</p></div></div><div class="detail-price"><strong id="detailPrice">${first.price}</strong><span class="badge ${p.status!=='متاح'?'soon':''}">${p.status}</span></div></div><div class="detail-body"><p class="detail-description">${p.description}</p>${options}<div class="detail-facts"><div class="fact"><small>الخطة أو المدة</small><b id="detailDuration">${first.duration}</b></div><div class="fact"><small>Credits أو الرصيد</small><b id="detailCredits">${first.credits}</b></div><div class="fact"><small>طريقة التسليم والتفعيل</small><b id="detailActivation">${first.activation}</b></div><div class="fact"><small>بيانات الحساب</small><b id="detailAccount">${first.account}</b></div><div class="fact"><small>الضمان</small><b id="detailWarranty">${first.warranty}</b></div></div><div class="detail-columns"><div><h3>مميزات الخدمة</h3><ul class="detail-list">${p.benefits.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><h3>شروط مهمة</h3><ul class="detail-list terms-list">${p.terms.map(x=>`<li>${x}</li>`).join('')}</ul></div></div><button class="dialog-order" data-order-dialog="${p.id}" ${p.status!=='متاح'?'disabled':''}>${p.status==='متاح'?'اطلب الخطة المختارة':'غير متاح للطلب الآن'}</button></div>`;dialog.showModal();let chosen=first;const select=dialogContent.querySelector('#planSelect');if(select)select.onchange=()=>{chosen=resolvePlan(p,p.plans[+select.value]);dialogContent.querySelector('#detailPrice').textContent=chosen.price;dialogContent.querySelector('#detailDuration').textContent=chosen.duration;dialogContent.querySelector('#detailCredits').textContent=chosen.credits;dialogContent.querySelector('#detailActivation').textContent=chosen.activation;dialogContent.querySelector('#detailAccount').textContent=chosen.account;dialogContent.querySelector('#detailWarranty').textContent=chosen.warranty};dialogContent.querySelector('[data-order-dialog]')?.addEventListener('click',()=>orderProduct(p,chosen))}
const paymentInfo={we1:['WE Pay','01500950624 — أحمد …م…م…'],we2:['WE Pay','01505896364 — منصور …ع…ج…'],binance:['Binance Pay','Pay ID: 1222200704']};
function paymentBox(key){const x=paymentInfo[key];return `<div class="payment-details"><b>${x[0]}</b><span>${x[1]}</span><small>يرجى تأكيد توفر الخدمة والسعر عبر واتساب قبل التحويل.</small></div>`}
function orderProduct(p,selectedPlan){
 if(p.status!=='متاح'){showToast('هذه الخدمة غير متاحة حاليًا');return}
 const plan=selectedPlan||resolvePlan(p);if(dialog.open)dialog.close();
 checkoutContent.innerHTML=`<div class="checkout-head"><h2 id="checkoutTitle">مراجعة الطلب</h2><p>هذه معاينة كاملة للطلب. لن يتم الخصم أو إرسال الطلب قبل تركيب نظام التحقق من الدفع.</p></div><div class="order-summary">${productIcon(p)}<div><b>${p.name}</b><small>${plan.name} — ${plan.duration}</small><small>${plan.activation} • ${plan.account}</small></div><strong id="orderTotal">${plan.price}</strong></div><div class="checkout-plan"><span>Credits: <b>${plan.credits}</b></span><span>الضمان: <b>${plan.warranty}</b></span></div><form id="checkoutForm"><div class="form-grid"><label class="field"><span>الاسم</span><input name="name" required placeholder="الاسم الكامل"></label><label class="field"><span>رقم واتساب</span><input name="phone" required inputmode="tel" placeholder="01xxxxxxxxx"></label><label class="field full"><span>البريد الإلكتروني</span><input name="email" type="email" required placeholder="name@example.com"></label><label class="field full"><span>الكمية — الحد الأقصى 5</span><select name="quantity" id="quantitySelect">${[1,2,3,4,5].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></label></div><h3>طريقة الدفع</h3><div class="payment-choices"><div class="payment-choice"><input id="pay1" type="radio" name="pay" value="we1" checked><label for="pay1"><b>WE Pay</b><small>01500950624</small></label></div><div class="payment-choice"><input id="pay2" type="radio" name="pay" value="we2"><label for="pay2"><b>WE Pay</b><small>01505896364</small></label></div><div class="payment-choice"><input id="pay3" type="radio" name="pay" value="binance"><label for="pay3"><b>Binance Pay</b><small>1222200704</small></label></div></div><div id="payDetails">${paymentBox('we1')}</div><div class="api-pending"><b>الدفع متوقف مؤقتًا</b><span>سيُفعّل الطلب بعد تركيب API التحقق من الدفع. عند نجاح التحقق سيُحفظ الطلب في الإدارة ويظهر للعميل نص واتساب جاهز لإرساله كتأكيد إضافي.</span></div><button class="checkout-submit" type="button" disabled>في انتظار ربط التحقق من الدفع</button><p class="checkout-safe">الأسعار المعروضة نهائية ولا توجد رسوم إضافية.</p></form>`;
 checkoutDialog.showModal();
 checkoutContent.querySelectorAll('[name="pay"]').forEach(r=>r.onchange=()=>checkoutContent.querySelector('#payDetails').innerHTML=paymentBox(r.value));
 const quantity=checkoutContent.querySelector('#quantitySelect'),total=checkoutContent.querySelector('#orderTotal'),numeric=Number(plan.price.replace(/[^0-9]/g,''));
 quantity.onchange=()=>{total.textContent=numeric?`${numeric*Number(quantity.value).toLocaleString('en-US')} ج`:plan.price};
}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}
document.querySelector('.dialog-close').onclick=()=>dialog.close();document.querySelector('.checkout-close').onclick=()=>checkoutDialog.close();[dialog,checkoutDialog].forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));document.querySelectorAll('.copy').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);showToast('تم النسخ')}catch{showToast('تعذر النسخ')}});search.addEventListener('input',draw);drawFilters();draw();

const mobileMenu=document.querySelector('.menu');
const mobileNav=document.createElement('nav');
mobileNav.className='mobile-nav';
mobileNav.setAttribute('aria-label','التنقل السريع');
mobileNav.innerHTML='<a href="#products">المنتجات</a><a href="#how">طريقة الطلب</a><a href="#payment">طرق الدفع</a><a href="#terms">الشروط</a>';
document.querySelector('.topbar').appendChild(mobileNav);
mobileMenu.setAttribute('aria-expanded','false');
mobileMenu.onclick=()=>{const open=mobileNav.classList.toggle('open');mobileMenu.setAttribute('aria-expanded',String(open))};
mobileNav.querySelectorAll('a').forEach(link=>link.onclick=()=>{mobileNav.classList.remove('open');mobileMenu.setAttribute('aria-expanded','false')});

const checkoutObserver=new MutationObserver(()=>{
 const submit=checkoutContent.querySelector('.checkout-submit');
 const form=checkoutContent.querySelector('#checkoutForm');
 if(!submit||!form||submit.dataset.ready)return;
 submit.disabled=false;
 submit.textContent='إرسال الطلب للمراجعة عبر واتساب';
 submit.dataset.ready='true';
 submit.onclick=()=>{
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const product=checkoutContent.querySelector('.order-summary b')?.textContent||'';
  const plan=checkoutContent.querySelector('.order-summary small')?.textContent||'';
  const total=checkoutContent.querySelector('#orderTotal')?.textContent||'';
  const message=['طلب جديد من MASTER STORE','المنتج: '+product,'الخطة: '+plan,'الكمية: '+data.get('quantity'),'الاسم: '+data.get('name'),'واتساب: '+data.get('phone'),'البريد: '+data.get('email'),'الإجمالي: '+total,'طريقة الدفع المفضلة: '+data.get('pay'),'أرغب بتأكيد التوفر وطريقة الدفع قبل التحويل.'].join('\n');
  window.open('https://wa.me/201500950624?text='+encodeURIComponent(message),'_blank','noopener');
  showToast('تم تجهيز رسالة الطلب في واتساب');
 };
});
checkoutObserver.observe(checkoutContent,{childList:true,subtree:true});
