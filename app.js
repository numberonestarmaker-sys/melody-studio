// ══════════════════════════════════════════
// MELODY STUDIO PRO — app.js
// ══════════════════════════════════════════

// ── AMBIENT BACKGROUND ──
(function () {
  const cv = document.getElementById('bg');
  const c = cv.getContext('2d');
  const orbs = [];
  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  resize();
  addEventListener('resize', resize);
  const hues = [255, 280, 190, 240];
  for (let i = 0; i < 4; i++) {
    orbs.push({
      x: Math.random() * 800, y: Math.random() * 1400,
      r: 180 + Math.random() * 250,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      h: hues[i], a: 0.038 + Math.random() * 0.022
    });
  }
  function frame() {
    c.clearRect(0, 0, cv.width, cv.height);
    orbs.forEach(o => {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -o.r) o.x = cv.width + o.r; else if (o.x > cv.width + o.r) o.x = -o.r;
      if (o.y < -o.r) o.y = cv.height + o.r; else if (o.y > cv.height + o.r) o.y = -o.r;
      const g = c.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `hsla(${o.h},75%,55%,${o.a})`);
      g.addColorStop(1, 'transparent');
      c.fillStyle = g;
      c.beginPath(); c.arc(o.x, o.y, o.r, 0, Math.PI * 2); c.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
})();

// ── PAGE NAVIGATION ──
function go(id, idx) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('on'));
  document.getElementById('pg-' + id).classList.add('on');
  document.getElementById('bn' + idx).classList.add('on');
  document.querySelector('.scroll').scrollTop = 0;
}
document.querySelectorAll('.bn').forEach((btn, i) => {
  btn.addEventListener('click', () => go(btn.dataset.page, i));
});

// ── TOAST ──
function toast(msg, dur = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

// ── AUDIO ENGINE ──
const AC_ = window.AudioContext || window.webkitAudioContext;
let ac = null;
function getAC() {
  if (!ac) ac = new AC_();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function pianoNote(freq, dur = 1.0, vel = 0.38) {
  try {
    const c = getAC(), t = c.currentTime;
    const mg = c.createGain();
    mg.connect(c.destination);
    mg.gain.setValueAtTime(0, t);
    mg.gain.linearRampToValueAtTime(vel, t + 0.012);
    mg.gain.exponentialRampToValueAtTime(vel * 0.42, t + 0.18);
    mg.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.45);
    const dl = c.createDelay(0.4); dl.delayTime.value = 0.18;
    const fb = c.createGain(); fb.gain.value = 0.13;
    const dw = c.createGain(); dw.gain.value = 0.09;
    dl.connect(fb); fb.connect(dl); dl.connect(dw); dw.connect(c.destination);
    [[1, 0.4, 'triangle'], [2, 0.17, 'sine'], [3, 0.07, 'sine'], [4, 0.03, 'sine']].forEach(([f, g, tp]) => {
      const o = c.createOscillator(), og = c.createGain();
      o.connect(og); og.connect(mg); og.connect(dl);
      o.type = tp; o.frequency.value = freq * f;
      o.detune.value = (Math.random() - 0.5) * 3;
      og.gain.value = g; o.start(t); o.stop(t + dur + 0.6);
    });
  } catch (e) { /* ignore */ }
}

// ── MUSIC THEORY ──
const NM = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const RFA = ['دو', 'دو#', 'ر', 'ر#', 'می', 'فا', 'فا#', 'سل', 'سل#', 'لا', 'لا#', 'سی'];
const MODES = {
  minor: { fa: 'مینور — غمگین', iv: [0, 2, 3, 5, 7, 8, 10] },
  harmMinor: { fa: 'مینور هارمونیک — جادویی', iv: [0, 2, 3, 5, 7, 8, 11] },
  major: { fa: 'ماژور — شاد', iv: [0, 2, 4, 5, 7, 9, 11] },
  dorian: { fa: 'دورین — بلوز', iv: [0, 2, 3, 5, 7, 9, 10] },
  phrygian: { fa: 'فریژین — تاریک', iv: [0, 1, 3, 5, 7, 8, 10] },
  pentatMin: { fa: 'پنتاتونیک مینور', iv: [0, 3, 5, 7, 10] }
};
let root = 'A', mode = 'minor';
function nf(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function f2m(f) { return Math.round(12 * Math.log2(f / 440) + 69); }
function smi() {
  const r = NM.indexOf(root);
  return new Set(MODES[mode].iv.map(iv => (r + iv) % 12));
}
function near(m) {
  const s = smi();
  if (s.has(m % 12)) return m;
  for (let d = 1; d <= 6; d++) {
    if (s.has((m - d + 12) % 12)) return m - d;
    if (s.has((m + d) % 12)) return m + d;
  }
  return m;
}
function mn(m) { return NM[m % 12] + (Math.floor(m / 12) - 1); }

// ── STATE ──
let rawMel = [], aiMel = [], tempo = 90;
let playing = false, playType = null, playTmr = null, playBeat = 0;
let recording = false, mStream = null, analyser = null, recAF = null, recIv = null;
let lastMidi = -1, lastNoteT = 0;
const HOLD_MS = 320;

// ── PITCH DETECTION (autocorrelation, more permissive thresholds) ──
let lastRMS = 0; // exposed for debug display
function detectPitch(buf, sr) {
  const N = buf.length;
  let rms = 0;
  for (let i = 0; i < N; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / N);
  lastRMS = rms;
  // Lowered threshold significantly — was 0.009, now 0.003
  if (rms < 0.003) return -1;

  // Normalize buffer to improve autocorrelation on quiet signals
  let maxAbs = 0;
  for (let i = 0; i < N; i++) { const a = Math.abs(buf[i]); if (a > maxAbs) maxAbs = a; }
  const norm = maxAbs > 0 ? buf.map(v => v / maxAbs) : buf;

  const ac2 = new Float32Array(N);
  for (let lag = 0; lag < N; lag++) {
    let s = 0;
    for (let i = 0; i < N - lag; i++) s += norm[i] * norm[i + lag];
    ac2[lag] = s;
  }
  let start = -1;
  for (let i = 1; i < N; i++) { if (ac2[i] < 0) { start = i; break; } }
  if (start < 0) start = 1; // fallback instead of bailing out
  let bestLag = start, bestVal = ac2[start];
  for (let i = start; i < N; i++) { if (ac2[i] > bestVal) { bestVal = ac2[i]; bestLag = i; } }
  // Lowered threshold significantly — was 0.003 (of raw signal), now relative to normalized peak
  if (bestVal < ac2[0] * 0.15) return -1;
  const y1 = ac2[bestLag - 1] || 0, y2 = ac2[bestLag], y3 = ac2[bestLag + 1] || 0;
  const d = 2 * y2 - y1 - y3;
  const shift = d ? ((y3 - y1) / (2 * d) * 0.5) : 0;
  const freq = sr / (bestLag + shift);
  if (!isFinite(freq) || freq <= 0) return -1;
  return freq;
}

// ── MIC PERMISSION & RECORDING ──
function checkEnvironment() {
  const isSecure = window.isSecureContext;
  const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const notice = document.getElementById('permNotice');
  const okNotice = document.getElementById('okNotice');
  if (!isSecure) {
    notice.classList.remove('hidden');
    okNotice.classList.add('hidden');
    document.getElementById('permMsg').innerHTML =
      'این صفحه باید روی <b>HTTPS</b> باز شود (مثل GitHub Pages).<br>اگر از فایل محلی باز کردی، این محدودیت امنیتی مرورگر است.';
    setTopStatus('⚠ HTTPS لازم است');
    return false;
  }
  if (!hasMedia) {
    notice.classList.remove('hidden');
    okNotice.classList.add('hidden');
    document.getElementById('permMsg').textContent = 'مرورگر شما از ضبط صدا پشتیبانی نمی‌کند.';
    setTopStatus('⚠ پشتیبانی نمی‌شود');
    return false;
  }
  notice.classList.add('hidden');
  okNotice.classList.remove('hidden');
  setTimeout(() => okNotice.classList.add('hidden'), 4000);
  return true;
}

async function toggleRec() {
  try { getAC(); } catch (e) { /* ignore */ }

  if (recording) { stopRec(); return; }

  if (!checkEnvironment()) {
    toast('❌ محیط اجرا مناسب نیست — راهنما را ببین', 3500);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      }
    });
    mStream = stream;
    document.getElementById('permNotice').classList.add('hidden');

    const c = getAC();
    const src = c.createMediaStreamSource(stream);
    analyser = c.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);

    recording = true; lastMidi = -1; lastNoteT = Date.now();
    const t0 = Date.now();
    document.getElementById('micBtn').classList.add('rec');
    document.getElementById('micBtn').textContent = '⏹';
    document.getElementById('micLbl').innerHTML = '<b style="color:#e84060">● ضبط جاری است...</b>';
    setTopStatus('<b style="color:#e84060">● ضبط</b>');

    recIv = setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      document.getElementById('recT').textContent =
        String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }, 500);

    recLoop();
    toast('🎤 ضبط شروع شد');
  } catch (e) {
    console.error('Mic error:', e);
    let msg = '❌ دسترسی به میکروفون رد شد';
    if (e.name === 'NotAllowedError') msg = '❌ اجازه میکروفون را در تنظیمات مرورگر بده';
    else if (e.name === 'NotFoundError') msg = '❌ میکروفون پیدا نشد';
    toast(msg, 4000);
    document.getElementById('permNotice').classList.remove('hidden');
    document.getElementById('permMsg').textContent = msg;
  }
}

function stopRec() {
  recording = false;
  cancelAnimationFrame(recAF);
  clearInterval(recIv);
  if (mStream) mStream.getTracks().forEach(t => t.stop());
  mStream = null; analyser = null;
  document.getElementById('micBtn').classList.remove('rec');
  document.getElementById('micBtn').textContent = '🎤';
  document.getElementById('micLbl').innerHTML = '<b>لمس کن و شروع کن</b>';
  document.getElementById('recT').textContent = '';
  document.getElementById('pmN').textContent = '—';
  document.getElementById('pmHz').textContent = '—';
  document.getElementById('pmFl').style.width = '0%';
  document.getElementById('pmSc').textContent = '';
  setTopStatus(rawMel.length + ' نت ضبط شد');
  updateBtns();
  if (rawMel.length > 0) toast('✓ ' + rawMel.length + ' نت ضبط شد');
}

function recLoop() {
  if (!recording || !analyser) return;
  const N = analyser.fftSize;
  const fb = new Float32Array(N), bb = new Uint8Array(N);
  analyser.getFloatTimeDomainData(fb);
  analyser.getByteTimeDomainData(bb);
  drawWave(bb);
  const freq = detectPitch(fb, getAC().sampleRate);
  // Widened range: was 60-1800, now 50-2000 to catch more voice types
  if (freq > 50 && freq < 2000) {
    const midi = f2m(freq);
    // Widened MIDI range: was 36-96, now 28-100
    if (midi >= 28 && midi <= 100) {
      const inScale = smi().has(midi % 12);
      document.getElementById('pmN').textContent = mn(midi);
      document.getElementById('pmHz').textContent = freq.toFixed(1) + ' Hz';
      document.getElementById('pmFl').style.width = Math.max(0, Math.min(100, (freq - 80) / 1400 * 100)) + '%';
      const sc = document.getElementById('pmSc');
      sc.textContent = inScale ? '✓ گام' : '✗ فالش';
      sc.className = 'psc ' + (inScale ? 'y' : 'n');
      const now = Date.now();
      if (midi !== lastMidi && now - lastNoteT > HOLD_MS) {
        lastMidi = midi; lastNoteT = now;
        rawMel.push({ midi, name: mn(midi), freq: nf(midi), inScale });
        aiMel = [];
        pianoNote(nf(midi), 0.45, 0.26);
        flashKey(midi, 'lit', 260);
        renderVis();
        updateBtns();
        setTopStatus(rawMel.length + ' نت ضبط شد');
      }
    } else {
      // Frequency detected but outside playable range — show why nothing is captured
      document.getElementById('pmN').textContent = '⚠';
      document.getElementById('pmHz').textContent = freq.toFixed(0) + ' Hz (خارج محدوده)';
    }
  } else {
    document.getElementById('pmN').textContent = '—';
    document.getElementById('pmHz').textContent = 'صدا: ' + (lastRMS * 1000).toFixed(1);
    lastMidi = -1;
  }
  recAF = requestAnimationFrame(recLoop);
}

// ── WAVEFORM ──
function drawWave(buf) {
  const cv = document.getElementById('wC');
  if (!cv.parentElement) return;
  const ctx = cv.getContext('2d');
  cv.width = cv.parentElement.clientWidth || 300;
  cv.height = 56;
  ctx.clearRect(0, 0, cv.width, cv.height);
  const W = cv.width, H = cv.height, N = buf.length;
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(196,181,253,.55)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < N; i++) {
    const x = i / N * W, y = (1 - (buf[i] + 128) / 256) * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  document.getElementById('wIdle').style.display = 'none';
}

// ── PIANO ──
const PKEYS = [];
for (let o = 3; o <= 5; o++) {
  NM.forEach((n, i) => PKEYS.push({ name: n, midi: o * 12 + i, oct: o, black: n.includes('#') }));
}
function buildPiano() {
  const sm = smi();
  const el = document.getElementById('piano');
  el.innerHTML = '';
  const whites = PKEYS.filter(k => !k.black);
  const ww = 34, gap = 2;
  el.style.width = (whites.length * (ww + gap) - gap) + 'px';
  const bMap = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };
  whites.forEach((k, wi) => {
    const d = document.createElement('div');
    d.className = 'wk' + (sm.has(k.midi % 12) ? ' sn' : '');
    d.id = 'pk' + k.midi;
    d.style.cssText = `left:${wi * (ww + gap)}px;width:${ww}px`;
    if (k.name === 'C') {
      const lb = document.createElement('span');
      lb.className = 'wk-l';
      lb.textContent = 'C' + k.oct;
      d.appendChild(lb);
    }
    const play = () => { pianoNote(nf(k.midi)); flashKey(k.midi, 'lit', 280); };
    d.addEventListener('touchstart', e => { e.preventDefault(); play(); }, { passive: false });
    d.addEventListener('mousedown', play);
    el.appendChild(d);
  });
  PKEYS.filter(k => k.black).forEach(k => {
    const off = whites.filter(w => w.oct < k.oct).length;
    const gi = bMap[k.midi % 12];
    if (gi === undefined) return;
    const d = document.createElement('div');
    d.className = 'bk' + (sm.has(k.midi % 12) ? ' sn' : '');
    d.id = 'pk' + k.midi;
    d.style.left = (off + gi) * (ww + gap) + ww - 11 + 'px';
    const play = () => { pianoNote(nf(k.midi)); flashKey(k.midi, 'lit', 280); };
    d.addEventListener('touchstart', e => { e.preventDefault(); play(); }, { passive: false });
    d.addEventListener('mousedown', play);
    el.appendChild(d);
  });
}
function flashKey(midi, cls, dur) {
  const el = document.getElementById('pk' + midi);
  if (!el) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), dur);
}

// ── VISUALIZER ──
function renderVis(hl = -1) {
  const v = document.getElementById('vis');
  const src = aiMel.length ? aiMel : rawMel;
  if (!src.length) { v.innerHTML = '<span class="vis-hint">🎤 ابتدا ضبط کن</span>'; return; }
  v.innerHTML = '';
  const isAI = aiMel.length > 0;
  src.forEach((n, i) => {
    const r = Math.max(0, Math.min(1, (n.midi - 48) / 24));
    const d = document.createElement('div');
    d.className = 'vn';
    const remove = () => {
      if (isAI) { aiMel.splice(i, 1); rawMel.splice(i, 1); } else { rawMel.splice(i, 1); }
      aiMel = []; renderVis(); renderCmp(); updateBtns();
    };
    d.addEventListener('touchstart', e => { e.preventDefault(); remove(); }, { passive: false });
    d.addEventListener('click', remove);
    const bar = document.createElement('div');
    bar.className = 'vb ' + (isAI ? 'ai' : 'raw') + (i === hl ? ' cur' : '');
    bar.style.height = (6 + r * 58) + 'px';
    const lbl = document.createElement('div');
    lbl.className = 'vlb';
    lbl.textContent = n.name.replace(/\d/, '');
    d.appendChild(bar); d.appendChild(lbl);
    v.appendChild(d);
  });
}
function renderCmp() {
  const cs = document.getElementById('cmpSec');
  if (!aiMel.length) { cs.style.display = 'none'; return; }
  cs.style.display = 'grid';
  const rb = document.getElementById('rBars'), ab = document.getElementById('aBars');
  rb.innerHTML = ''; ab.innerHTML = '';
  const mk = (n, c) => {
    const b = document.createElement('div');
    b.className = 'mb ' + c;
    b.style.height = ((n.midi - 48) / 24 * 20 + 3) + 'px';
    return b;
  };
  rawMel.forEach(n => rb.appendChild(mk(n, 'r')));
  aiMel.forEach(n => ab.appendChild(mk(n, 'a')));
}

// ── PLAYBACK ──
function doPlay(type) {
  if (playing && playType === type) { stopPlay(); return; }
  stopPlay();
  const src = type === 'raw' ? rawMel : aiMel;
  if (!src.length) return;
  playing = true; playType = type; playBeat = 0;
  const rb = document.getElementById('pRaw'), ab = document.getElementById('pAi');
  if (type === 'raw') { rb.textContent = '■ توقف'; rb.classList.add('stop'); }
  else { ab.textContent = '■ توقف'; ab.classList.add('stop'); }
  const ms = 60000 / tempo;
  function tick() {
    const n = src[playBeat];
    pianoNote(n.freq, ms / 1000 * 0.9, 0.44);
    flashKey(n.midi, 'lit', Math.min(ms * 0.8, 350));
    renderVis(playBeat);
    playBeat = (playBeat + 1) % src.length;
    playTmr = setTimeout(tick, ms);
  }
  tick();
}
function stopPlay() {
  clearTimeout(playTmr);
  playing = false; playType = null; playBeat = 0;
  document.getElementById('pRaw').textContent = '▶ خام';
  document.getElementById('pRaw').classList.remove('stop');
  document.getElementById('pAi').textContent = '▶ AI';
  document.getElementById('pAi').classList.remove('stop');
  renderVis();
}

// ── AI HELPERS ──
function aiLoading(id, msg) {
  document.getElementById(id).innerHTML =
    `<div class="aibdg">✦ AI</div><div class="thk"><div class="dot"></div><div class="dot"></div><div class="dot"></div><span style="margin-right:6px;font-size:10px">${msg}</span></div>`;
}
function fmtAI(t) {
  return t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}
function parseMelody(text) {
  const m = text.match(/JSON_MELODY:\[(.+?)\]/);
  if (!m) return null;
  try {
    return JSON.parse('[' + m[1] + ']').map(n => ({
      midi: n.midi, name: mn(n.midi), freq: nf(n.midi), inScale: smi().has(n.midi % 12)
    }));
  } catch { return null; }
}
async function callAI(prompt, maxTokens = 1000) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.map(b => b.text || '').join('') || '';
}
function disableAIBtns(v) {
  ['aiFixBtn', 'aiFullBtn', 'varBtn'].forEach(id => document.getElementById(id).disabled = v);
}

// ── AI: FIX OUT-OF-SCALE NOTES ──
async function runFix() {
  if (rawMel.length < 2) return;
  stopPlay(); disableAIBtns(true);
  aiLoading('aiBox', 'اصلاح فالشی‌ها...');
  const sm = smi();
  const noteList = rawMel.map((n, i) => `${i + 1}. ${n.name} (${n.inScale ? '✓' : '✗ فالش'})`).join('\n');
  const suggested = rawMel.map(n => near(n.midi));
  const prompt = `آهنگساز و معلم موسیقی هستی.
گام: ${root} ${MODES[mode].fa} | نت‌های گام: ${[...sm].map(m => NM[m]).join(', ')}
ملودی کاربر:
${noteList}
کوتاه و گرم فارسی بگو: چند نت فالش بود، چه تغییری دادی، یک نکته الهام‌بخش.
از **bold** برای کلمات مهم استفاده کن.
آخرین خط فقط این باشد:
JSON_MELODY:[${suggested.map(m => `{"midi":${m},"name":"${mn(m)}"}`).join(',')}]`;
  try {
    const text = await callAI(prompt, 700);
    const parsed = parseMelody(text);
    if (parsed) {
      aiMel = parsed; renderVis(); renderCmp();
      document.getElementById('pAi').disabled = false;
      document.getElementById('dlMA').disabled = false;
      document.getElementById('dlWA').disabled = false;
    }
    document.getElementById('aiBox').innerHTML =
      `<div class="aibdg">✦ اصلاح شد</div>${fmtAI(text.replace(/JSON_MELODY:\[.+?\]/g, '').trim())}`;
    toast('✓ ملودی اصلاح شد');
  } catch (e) {
    document.getElementById('aiBox').innerHTML = `<div class="aibdg">خطا</div><span style="color:#e84060">${e.message}</span>`;
  }
  disableAIBtns(false); updateBtns();
}

// ── AI: GENERATE FULL SONG ──
async function runFull() {
  if (rawMel.length < 2) return;
  stopPlay(); disableAIBtns(true);
  aiLoading('aiBox', 'ساخت آهنگ کامل...');
  const sm = smi();
  const prompt = `آهنگساز حرفه‌ای هستی. ملودی کاربر: ${rawMel.map(n => n.name).join(' - ')}
گام: ${root} ${MODES[mode].fa} | نت‌های مجاز: ${[...sm].map(m => NM[m]).join(',')}
یک آهنگ زیبا و کامل با ۱۶ تا ۲۰ نت بساز. فقط نت‌های گام. اوج و فرود داشته باشد. از موتیف کاربر الهام بگیر.
توضیح کوتاه فارسی با **bold**.
آخرین خط فقط:
JSON_MELODY:[{"midi":X,"name":"Y"},...]
میدی بین ۴۸ تا ۸۴ باشد.`;
  try {
    const text = await callAI(prompt, 1100);
    const parsed = parseMelody(text);
    if (parsed) {
      aiMel = parsed; renderVis(); renderCmp();
      document.getElementById('pAi').disabled = false;
      document.getElementById('dlMA').disabled = false;
      document.getElementById('dlWA').disabled = false;
    }
    document.getElementById('aiBox').innerHTML =
      `<div class="aibdg">🎼 آهنگ کامل</div>${fmtAI(text.replace(/JSON_MELODY:\[.+?\]/g, '').trim())}`;
    toast('🎼 آهنگ کامل ساخته شد');
  } catch (e) {
    document.getElementById('aiBox').innerHTML = `<div class="aibdg">خطا</div><span style="color:#e84060">${e.message}</span>`;
  }
  disableAIBtns(false); updateBtns();
}

// ── AI: 10 SIMILAR VARIATIONS ──
let allVars = [], varPlayIdx = -1, varTmr = null, varBeat = 0;
async function runVars() {
  if (rawMel.length < 2) return;
  stopPlay();
  document.getElementById('varBtn').disabled = true;
  aiLoading('varBox', 'تولید ۱۰ ملودی مشابه...');
  document.getElementById('vgrid').innerHTML = '';
  const sm = smi();
  const origNotes = rawMel.map(n => n.name).join(' - ');
  const origMidis = rawMel.map(n => n.midi).join(',');
  const prompt = `آهنگساز هستی. ملودی اصلی کاربر: ${origNotes}
میدی‌های اصلی: ${origMidis}
گام: ${root} ${MODES[mode].fa} | نت‌های گام: ${[...sm].map(m => NM[m]).join(',')}

دقیقاً ۱۰ ملودی مشابه بساز که:
- هر کدام ۸ تا ۱۴ نت
- همان خط ملودیک و روح و حال ملودی اصلی را حفظ کند
- فقط تغییرات کوچک: یک نت جابجا، ریتم کمی متفاوت، یا پایان متفاوت
- فقط نت‌های همان گام
- بدون سبک خاص بیرونی — فقط شبیه ملودی خود کاربر
- هر کدام یک label فارسی کوتاه مثل «پایان بالاتر» یا «یک نت اضافه» داشته باشد

فقط JSON خالص برگردان، هیچ متن دیگری نباشد:
[{"label":"...","notes":[{"midi":X,"name":"Y"},...]}]`;
  try {
    const text = await callAI(prompt, 2200);
    const clean = text.replace(/```json|```/g, '').trim();
    let arr;
    try { arr = JSON.parse(clean); }
    catch {
      const m = text.match(/\[[\s\S]+\]/);
      if (m) arr = JSON.parse(m[0]); else throw new Error('پاسخ قابل تحلیل نبود');
    }
    arr = arr.filter(v => v.notes && v.notes.length > 0).slice(0, 10);
    if (!arr.length) throw new Error('هیچ ملودی‌ای تولید نشد');
    allVars = arr;
    renderVarCards();
    document.getElementById('varBox').innerHTML =
      `<div class="aibdg">🎲 ${arr.length} نسخه</div>پخش کن، اگر دوست داشتی «✓» را بزن.`;
    toast('🎲 ' + arr.length + ' ملودی مشابه آماده شد');
  } catch (e) {
    document.getElementById('varBox').innerHTML = `<div class="aibdg">خطا</div><span style="color:#e84060">${e.message}</span>`;
  }
  document.getElementById('varBtn').disabled = rawMel.length < 2;
}
function renderVarCards() {
  const grid = document.getElementById('vgrid');
  grid.innerHTML = '';
  allVars.forEach((v, i) => {
    const color = `hsl(${240 + i * 13},60%,65%)`;
    const card = document.createElement('div');
    card.className = 'vc';
    card.id = 'vc' + i;
    const bars = v.notes.slice(0, 12).map(n => {
      const h = 2 + Math.max(0, (n.midi - 48) / 24) * 20;
      return `<div class="vcb" style="height:${h}px;background:${color};opacity:.7"></div>`;
    }).join('');
    card.innerHTML = `
      <div class="vct"><span class="vcn" style="color:${color}">#${i + 1}</span><span class="vcl">${v.label || ''}</span></div>
      <div class="vcbrs">${bars}</div>
      <div class="vcbtns">
        <button class="vcbtn" id="vp${i}">▶</button>
        <button class="vcbtn pk" id="vk${i}">✓</button>
      </div>`;
    grid.appendChild(card);
    card.querySelector('#vp' + i).addEventListener('click', () => playVar(i));
    card.querySelector('#vk' + i).addEventListener('click', () => pickVar(i));
  });
}
function playVar(i) {
  clearTimeout(varTmr);
  document.querySelectorAll('[id^=vp]').forEach(b => { b.textContent = '▶'; b.classList.remove('pl'); });
  if (varPlayIdx === i) { varPlayIdx = -1; return; }
  varPlayIdx = i; varBeat = 0;
  document.getElementById('vp' + i).textContent = '■';
  document.getElementById('vp' + i).classList.add('pl');
  const notes = allVars[i].notes, ms = 60000 / tempo;
  function tick() {
    pianoNote(nf(notes[varBeat].midi), ms / 1000 * 0.9, 0.4);
    flashKey(notes[varBeat].midi, 'lit', Math.min(ms * 0.8, 300));
    varBeat = (varBeat + 1) % notes.length;
    varTmr = setTimeout(tick, ms);
  }
  tick();
}
function pickVar(i) {
  clearTimeout(varTmr); varPlayIdx = -1;
  document.querySelectorAll('[id^=vp]').forEach(b => { b.textContent = '▶'; b.classList.remove('pl'); });
  aiMel = allVars[i].notes.map(n => ({ midi: n.midi, name: mn(n.midi), freq: nf(n.midi), inScale: smi().has(n.midi % 12) }));
  renderVis(); renderCmp(); updateBtns();
  document.querySelectorAll('.vc').forEach((c, ci) => c.classList.toggle('sel', ci === i));
  toast('✓ ملودی #' + (i + 1) + ' انتخاب شد');
  go('mel', 1);
}

// ── MIDI EXPORT ──
function varLenEnc(v) {
  if (v < 128) return [v];
  const b = [];
  let vv = v;
  while (vv > 0) { b.unshift(vv & 0x7F); vv >>= 7; }
  for (let i = 0; i < b.length - 1; i++) b[i] |= 0x80;
  return b;
}
function buildMIDI(notes) {
  const tpb = 480, upb = Math.round(60000000 / tempo);
  const hdr = [0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (tpb >> 8) & 0xFF, tpb & 0xFF];
  const ev = [];
  ev.push(0, 0xFF, 0x51, 3, (upb >> 16) & 0xFF, (upb >> 8) & 0xFF, upb & 0xFF);
  notes.forEach(n => {
    ev.push(...varLenEnc(0), 0x90, n.midi & 0x7F, 88);
    ev.push(...varLenEnc(tpb), 0x80, n.midi & 0x7F, 0);
  });
  ev.push(0, 0xFF, 0x2F, 0);
  const tl = ev.length;
  return new Uint8Array([...hdr, 0x4D, 0x54, 0x72, 0x6B, (tl >> 24) & 0xFF, (tl >> 16) & 0xFF, (tl >> 8) & 0xFF, tl & 0xFF, ...ev]);
}
function dlMIDI(type) {
  const src = type === 'raw' ? rawMel : aiMel;
  if (!src.length) return;
  const blob = new Blob([buildMIDI(src)], { type: 'audio/midi' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'melody-' + type + '.mid';
  a.click();
  toast('⬇ MIDI دانلود شد');
}

// ── WAV EXPORT ──
async function dlWAV(type) {
  const src = type === 'raw' ? rawMel : aiMel;
  if (!src.length) return;
  toast('⏳ در حال تولید WAV...', 3500);
  const sr = 44100, spn = 60 / tempo, tot = src.length * spn + 1.5;
  const off = new OfflineAudioContext(2, Math.ceil(tot * sr), sr);
  src.forEach((n, i) => {
    const t0 = i * spn, dur = spn * 0.88;
    [[1, 0.36, 'triangle'], [2, 0.15, 'sine'], [3, 0.06, 'sine']].forEach(([f, g, tp]) => {
      const o = off.createOscillator(), og = off.createGain();
      o.connect(og); og.connect(off.destination);
      o.type = tp; o.frequency.value = n.freq * f;
      og.gain.setValueAtTime(0, t0);
      og.gain.linearRampToValueAtTime(g, t0 + 0.01);
      og.gain.exponentialRampToValueAtTime(g * 0.25, t0 + 0.2);
      og.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.35);
      o.start(t0); o.stop(t0 + dur + 0.45);
    });
  });
  const buf = await off.startRendering();
  const wav = audioBufferToWav(buf);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'melody-' + type + '.wav';
  a.click();
  toast('⬇ WAV دانلود شد');
}
function audioBufferToWav(buf) {
  const nc = buf.numberOfChannels, sr = buf.sampleRate, len = buf.length;
  const out = new ArrayBuffer(44 + len * nc * 2);
  const dv = new DataView(out);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); dv.setUint32(4, 36 + len * nc * 2, true); ws(8, 'WAVE');
  ws(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, nc, true); dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * nc * 2, true); dv.setUint16(32, nc * 2, true); dv.setUint16(34, 16, true);
  ws(36, 'data'); dv.setUint32(40, len * nc * 2, true);
  let p = 44;
  for (let i = 0; i < len; i++) {
    for (let ch = 0; ch < nc; ch++) {
      const s = Math.max(-1, Math.min(1, buf.getChannelData(ch)[i]));
      dv.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      p += 2;
    }
  }
  return out;
}

// ── UTILS ──
function setTopStatus(html) { document.getElementById('tbSt').innerHTML = html; }
function updateBtns() {
  const has2 = rawMel.length >= 2;
  document.getElementById('aiFixBtn').disabled = !has2;
  document.getElementById('aiFullBtn').disabled = !has2;
  document.getElementById('varBtn').disabled = !has2;
  document.getElementById('pRaw').disabled = rawMel.length < 1;
  document.getElementById('pAi').disabled = aiMel.length < 1;
  document.getElementById('dlMR').disabled = rawMel.length < 1;
  document.getElementById('dlWR').disabled = rawMel.length < 1;
  document.getElementById('dlMA').disabled = aiMel.length < 1;
  document.getElementById('dlWA').disabled = aiMel.length < 1;
}
function clearAll() {
  stopPlay(); stopRec();
  rawMel = []; aiMel = []; allVars = [];
  renderVis(); renderCmp();
  document.getElementById('vgrid').innerHTML = '';
  document.getElementById('aiBox').innerHTML = '<div class="aibdg">✦ AI</div><div style="color:var(--ghost)">بعد از ضبط یک دکمه بزن...</div>';
  document.getElementById('varBox').innerHTML = '<div class="aibdg">🎲</div><div style="color:var(--ghost)">ملودی ضبط کن سپس بزن...</div>';
  setTopStatus('آماده');
  updateBtns();
  toast('پاک شد');
}

// ── CHIPS INIT ──
function mkChips(containerId, items, labels, onPick, defaultVal) {
  const g = document.getElementById(containerId);
  g.innerHTML = '';
  items.forEach((v, i) => {
    const b = document.createElement('button');
    b.className = 'chip' + (v === defaultVal ? ' on' : '');
    b.textContent = labels[i];
    const pick = () => {
      onPick(v);
      clearAll();
      buildPiano();
      g.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      b.classList.add('on');
    };
    b.addEventListener('touchstart', e => { e.preventDefault(); pick(); }, { passive: false });
    b.addEventListener('click', pick);
    g.appendChild(b);
  });
}

// ── BIND EVENTS ──
document.getElementById('micBtn').addEventListener('click', toggleRec);
document.getElementById('pRaw').addEventListener('click', () => doPlay('raw'));
document.getElementById('pAi').addEventListener('click', () => doPlay('ai'));
document.getElementById('btnClear').addEventListener('click', clearAll);
document.getElementById('aiFixBtn').addEventListener('click', runFix);
document.getElementById('aiFullBtn').addEventListener('click', runFull);
document.getElementById('varBtn').addEventListener('click', runVars);
document.getElementById('dlMR').addEventListener('click', () => dlMIDI('raw'));
document.getElementById('dlMA').addEventListener('click', () => dlMIDI('ai'));
document.getElementById('dlWR').addEventListener('click', () => dlWAV('raw'));
document.getElementById('dlWA').addEventListener('click', () => dlWAV('ai'));

// ── INIT ──
window.addEventListener('load', () => {
  checkEnvironment();
  // Register service worker if available (for PWA / offline support)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* ignore if sw.js missing */ });
  }
});

mkChips('rootChips', ROOTS, ROOTS.map((r, i) => r + ' ' + RFA[i]), v => { root = v; }, 'A');
mkChips('modeChips', Object.keys(MODES), Object.values(MODES).map(m => m.fa), v => { mode = v; }, 'minor');
buildPiano();
updateBtns();
