/* Service capabilities; commercial terms and quotas remain in catalog.js per plan. */
(function(){
'use strict';
const entries={
'windows-pro':[
 ['تشفير الأقراص باستخدام BitLocker لحماية ملفاتك.','BitLocker drive encryption to protect your files.'],
 ['Remote Desktop للوصول إلى جهازك عن بُعد بعد الإعداد.','Host Remote Desktop connections after setup.'],
 ['Hyper-V لتشغيل أنظمة افتراضية على الأجهزة الداعمة.','Run virtual machines with Hyper-V on supported hardware.'],
 ['إدارة إعدادات العمل عبر Group Policy والانضمام إلى نطاق المؤسسة.','Manage work settings with Group Policy and domain join.'],
 ['مفتاح تفعيل للإصدار المحدد؛ يلزم تطابق نسخة Pro ومتطلبات الجهاز.','Activation key for the selected version; a matching Pro edition and compatible hardware are required.'],
 ['دفعة واحدة لتفعيل الإصدار المشترى؛ Microsoft 365 وOffice اشتراكات منفصلة.','One payment for the purchased version; Office and Microsoft 365 are separate.']
],
'cursor-pro':[
 ['كتابة وتعديل الكود داخل محرر برمجي بمساعدة الذكاء الاصطناعي.','Write and edit code with AI assistance inside your editor.'],
 ['فهم ملفات المشروع وشرح الدوال والعلاقات بين أجزاء الكود.','Understand project files, functions, and code relationships.'],
 ['اقتراح تعديلات لمعالجة الأخطاء وإعادة تنظيم الكود.','Suggest fixes and refactor existing code.'],
 ['مراجعة التغييرات المقترحة قبل اعتمادها؛ الاستهلاك حسب حدود الخطة.','Review proposed changes before applying them; usage follows plan limits.']
],
'chatgpt-plus':[
 ['كتابة المحتوى ومراجعته وتلخيصه حسب المطلوب.','Draft, review, and summarize content.'],
 ['رفع الملفات والصور لتحليلها وشرح محتواها.','Upload files and images for analysis and explanation.'],
 ['المساعدة في البرمجة وفهم الأخطاء وتنظيم البيانات.','Get help with code, debugging, and organizing data.'],
 ['شرح الدروس وتوليد أمثلة وأسئلة للمراجعة.','Explain lessons and generate practice examples and questions.'],
 ['الأدوات والنماذج تخضع لحدود Plus وتوافرها على الحساب.','Tools and models are subject to Plus limits and account availability.']
],
'chatgpt-teachers-k12':[
 ['صياغة خطط دروس وأنشطة وأسئلة للتدريب والمراجعة.','Draft lesson plans, activities, and review questions.'],
 ['إعادة صياغة الشرح ليناسب مستوى الطالب.','Adapt explanations to a student’s level.'],
 ['المساعدة في إعداد مواد تعليمية وتلخيص المحتوى.','Prepare teaching materials and summarize content.'],
 ['نوع الحساب ومدة الباقة والضمان موضحة في تفاصيل العرض.','See the selected offer for account type, term, and warranty.']
],
'gemini-pro':[
 ['محادثة وكتابة وتحليل ملفات وصور باستخدام Gemini.','Chat, write, and analyze files and images with Gemini.'],
 ['البحث المتعمق وتنظيم النتائج والمقارنة بين المصادر.','Research topics, organize findings, and compare sources.'],
 ['المساعدة في البرمجة وتلخيص المستندات والمحتوى الطويل.','Get coding help and summarize documents and long content.'],
 ['أدوات Google AI المؤهلة حسب الحساب والمنطقة وحدود الباقة.','Eligible Google AI tools depend on account, region, and plan limits.']
],
'claude-pro':[
 ['تحليل المستندات والنصوص الطويلة واستخراج أهم النقاط.','Analyze documents and long texts to extract key points.'],
 ['كتابة المسودات وتحريرها وتحسين وضوح الأفكار.','Draft and edit writing for clarity.'],
 ['شرح الأكواد واقتراح حلول للمشكلات البرمجية.','Explain code and suggest programming solutions.'],
 ['تنظيم العمل على الأبحاث والمشروعات ضمن حدود استخدام Pro.','Organize research and project work within Pro usage limits.']
],
'perplexity-pro':[
 ['البحث عن إجابات مع روابط المصادر للرجوع إليها.','Search for answers with source links you can check.'],
 ['مقارنة معلومات من مصادر متعددة وتلخيص النتائج.','Compare multiple sources and summarize findings.'],
 ['طرح أسئلة متابعة للوصول إلى تفاصيل أدق.','Ask follow-up questions to explore details.'],
 ['تحليل الملفات والبحث المتعمق وفق أدوات وحدود خطة Pro.','Analyze files and use research tools within Pro limits.']
],
'lovable-pro':[
 ['تحويل وصف فكرتك إلى واجهات وصفحات ويب قابلة للتطوير.','Turn a written idea into web interfaces and pages.'],
 ['تعديل تصميم المشروع ومحتواه بالمحادثة.','Revise project design and content through chat.'],
 ['إنشاء نموذج أولي وتجربة أفكار قبل التوسع في المشروع.','Prototype and test ideas before expanding a project.'],
 ['كل باقة لها رصيد وطريقة تفعيل؛ راجع تفاصيل الباقة المختارة.','Credits and activation differ by plan; see your selected option.']
],
'runway-pro':[
 ['توليد فيديو وصور بالذكاء الاصطناعي.','Generate AI video and images.'],
 ['تطوير لقطات من أفكار نصية أو صور مرجعية ضمن الأدوات المتاحة.','Develop shots from prompts or reference images using available tools.'],
 ['استخدام الرصيد الشهري في أدوات الإنتاج حسب استهلاك كل عملية.','Spend monthly credits on creation tools at their respective usage rates.']
],
'wink-ai':[
 ['تحسين وضوح الفيديو والصور بأدوات الذكاء الاصطناعي.','Enhance video and image clarity with AI tools.'],
 ['تعديل المظهر وتطبيق مؤثرات على المحتوى.','Adjust appearance and apply visual effects.'],
 ['تجهيز مقاطع قصيرة للنشر على منصات التواصل.','Prepare short clips for social platforms.']
],
'grok':[
 ['محادثة وشرح أفكار وكتابة محتوى بأساليب مختلفة.','Discuss ideas, get explanations, and draft content.'],
 ['البحث عن المعلومات وتلخيصها مع مراجعة مصادر النتائج.','Find and summarize information while checking sources.'],
 ['المساعدة في حل المسائل وفهم الأكواد.','Get help solving problems and understanding code.'],
 ['المزايا وحدود الاستخدام حسب اشتراك SuperGrok والحساب.','Features and usage limits depend on the SuperGrok account.']
],
'gamma-plus':[
 ['تحويل الأفكار والنصوص إلى عروض تقديمية منظمة.','Turn ideas and text into structured presentations.'],
 ['تعديل المحتوى والتصميم وتنسيق البطاقات داخل المحرر.','Edit content, layout, and cards inside the editor.'],
 ['إنشاء مستندات وصفحات ومشاركتها برابط.','Create documents and pages and share them by link.'],
 ['التصدير وأدوات الذكاء الاصطناعي بحسب الخطة والرصيد المتاح.','Export and AI tools follow the selected plan and available credits.']
],
'gamma-account':[
 ['إنشاء عروض ومستندات وتنظيمها داخل مساحات عمل منفصلة.','Create presentations and documents in separate workspaces.'],
 ['تعديل النصوص والتصميم ومشاركة النتائج برابط.','Edit text and design, then share results by link.'],
 ['الرصيد موزع على مساحات العمل كما هو موضح في الباقة.','Credits are distributed between workspaces as stated in the plan.']
],
'elevenlabs':[
 ['تحويل النص إلى تعليق صوتي باستخدام أصوات واقعية.','Turn text into voice-overs with realistic voices.'],
 ['ضبط النص وإعادة توليد المقاطع للوصول إلى الأداء المطلوب.','Refine scripts and regenerate segments for the desired delivery.'],
 ['إنتاج محتوى صوتي للفيديو والبودكاست والشرح.','Create audio for videos, podcasts, and explanations.'],
 ['اللغات والنماذج وحدود التوليد تتحدد حسب الخطة والرصيد.','Languages, models, and generation limits depend on plan and credits.']
],
'heygen':[
 ['تحويل نصوصك إلى فيديو يقدمه أفاتار رقمي.','Turn scripts into videos presented by a digital avatar.'],
 ['إعداد شروحات وعروض ومنشورات فيديو تسويقية.','Prepare explainers, presentations, and marketing videos.'],
 ['تعديل النصوص والمشاهد والصوت ضمن أدوات الحساب.','Edit scripts, scenes, and audio using account tools.'],
 ['مدة الإنتاج واستهلاك التوليد حسب الرصيد والإعدادات.','Production length and usage depend on credits and settings.']
],
'canva-pro':[
 ['تصميم منشورات وعروض وسير ذاتية باستخدام قوالب Pro.','Design posts, presentations, and resumes with Pro templates.'],
 ['استخدام صور وعناصر وموارد Pro في تصميماتك.','Use Pro images, elements, and assets in your designs.'],
 ['إزالة الخلفيات وتغيير مقاسات التصميم للمنصات المختلفة.','Remove backgrounds and resize designs for different platforms.'],
 ['تنظيم الشعار والألوان والخطوط في Brand Kit.','Organize logos, colors, and fonts with Brand Kit.'],
 ['أدوات AI ضمن حدود Canva المتاحة للحساب.','AI tools are subject to the account’s Canva limits.']
],
'capcut-pro':[
 ['قص المقاطع وترتيبها وإضافة النصوص والصوت للفيديو.','Trim and arrange clips, then add text and audio.'],
 ['استخدام مؤثرات وانتقالات وأصول Pro المتاحة للحساب.','Use available Pro effects, transitions, and assets.'],
 ['تجهيز فيديوهات بمقاسات مناسبة لمنصات التواصل.','Prepare videos in formats suited to social platforms.'],
 ['أدوات AI تستهلك رصيدًا؛ الكمية حسب الباقة المختارة.','AI tools consume credits; the amount depends on the selected plan.']
],
'figma':[
 ['تصميم واجهات مواقع وتطبيقات في ملفات قابلة للتعاون.','Design web and app interfaces in collaborative files.'],
 ['إنشاء Components وإعادة استخدامها للحفاظ على تناسق الواجهة.','Build reusable components for consistent interfaces.'],
 ['ربط الشاشات في Prototype لتجربة التنقل والتفاعل.','Connect screens in a prototype to test navigation.'],
 ['مشاركة التصميم والتعليقات مع الفريق وفق صلاحيات المقعد.','Share designs and feedback according to seat permissions.']
],
'freepik':[
 ['تحميل الصور والفيكتور وملفات PSD المشمولة في عرض Premium.','Download photos, vectors, and PSD assets included in the Premium offer.'],
 ['موارد لتصميم المنشورات والإعلانات والمطبوعات.','Find assets for social posts, ads, and print designs.'],
 ['تعديل الملفات باستخدام برنامج متوافق مع صيغتها.','Edit assets using software compatible with their format.'],
 ['العرض للتحميل فقط ولا يشمل توليد الصور أو أدوات AI.','This is a download-only offer; AI generation and AI tools are not included.'],
 ['الاستخدام وفق ترخيص الملف وحدود التنزيل للحساب.','Use follows each asset’s license and account download limits.']
],
'adobe-cc':[
 ['أدوات Adobe للتصميم وتحرير الصور والمونتاج ضمن الباقة المفعلة.','Adobe tools for design, image editing, and video within the activated plan.'],
 ['إنشاء ملفات قابلة للتعديل للمشروعات الإبداعية.','Create editable files for creative projects.'],
 ['تنزيل التطبيقات المشمولة من خلال حساب Creative Cloud.','Download included apps through your Creative Cloud account.'],
 ['التطبيقات ورصيد AI والتخزين تتحدد حسب الترخيص المفعّل.','Apps, AI credits, and storage depend on the activated license.']
],
'duolingo':[
 ['ممارسة المفردات والقواعد والاستماع بتمارين قصيرة.','Practice vocabulary, grammar, and listening with short exercises.'],
 ['التعلم بدون إعلانات ضمن مزايا Super.','Learn without ads with Super features.'],
 ['مراجعة الأخطاء ومتابعة تقدّمك وروتينك اليومي.','Review mistakes and track progress and daily practice.'],
 ['مزايا Max غير مشمولة تلقائيًا في اشتراك Super.','Max features are not automatically included in Super.']
],
'elsa':[
 ['تدريب عملي على نطق الكلمات والجمل الإنجليزية.','Practice pronouncing English words and sentences.'],
 ['ملاحظات على النطق لمساعدتك على تحديد مواضع التحسين.','Get pronunciation feedback to identify areas to improve.'],
 ['تمارين استماع وتحدث لبناء عادة ممارسة منتظمة.','Build a practice routine with listening and speaking exercises.'],
 ['الوصول إلى المحتوى المدفوع المشمول في باقة Pro.','Access paid learning content included in the Pro plan.']
],
'coursera':[
 ['دراسة دورات مشمولة في Coursera Plus من جامعات وشركات.','Study courses included in Coursera Plus from universities and companies.'],
 ['مسارات لتطوير مهارات العمل والتقنية والأعمال.','Explore learning paths for professional, technical, and business skills.'],
 ['التعلم في الوقت المناسب لك مع أنشطة وتقييمات الدورات.','Learn at your own pace with course activities and assessments.'],
 ['الشهادات تتطلب إكمال متطلبات الدورة؛ ليست كل برامج Coursera مشمولة.','Certificates require course completion; not every Coursera program is included.']
],
'quizizz':[
 ['إنشاء اختبارات وأنشطة تفاعلية للطلاب.','Create interactive quizzes and student activities.'],
 ['تقديم الأنشطة مباشرة أو تعيينها للمراجعة الذاتية.','Run activities live or assign them for self-paced review.'],
 ['متابعة الإجابات وتقارير الأداء لتحديد صعوبات التعلم.','Review answers and reports to identify learning difficulties.'],
 ['الأدوات والقوالب المتاحة حسب صلاحيات الاشتراك المفعّل.','Available tools and templates depend on the activated subscription.']
],
'wordwall':[
 ['تحويل أسئلتك إلى ألعاب وأنشطة تعليمية تفاعلية.','Turn questions into interactive learning games and activities.'],
 ['استخدام القوالب لتجهيز مراجعات مناسبة للدروس.','Use templates to prepare lesson reviews.'],
 ['مشاركة رابط النشاط مع الطلاب وتعديل المحتوى لاحقًا.','Share activity links with students and edit content later.'],
 ['القوالب وحدود إنشاء الأنشطة وفق باقة Pro المفعلة.','Templates and activity limits follow the activated Pro plan.']
],
'turnitin':[
 ['فحص ملف واحد وإرسال تقرير نسبة التشابه.','Check one document and receive a similarity report.'],
 ['تحديد مواضع التطابق والمصادر المرتبطة في التقرير.','Review matched passages and associated sources in the report.'],
 ['مراجعة الاقتباسات والتوثيق قبل تسليم البحث.','Review quotations and citations before submission.'],
 ['نسبة التشابه تحتاج قراءة بشرية؛ لا تعني وحدها ثبوت الانتحال.','A similarity score needs human review; it is not by itself a plagiarism verdict.']
],
'microsoft-365':[
 ['كتابة الأبحاث والخطابات وتنسيقها باستخدام Word.','Write and format research papers and letters in Word.'],
 ['تنظيم البيانات والحسابات والجداول باستخدام Excel.','Organize data, calculations, and tables in Excel.'],
 ['إنشاء عروض تقديمية وتحرير الشرائح في PowerPoint.','Create presentations and edit slides in PowerPoint.'],
 ['التطبيقات والأجهزة والتخزين حسب ترخيص Microsoft 365 المفعّل.','Apps, devices, and storage depend on the activated Microsoft 365 license.'],
 ['ترخيص Office لا يفعّل نظام Windows؛ لكل منتج ترخيص مستقل.','Office licensing does not activate Windows; each product has its own license.']
],
'notion':[
 ['تجميع الملاحظات والمستندات والمشروعات في مساحة واحدة.','Bring notes, documents, and projects into one workspace.'],
 ['إنشاء قواعد بيانات وجداول لمتابعة المهام والمحتوى.','Build databases and tables to track tasks and content.'],
 ['استخدام القوالب وربط الصفحات لتسهيل التنظيم.','Use templates and linked pages to organize work.'],
 ['صلاحيات التعاون ومزايا AI تتبع نوع الخطة والمقعد المفعّل.','Collaboration permissions and AI features follow the activated plan and seat.']
],
'linkedin-premium':[
 ['أدوات Premium لدعم البحث عن فرص العمل والتواصل المهني.','Premium tools for job searching and professional networking.'],
 ['معلومات إضافية عن الحساب والوظائف وفق نوع الباقة.','Additional profile and job insights depend on the plan.'],
 ['التفعيل على حسابك الشخصي عبر رابط يستخدم مرة واحدة.','Activate on your own account using a one-time link.'],
 ['عدد InMail وإمكانية التعلم حسب نوع Premium المؤهل للحساب.','InMail allowance and learning access depend on the eligible Premium tier.']
],
'zoom':[
 ['عقد اجتماعات ودروس فيديو مع مشاركة الشاشة.','Host video meetings and classes with screen sharing.'],
 ['أدوات للمضيف لتنظيم المشاركين والتفاعل أثناء الاجتماع.','Use host controls to manage participants and interaction.'],
 ['مشاركة رابط الاجتماع مع المشاركين للانضمام.','Share meeting links with attendees.'],
 ['عدد المشاركين والتسجيل ومدة الاجتماع حسب باقة Pro المفعلة.','Participant, recording, and meeting limits follow the activated Pro plan.']
],
'stealth-writer':[
 ['إعادة صياغة النصوص وإنتاج بدائل للأسلوب والتعبير.','Rephrase text and generate alternative wording and styles.'],
 ['تحسين سلاسة الجمل مع مراجعة المعنى والمراجع يدويًا.','Improve sentence flow while manually checking meaning and references.'],
 ['مقارنة النص الأصلي بالنسخة المعدلة قبل اعتمادها.','Compare the original and revised text before using it.'],
 ['حدود الكلمات تختلف بين Starter وPlus؛ لا ضمان لتجاوز أدوات الكشف.','Word limits differ by Starter and Plus; bypassing detectors is not guaranteed.']
],
'icloud':[
 ['تخزين الصور والملفات على iCloud ضمن المساحة المخصصة.','Store photos and files within your allocated iCloud space.'],
 ['مزامنة البيانات بين أجهزة Apple المرتبطة بحسابك.','Sync data between Apple devices linked to your account.'],
 ['استخدام النسخ الاحتياطي على الأجهزة المؤهلة.','Use backups on eligible devices.'],
 ['توزيع المساحة وطريقة الربط يحددهما عرض 4TB؛ التخزين السحابي لا يزيد الذاكرة الداخلية.','The 4TB offer defines allocation and setup; cloud storage does not expand internal device storage.']
],
'spotify':[
 ['الاستماع للموسيقى بدون إعلانات Spotify الصوتية.','Listen to music without Spotify music ads.'],
 ['تنزيل الموسيقى في التطبيق للاستماع دون إنترنت أثناء سريان الاشتراك.','Download music in the app for offline listening while subscribed.'],
 ['اختيار المقاطع والتحكم في ترتيب التشغيل.','Choose tracks and control playback order.'],
 ['التفعيل على حسابك الشخصي حسب شروط العرض والمنطقة.','Activate on your personal account under the offer’s regional terms.']
],
'youtube':[
 ['مشاهدة الفيديوهات بدون الإعلانات التي يعرضها YouTube.','Watch without ads served by YouTube.'],
 ['تشغيل المحتوى في الخلفية على الأجهزة المؤهلة.','Play content in the background on eligible devices.'],
 ['تنزيل الفيديوهات داخل التطبيق للمشاهدة دون إنترنت حيث تتوفر الميزة.','Download videos in the app for offline viewing where available.'],
 ['خدمات Premium المشمولة تتبع نوع الباقة والمنطقة.','Included Premium services depend on the plan and region.']
],
'kling':[
 ['توليد لقطات فيديو بالذكاء الاصطناعي من وصف أو صورة.','Generate AI video shots from a prompt or image.'],
 ['تجربة أفكار بصرية وإعادة توليد اللقطات حسب الرصيد.','Explore visual ideas and regenerate shots using your credits.'],
 ['استهلاك الكريدت يتغير حسب النموذج والمدة والجودة المختارة.','Credit usage varies by model, duration, and output quality.']
],
'quillbot':[
 ['إعادة صياغة الجمل واستكشاف أكثر من أسلوب للكتابة.','Paraphrase sentences and explore different writing styles.'],
 ['مراجعة القواعد وتحسين وضوح النص.','Review grammar and improve clarity.'],
 ['تلخيص النصوص لاستخراج الأفكار الرئيسية.','Summarize text to extract key ideas.'],
 ['الأدوات المدفوعة وحدود الاستخدام وفق باقة Premium.','Paid tools and usage limits follow the Premium plan.']
],
'ilovepdf':[
 ['دمج ملفات PDF وتقسيمها وترتيب صفحاتها.','Merge and split PDFs and organize pages.'],
 ['ضغط ملفات PDF لتسهيل مشاركتها ورفعها.','Compress PDFs for easier sharing and uploading.'],
 ['التحويل بين PDF والصيغ المكتبية المدعومة.','Convert between PDF and supported office formats.'],
 ['معالجة الملفات ضمن حدود الاشتراك؛ الرصيد المعلن حسب عرض المتجر.','Process files within subscription limits; the advertised credits follow the store offer.']
],
'bdf-egypt-ai':[
 ['استخدام أدوات معالجة الملفات بالذكاء الاصطناعي في BDF Egypt.','Use AI file-processing tools in BDF Egypt.'],
 ['رصيد ملفات لاستخدام الأدوات المشمولة بالعرض.','Use file credits on tools included in the offer.'],
 ['فتح صلاحيات Pro وفق الباقة المختارة.','Unlock Pro access under the selected plan.'],
 ['متابعة استهلاك الرصيد عند معالجة الملفات.','Track credit usage as files are processed.']
],
'humanizeai-standard':[
 ['إعادة صياغة النص وتحسين أسلوبه مع الحفاظ على المعنى.','Rephrase text and refine style while preserving meaning.'],
 ['أدوات كتابة وتدقيق لغوي ضمن حدود Standard.','Writing and proofreading tools within Standard limits.'],
 ['حصص منفصلة لإعادة الصياغة والكتابة والفحص كما في الباقة.','Separate rewriting, writing, and checking quotas as stated in the plan.'],
 ['نتائج كشف AI والتشابه للمراجعة ولا تضمن نتيجة لدى أدوات أخرى.','AI and similarity checks support review and do not guarantee results in other tools.']
],
'we-gold-discount':[
 ['كود تفعيل لعرض خصم الإنترنت المنزلي للعملاء المؤهلين.','Activation code for eligible home-internet customers.'],
 ['الخصم على الفاتورة الأساسية وفق شروط العرض.','The discount applies to the base bill under the offer’s terms.'],
 ['تأكيد أهلية الاشتراك الحالي مع الدعم قبل شراء الكود.','Confirm eligibility of your current subscription before buying the code.']
],
'manus':[
 ['تنظيم وتنفيذ مهام متعددة الخطوات بمساعدة الذكاء الاصطناعي.','Organize and execute multi-step tasks with AI.'],
 ['جمع المعلومات وإعداد نتائج منظمة للمراجعة.','Gather information and prepare structured results for review.'],
 ['المساعدة في الأبحاث والمشروعات وسير العمل الرقمي.','Get help with research, projects, and digital workflows.'],
 ['التنفيذ يستهلك الرصيد حسب المهمة؛ راجع رصيد الباقة المختارة.','Tasks consume credits according to usage; check the selected plan’s balance.']
],
'gumloop':[
 ['بناء سير عمل يربط عدة خطوات في عملية واحدة.','Build workflows connecting multiple steps in one process.'],
 ['دمج تحليل البيانات والنصوص باستخدام أدوات AI المتاحة.','Combine data and text analysis using available AI tools.'],
 ['أتمتة الأعمال المتكررة بدل تنفيذ كل خطوة يدويًا.','Automate repetitive work instead of running each step manually.'],
 ['عدد التشغيلات والتكاملات حسب حدود الخطة.','Run allowances and integrations depend on plan limits.']
],
'magic-patterns':[
 ['إنشاء أفكار واجهات من وصف نصي.','Generate interface concepts from written prompts.'],
 ['تجربة بدائل لتصميم الصفحات والمكونات.','Explore alternatives for pages and components.'],
 ['تعديل النموذج الأولي وتحسينه قبل التنفيذ.','Refine a prototype before implementation.'],
 ['التوليد والتصدير حسب صلاحيات Starter والرصيد.','Generation and export depend on Starter permissions and credits.']
],
'factory-pro':[
 ['مساعدة برمجية لفهم ملفات المشروع وكتابة التعديلات.','Coding assistance to understand project files and implement changes.'],
 ['تحليل الأخطاء واقتراح حلول ومراجعة الكود.','Analyze errors, suggest fixes, and review code.'],
 ['دعم مهام التطوير المتكررة ضمن أدوات المنصة.','Support recurring development tasks using platform tools.'],
 ['مراجعة التغييرات والاختبارات قبل نشر المشروع.','Review changes and tests before releasing a project.']
],
'framer-pro':[
 ['تصميم صفحات ويب مرئية مع معاينة للمقاسات المختلفة.','Visually design web pages and preview different screen sizes.'],
 ['إضافة الحركة والتفاعل للصفحات.','Add motion and interaction to pages.'],
 ['نشر الموقع وإدارة المحتوى ضمن أدوات Framer.','Publish sites and manage content using Framer tools.'],
 ['الدومين وحدود الاستضافة وCMS حسب خطة الموقع المفعلة.','Domains, hosting, and CMS limits follow the activated site plan.']
],
'supabase-pro':[
 ['قاعدة بيانات PostgreSQL لإدارة بيانات التطبيق.','Use PostgreSQL to manage application data.'],
 ['أدوات Auth لتسجيل الدخول وإدارة المستخدمين.','Use Auth for sign-in and user management.'],
 ['تخزين الملفات وربط الواجهة بخدمات البنية الخلفية.','Store files and connect your frontend to backend services.'],
 ['موارد المشروع وحصص الاستخدام حسب الخطة؛ الاستهلاك الإضافي منفصل.','Project resources follow plan quotas; additional usage is separate.']
],
'railway-hobby':[
 ['نشر التطبيقات والخدمات من مشروعك البرمجي.','Deploy applications and services from your code project.'],
 ['إدارة متغيرات التشغيل والاطلاع على سجلات الخدمات.','Manage runtime variables and inspect service logs.'],
 ['تشغيل خدمات مترابطة حسب إعداد المشروع.','Run connected services according to project setup.'],
 ['التشغيل محسوب بالاستهلاك؛ راجع الرصيد والفوترة قبل التوسع.','Runtime is usage-based; check credits and billing before scaling.']
],
'pangram-pro':[
 ['تحليل النص لرصد مؤشرات المحتوى المولّد بالذكاء الاصطناعي.','Analyze text for signs of AI-generated content.'],
 ['مراجعة المقاطع المشار إليها داخل نتائج الفحص.','Review passages flagged in the analysis.'],
 ['استخدام النتائج لمساعدة المراجع على تقييم النص.','Use results to support a reviewer’s assessment.'],
 ['نتائج احتمالية وليست حكمًا قاطعًا؛ حدود الفحص حسب الخطة.','Results are probabilistic, not conclusive; checking limits follow the plan.']
],
'supercut-pro':[
 ['تسجيل الشاشة والصوت لشرح فكرة أو مشاركة تحديث عمل.','Record your screen and audio to explain ideas or share work updates.'],
 ['مشاركة التسجيل مع الفريق عبر رابط.','Share recordings with your team using a link.'],
 ['تفريغ وملخصات وأقسام تلقائية حسب أدوات الحساب المتاحة.','Use transcripts, summaries, and chapters where available to the account.'],
 ['حدود التسجيل والتخزين حسب باقة Pro المفعلة.','Recording and storage limits follow the activated Pro plan.']
],
'wispr-flow-pro':[
 ['إملاء الرسائل والمستندات بالصوت بدل الكتابة اليدوية.','Dictate messages and documents instead of typing.'],
 ['تحويل الكلام إلى نص قابل للمراجعة والتعديل.','Turn speech into text you can review and edit.'],
 ['استخدام الإملاء في التطبيقات المدعومة.','Use dictation in supported applications.'],
 ['دقة النتيجة تتأثر باللغة والميكروفون ووضوح الكلام.','Accuracy depends on language, microphone, and speech clarity.']
],
'mobbin-team':[
 ['تصفح شاشات وتدفقات استخدام من تطبيقات ومواقع حقيقية.','Browse screens and user flows from real apps and websites.'],
 ['البحث عن أنماط واجهات لمقارنة حلول التصميم.','Search interface patterns to compare design approaches.'],
 ['جمع مراجع بصرية لتخطيط تجربة المستخدم.','Collect visual references for user-experience planning.'],
 ['المشاركة وصلاحيات الوصول وفق مقعد Team المفعّل.','Sharing and access depend on the activated Team seat.']
],
'jam-team':[
 ['توثيق مشكلات الموقع بتسجيل مرئي بدل الشرح الطويل.','Document website issues visually instead of lengthy explanations.'],
 ['مشاركة خطوات إعادة المشكلة مع فريق التطوير.','Share reproduction steps with developers.'],
 ['تنظيم الملاحظات لتسهيل فحص الأخطاء ومتابعتها.','Organize feedback to simplify debugging and follow-up.'],
 ['التكاملات وصلاحيات التسجيل حسب مقعد Team.','Integrations and recording permissions depend on the Team seat.']
],
'readwise-reader':[
 ['حفظ المقالات ومصادر القراءة للرجوع إليها لاحقًا.','Save articles and reading sources for later.'],
 ['تظليل الأفكار المهمة وتسجيل ملاحظات أثناء القراءة.','Highlight key ideas and take reading notes.'],
 ['تنظيم الاقتباسات ومراجعتها لبناء معرفة متراكمة.','Organize and review highlights to build lasting knowledge.'],
 ['استخدام Reader لقراءة المحتوى المدعوم في مكان واحد.','Read supported content in one place with Reader.']
],
'waking-up':[
 ['جلسات تأمل موجهة لبناء ممارسة منتظمة.','Guided meditation sessions for regular practice.'],
 ['محتوى صوتي ودروس عن الانتباه والوعي.','Audio lessons about attention and awareness.'],
 ['اختيار الجلسات المناسبة لوقتك وروتينك اليومي.','Choose sessions that fit your time and daily routine.']
],
'linear-business':[
 ['تسجيل المهام والمشكلات وتوزيعها على أعضاء الفريق.','Create tasks and issues and assign them to teammates.'],
 ['تنظيم المشروعات ومراحل العمل والأولويات.','Organize projects, milestones, and priorities.'],
 ['متابعة حالة التنفيذ من خلال قوائم وعروض للمشروع.','Track execution through project lists and views.'],
 ['مزايا الفريق والصلاحيات حسب خطة Business.','Team features and permissions follow the Business plan.']
],
'posthog-scale':[
 ['تتبع أحداث الاستخدام لفهم تفاعل العملاء مع المنتج.','Track usage events to understand product engagement.'],
 ['تحليل مسارات التحويل والاحتفاظ بالمستخدمين.','Analyze conversion funnels and user retention.'],
 ['إعداد تقارير تساعد على تقييم تغييرات المنتج.','Build reports to evaluate product changes.'],
 ['المنتجات والحصص والفوترة حسب الاستهلاك؛ لا يعني العرض استخدامًا غير محدود.','Products, quotas, and billing are usage-based; the offer is not unlimited.']
],
'customerio-essentials':[
 ['تنظيم رسائل العملاء في تدفقات تواصل آلية.','Organize customer messages into automated journeys.'],
 ['تقسيم الجمهور بحسب بياناته وتفاعلاته.','Segment audiences by data and behavior.'],
 ['تشغيل حملات ورسائل مرتبطة بأحداث المستخدم.','Trigger campaigns and messages from user events.'],
 ['قنوات الإرسال وأعداد العملاء والرسائل وفق الخطة والاستهلاك.','Channels, customer counts, and message allowances follow plan and usage.']
],
'envato':[
  [
    "فيديوهات Stock وصور جاهزة للمشروعات الإبداعية.",
    "Stock videos and photos for creative projects."
  ],
  [
    "قوالب فيديو لتجهيز المقدمات والعروض والمحتوى.",
    "Video templates for intros, presentations, and content."
  ],
  [
    "قوالب مواقع وCMS وWordPress ضمن المكتبة المشمولة.",
    "Website, CMS, and WordPress templates in the included library."
  ],
  [
    "موسيقى ومؤثرات صوتية للمحتوى وفق شروط الترخيص.",
    "Music and sound effects for content under the license terms."
  ],
  [
    "قوالب تصميم وجرافيك وموارد ثلاثية الأبعاد حسب المتاح.",
    "Design templates, graphics, and 3D assets where available."
  ],
  [
    "تسليم اسم مستخدم وكلمة مرور للدخول عبر بوابة تحويل إلى Envato.",
    "Receive a username and password for an access portal that redirects to Envato."
  ],
  [
    "ضمان كامل للوصول المقدم وفق تفاصيل العرض.",
    "Full warranty for the access provided under the offer."
  ],
  [
    "الاستخدام التجاري مرتبط بترخيص المشروع وفق شروط Envato.",
    "Commercial use requires project licensing under Envato terms."
  ]
],
'motion-array':[
 ['قوالب وموارد تساعد في تجهيز مشروعات الفيديو.','Templates and assets for video projects.'],
 ['اختيار الأصول المتوافقة مع برنامج المونتاج المستخدم.','Choose assets compatible with your video editor.'],
 ['الخدمة قريبًا؛ حدود التنزيل والترخيص تظهر عند توفر العرض.','Coming soon; download and licensing terms will appear with the offer.']
],
'murf':[
 ['تحويل النص إلى تعليق صوتي للمقاطع والشروحات.','Turn text into voice-overs for videos and explainers.'],
 ['تجربة الأصوات واللغات التي تدعمها الباقة.','Explore voices and languages supported by the plan.'],
 ['الخدمة قريبًا؛ حدود التوليد والتنزيل تتحدد عند توفر العرض.','Coming soon; generation and download limits will be specified with the offer.']
],
'discord':[
  [
    "عضوية Discord Nitro لمدة وصول تتراوح بين 25 و45 يومًا.",
    "Discord Nitro membership with 25–45 days of access."
  ],
  [
    "تشمل تعزيزين للسيرفر (2 Server Boosts).",
    "Includes 2 Server Boosts."
  ],
  [
    "يمكن تغيير كلمة مرور الحساب.",
    "The account password can be changed."
  ],
  [
    "بلد تسجيل الحساب عشوائي.",
    "The account registration country is random."
  ]
],
'midjourney':[
 ['توليد صور بالذكاء الاصطناعي من وصف نصي.','Generate AI images from text prompts.'],
 ['استكشاف أساليب بصرية وتنويعات للصورة.','Explore visual styles and image variations.'],
 ['غير متوفر حاليًا؛ الرصيد وحقوق الاستخدام حسب الباقة عند عودتها.','Currently unavailable; credits and usage rights will follow the returning offer.']
],
'leonardo-ai':[
  [
    "إنشاء صور من وصف نصي لأفكارك ومشروعاتك.",
    "Generate images from written descriptions for your ideas and projects."
  ],
  [
    "تصميم صور للمنتجات والإعلانات ومنشورات السوشيال ميديا.",
    "Create visuals for products, advertisements, and social posts."
  ],
  [
    "تجربة أساليب بصرية مختلفة مثل الواقعي والرسوم والتصميم المفاهيمي.",
    "Explore visual styles such as realistic imagery, illustration, and concept art."
  ],
  [
    "استخدام صور مرجعية لتوجيه التكوين والأسلوب ضمن النماذج الداعمة.",
    "Use reference images to guide composition and style with supported models."
  ],
  [
    "تعديل الصور بالأوامر النصية عبر أدوات التحرير المتاحة للحساب.",
    "Edit images with prompts using the account’s available editing tools."
  ],
  [
    "تحسين دقة الصور وإبراز التفاصيل بأدوات Upscale المتاحة.",
    "Improve resolution and details with available upscaling tools."
  ],
  [
    "إنتاج تنويعات للصورة ومراجعتها قبل تنزيل النتيجة النهائية.",
    "Generate image variations and review them before downloading the final result."
  ],
  [
    "عدد الصور واستهلاك الرصيد يختلفان حسب النموذج والجودة والأداة المستخدمة.",
    "Image counts and credit usage vary by model, quality, and tool."
  ]
]
};
Object.assign(entries,{
'bdf-egypt-pro':[
 ['فتح أدوات معالجة PDF المدفوعة في BDF Egypt.','Unlock paid PDF-processing tools in BDF Egypt.'],
 ['معالجة عدة ملفات بالإعدادات نفسها في الأدوات الداعمة.','Batch-process files with the same settings in supported tools.'],
 ['حفظ الإعدادات واستعادتها لتكرار العمل بسهولة.','Save and restore settings for recurring work.'],
 ['حتى 40 ملفًا و100 ميجابايت حسب الأداة.','Up to 40 files and 100 MB depending on the tool.']
],
'grammarly':[
 ['تصحيح الأخطاء الإملائية والنحوية أثناء الكتابة.','Correct spelling and grammar while writing.'],
 ['اقتراح صياغات أوضح وتحسين ترابط الجمل.','Get clearer phrasing suggestions and improve sentence flow.'],
 ['مراجعة النبرة والأسلوب لتناسب الجمهور.','Review tone and style for your audience.'],
 ['أدوات AI المدفوعة بحسب صلاحيات وحدود الحساب.','Paid AI tools depend on account permissions and limits.']
],
'granola-business':[
 ['ملاحظات اجتماعات قابلة للمراجعة بمساعدة الذكاء الاصطناعي.','Create reviewable AI-assisted meeting notes.'],
 ['تلخيص النقاط المهمة والقرارات لمتابعتها بعد الاجتماع.','Summarize key points and decisions for follow-up.'],
 ['تنظيم الملاحظات والبحث عنها بدل تدوين كل التفاصيل يدويًا.','Organize and find notes instead of manually capturing every detail.'],
 ['تفعيل على إيميلك أو حساب جاهز كما في الباقة.','Activate on your email or receive a ready account as stated in the plan.']
],
'replit-core':[
 ['كتابة وتشغيل الكود مباشرة من المتصفح.','Write and run code directly in your browser.'],
 ['إنشاء مواقع وتطبيقات وتعديلها بمساعدة AI.','Create and revise websites and apps with AI assistance.'],
 ['إدارة ملفات المشروع وبيئة التطوير في مكان واحد.','Manage project files and the development environment in one place.'],
 ['استهلاك Agent والنشر والموارد وفق حدود Core والفوترة.','Agent usage, deployments, and resources follow Core limits and billing.']
],
'miro-pro':[
 ['سبورة مشتركة لتنظيم أفكار الفريق بصريًا.','Use a shared board to organize team ideas visually.'],
 ['إنشاء خرائط ذهنية ومخططات وملاحظات لاصقة.','Create mind maps, diagrams, and sticky notes.'],
 ['التخطيط للمشروعات وورش العمل في مساحة واحدة.','Plan projects and workshops in one workspace.'],
 ['مشاركة اللوحة والتعليق عليها وفق صلاحيات الحساب.','Share boards and comment according to account permissions.']
]
});
const iptv=[
 ['قنوات رياضية وعربية وعالمية ضمن قائمة السيرفر المشمولة.','Sports, Arabic, and international channels in the included server list.'],
 ['أفلام ومسلسلات ومحتوى عند الطلب حسب المكتبة المتاحة.','Movies, series, and on-demand content from the available library.'],
 ['اللغة والتعليق والجودة تختلف باختلاف القناة والبث.','Language, commentary, and quality vary by channel and stream.'],
 ['تحتاج تطبيقًا متوافقًا واتصال إنترنت مناسبًا؛ رسوم التطبيق إن وجدت منفصلة.','A compatible app and suitable internet connection are required; any app fees are separate.'],
 ['بيانات اشتراك مستقلة؛ مدة الاشتراك والضمان كما في الباقة.','Separate subscription credentials; see the plan for term and warranty.']
];
entries['king-cobra-iptv']=iptv;entries['dino-iptv']=iptv;
const planText={
 'Cursor Pro لمدة شهر':'Cursor Pro for one month',
 'سعر العرض 300ج':'Offer price: EGP 300',
 'متاح للطلب لمدة 48 ساعة فقط':'Available to order for 48 hours only',
 'خصم 50% على قيمة الفاتورة الأساسية للإنترنت المنزلي':'50% off the base home-internet bill',
 'مثال توضيحي: فاتورة أساسية 300 جنيه تصبح 150 جنيه، بتوفير 150 جنيه':'Example: an EGP 300 base bill becomes EGP 150, saving EGP 150',
 'مثال توضيحي: فاتورة أساسية 500 جنيه تصبح 250 جنيه، بتوفير 250 جنيه':'Example: an EGP 500 base bill becomes EGP 250, saving EGP 250',
 'سعر شراء كود التفعيل: 700 جنيه':'Activation code purchase price: EGP 700',
 'التفعيل على اشتراكك الحالي المؤهل في WE Gold':'Activate on your current eligible WE Gold subscription',
 'مدة الخصم المعلنة من المتجر: مدى الحياة وفق شروط العرض':'Store-advertised discount term: lifetime, subject to offer terms',
 'تستلم كود التفعيل وتعليمات استخدامه بعد تأكيد الأهلية والطلب':'Receive the code and instructions after eligibility and order confirmation',
 '75,000 كلمة لإعادة صياغة النص شهريًا':'75,000 rewriting words per month',
 '200,000 كلمة للكتابة بالذكاء الاصطناعي شهريًا':'200,000 AI-writing words per month',
 '300,000 كلمة لفحص الذكاء الاصطناعي شهريًا':'300,000 AI-detection words per month',
 '50,000 كلمة لفحص التشابه شهريًا':'50,000 similarity-checking words per month',
 'تدقيق لغوي وإعادة صياغة':'Proofreading and paraphrasing',
 '1,000 Credit شهريًا للاستخدام داخل الخدمة':'1,000 credits per month within the service',
 '1,000 Credit شهريًا للحساب الرئيسي فقط':'1,000 credits per month for the main account only',
 '5 دعوات عائلية إضافية لاستخدام Gemini':'5 additional family invitations for Gemini',
 '50 عملية إعادة صياغة يوميًا':'50 rewrites per day',
 '50 فحص AI يوميًا':'50 AI checks per day',
 '150 عملية إعادة صياغة يوميًا':'150 rewrites per day',
 '150 فحص AI يوميًا':'150 AI checks per day',
 'حتى 5,000 كلمة للعملية':'Up to 5,000 words per operation',
 'Ghost 5.2 Pro وLegacy':'Ghost 5.2 Pro and Legacy'
};

// Related products share capabilities, not commercial terms or credit quotas.
entries['lovable-lite']=entries['lovable-pro'];
entries['gemini-coursera-bundle']=entries.coursera;
const vpn=[
 ['تشفير اتصال الإنترنت عبر خوادم VPN المدعومة.','Encrypt internet traffic through supported VPN servers.'],
 ['تغيير عنوان IP الظاهر للمواقع حسب الخادم المختار.','Change the IP address visible to websites through your chosen server.'],
 ['تقليل تعرض بيانات الاتصال على شبكات Wi-Fi العامة.','Reduce exposure of network traffic on public Wi-Fi.'],
 ['عدد الأجهزة والمواقع المتاحة حسب نوع الحساب والباقة.','Device limits and locations depend on account and plan.']
];
for(const id of ['surfshark','nordvpn','proton-vpn','hma-vpn','expressvpn'])entries[id]=vpn;

function list(product,plan,english,translate){
 const language=english?1:0;
 const curated=entries[product.id]?.map(row=>row[language])||[];
 let base=curated;
 // Preserve detailed, product-specific copy already maintained in the catalogue.
 if(!curated.length)base=english?(product.featuresEn||product.features?.map(x=>translate(x,'feature'))||[]):(product.features||[]);
 // Higgsfield's tiers have different capabilities; do not mix annual and Starter copy.
 if(product.id==='higgsfield-pro')return english?(plan.featuresEn||[]):(plan.features||[]);
 const extras=english?(plan.featuresEn||plan.features?.map(x=>planText[x]||translate(x,'feature'))||[]):(plan.features||[]);
 // Detailed catalogue additions remain authoritative for these products.
 if(['runway-pro','gemini-coursera-bundle'].includes(product.id)){
   const maintained=english?(product.featuresEn||[]):(product.features||[]);
   base=[...base,...maintained];
 }
 const credits=plan.credits?(english?'Plan allowance: ':'رصيد الباقة: ')+translate(plan.credits,'credits'):null;
 // A quota already stated in the selected plan should appear only once.
 const items=[...base,...extras];
 if(product.id==='windows-pro'){
   items.push(english?'Hardware requirements apply to virtualization and encryption features.':'مزايا التشفير والأنظمة الافتراضية تتطلب جهازًا يدعمها.');
   if(/Windows 10/.test(plan.name))items.push(english?'Standard Windows 10 support ended on 14 October 2025; activation does not extend security support.':'انتهى الدعم القياسي لـWindows 10 في 14 أكتوبر 2025؛ التفعيل لا يمدد الدعم الأمني.');
 }

 if(credits&&!items.some(x=>x.includes(String(plan.credits))))items.push(credits);
 return [...new Set(items.map(x=>String(x||'').trim()).filter(Boolean))];
}
window.MasterProductFeatures={entries,list};
})();
