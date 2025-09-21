
let lastCall = 0;

/**
 * ghFetch(url, { signal, token }?)
 * - throttle بسيط لتفادي الـ abuse
 * - يضيف هيدرز GitHub الأساسية
 * - يستخدم التوكن لو صالح، ولو 401 يجرب بدون توكن
 */
export async function ghFetch(url, { signal, token } = {}) {
  // --- throttle: على الأقل ~450ms بين الطلبات + jitter ---
  const now = Date.now();
  const wait = Math.max(0, 450 - (now - lastCall));
  const jitter = Math.random() * 200;
  if (wait + jitter > 0) {
    await new Promise((r) => setTimeout(r, wait + jitter));
  }
  lastCall = Date.now();

  const baseHeaders = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    // مفيش User-Agent — المتصفح هيمنعه
  };

  // أضف التوكن فقط لو valid
  const hasValidToken =
    typeof token === 'string' &&
    token.trim().length > 0 &&
    token.trim().toLowerCase() !== 'undefined' &&
    token.trim().toLowerCase() !== 'null';

  const headers = { ...baseHeaders };
  if (hasValidToken) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  // محاولة أولى
  let res = await fetch(url, { signal, headers });

  // لو 401 وكنّا مرسلين Authorization — جرّب مرة ثانية بدون توكن
  if (res.status === 401 && headers.Authorization) {
    const { Authorization, ...noAuth } = headers;
    res = await fetch(url, { signal, headers: noAuth });
  }

  // 403: غالبًا rate/abuse
  if (res.status === 403) {
    const text = await res.text().catch(() => '');
    const err = new Error(
      'GitHub API 403 (rate/abuse). جرّب تقلل الطلبات أو استخدم Token صالح.\n' +
      text.slice(0, 250)
    );
    err.code = 403;
    throw err;
  }

  if (!res.ok) {
    let msg = `GitHub API error: ${res.status} ${res.statusText}`;
    try {
      const t = await res.text();
      if (t) msg += ` — ${t}`;
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}
