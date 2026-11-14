const form = document.querySelector('#lookup');
const key = document.querySelector('#key');
const submit = document.querySelector('#submit');
const refresh = document.querySelector('#refresh');
const closeButton = document.querySelector('#close');
const status = document.querySelector('#status');
const mailbox = document.querySelector('#mailbox');
const messages = document.querySelector('#messages');
const count = document.querySelector('#count');
const updated = document.querySelector('#updated');
const reveal = document.querySelector('#reveal');
const providerHelp = document.querySelector('#provider-help');
let busy = false;
let lastRequest = 0;
let progressTimer = null;

reveal.addEventListener('click', () => {
  key.type = key.type === 'password' ? 'text' : 'password';
  reveal.setAttribute('aria-label', key.type === 'password' ? 'إظهار المفتاح' : 'إخفاء المفتاح');
  reveal.textContent = key.type === 'password' ? 'إظهار' : 'إخفاء';
});

function node(tag, value, className) {
  const element = document.createElement(tag);
  if (value != null) element.textContent = String(value);
  if (className) element.className = className;
  return element;
}

function showStatus(message, type = 'error') {
  status.textContent = message || '';
  status.dataset.kind = type;
  if (type !== 'error') providerHelp.hidden = true;
}

function setBusy(value) {
  busy = value;
  submit.disabled = value;
  refresh.disabled = value;
  key.readOnly = value;
  form.setAttribute('aria-busy', String(value));
  submit.textContent = value ? 'جارٍ الاتصال بصندوق الرسائل…' : 'عرض الرسائل ←';
  refresh.textContent = value ? 'جارٍ التحديث…' : '↻ تحديث';
}

function renderMessages(items) {
  const fragment = document.createDocumentFragment();
  if (!items.length) {
    fragment.append(node('p', 'صندوقك فارغ حاليًا. لو منتظر كود جديد، اطلب إرساله ثم اضغط «تحديث».', 'empty-message'));
  }
  for (const item of items) {
    const message = node('article', null, 'message');
    message.append(node('p', item.from || 'مرسل غير معروف', 'meta'));
    message.append(node('h3', item.subject || 'رسالة بدون عنوان'));
    if (item.receivedDateTime) {
      const date = new Date(item.receivedDateTime);
      if (!Number.isNaN(date.getTime())) message.append(node('p', date.toLocaleString('ar-EG'), 'meta'));
    }
    if (item.code) {
      const codeWrap = node('div', null, 'code');
      const codeText = node('strong', item.code);
      codeText.dir = 'ltr';
      const copy = node('button', 'نسخ الكود');
      copy.type = 'button';
      copy.setAttribute('aria-label', 'نسخ كود التحقق');
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(String(item.code));
          copy.textContent = 'تم النسخ ✓';
        } catch {
          copy.textContent = 'حدد الكود وانسخه';
        }
      });
      codeWrap.append(codeText, copy);
      message.append(codeWrap);
    }
    const details = document.createElement('details');
    details.append(node('summary', 'عرض تفاصيل الرسالة'));
    details.append(node('pre', item.bodyText || 'لا يوجد نص للرسالة'));
    message.append(details);
    fragment.append(message);
  }
  messages.replaceChildren(fragment);
  count.textContent = '(' + items.length + ')';
  updated.textContent = 'آخر تحديث: ' + new Date().toLocaleTimeString('ar-EG');
  mailbox.hidden = false;
}

async function lookup(event) {
  event?.preventDefault();
  if (busy) return;
  if (!form.reportValidity()) return;
  if (Date.now() - lastRequest < 5000) {
    showStatus('انتظر 5 ثوانٍ على الأقل بين كل محاولة وتانية.', 'info');
    return;
  }
  lastRequest = Date.now();
  const previousResults = !mailbox.hidden;
  showStatus(previousResults ? 'جارٍ تحديث الرسائل بدون مسح النتائج الحالية…' : 'جارٍ الاتصال بالمصدر والتحقق من المفتاح…', 'info');
  setBusy(true);
  const started = Date.now();
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    const seconds = Math.floor((Date.now() - started) / 1000);
    if (seconds >= 7 && seconds < 17) {
      showStatus('بنفتح صندوق الرسائل ونتأكد من الاتصال بالمصدر…', 'info');
    } else if (seconds >= 17 && seconds < 36) {
      showStatus('الاتصال بالمصدر مستمر، والرسائل السابقة محفوظة لو بتعمل تحديث…', 'info');
    } else if (seconds >= 36) {
      showStatus('مصدر الرسائل متأخر في الرد. لو الاتصال فشل هنوضح السبب بدل الانتظار من غير نتيجة.', 'info');
    }
  }, 2500);
  try {
    const response = await fetch('/api/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key.value.trim() }),
      cache: 'no-store',
      signal: AbortSignal.timeout(90000)
    });
    if (!response.headers.get('Content-Type')?.includes('application/json')) {
      throw new Error('خدمة الاستلام لا تستجيب بشكل صحيح حاليًا.');
    }
    const data = await response.json();
    if (!response.ok || !data.ok) {
      const err = new Error(data.message || 'تعذّر استلام الرسائل من المصدر.');
      err.providerCode = data.code || '';
      throw err;
    }
    renderMessages(Array.isArray(data.messages) ? data.messages : []);
    showStatus(data.messages?.length ? 'تم تحديث صندوق الرسائل بنجاح.' : 'الاتصال بالمصدر نجح، لكن لا توجد رسائل حاليًا.', 'success');
  } catch (error) {
    const timeout = error.name === 'TimeoutError' || error.name === 'AbortError';
    showStatus(timeout ? 'مصدر الرسائل تأخر في الاستجابة. حاول التحديث بعد قليل.' : (error.message || 'حصل خطأ في الاتصال. حاول مجددًا.'), 'error');
    providerHelp.hidden = !['SOURCE_RESTRICTED','SOURCE_FAILURE','SOURCE_TIMEOUT','SOURCE_ERROR','SOURCE_INCOMPLETE'].includes(error.providerCode);
    // Keep the previously fetched messages visible when a refresh fails.
    if (!previousResults) mailbox.hidden = true;
  } finally {
    clearInterval(progressTimer);
    progressTimer = null;
    setBusy(false);
  }
}

form.addEventListener('submit', lookup);
refresh.addEventListener('click', () => lookup());
closeButton.addEventListener('click', () => {
  messages.replaceChildren();
  mailbox.hidden = true;
  key.value = '';
  showStatus('');
  key.focus();
});
