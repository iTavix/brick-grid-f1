/* Brick Grid F1 — campionato F1 2026 con minifig LEGO */
(() => {
const F = window.F1;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const view = $('#view');

/* ---------- dati derivati ---------- */
const D = Object.fromEntries(F.drivers.map(d => [d.id, d]));
const TM = F.teamMeta;
const done = F.races.filter(r => r.results.length);
const lastRace = done[done.length - 1];
const nextRace = F.races.find(r => !r.results.length);
const lastStand = F.dstand[F.dstand.length - 1];
const lastCStand = F.cstand[F.cstand.length - 1];

const GP = {
  albert_park:["GP d'Australia","🇦🇺","Australia"], shanghai:["GP di Cina","🇨🇳","Cina"], suzuka:["GP del Giappone","🇯🇵","Giappone"],
  miami:["GP di Miami","🇺🇸","Stati Uniti"], villeneuve:["GP del Canada","🇨🇦","Canada"], monaco:["GP di Monaco","🇲🇨","Monaco"],
  catalunya:["GP di Barcellona","🇪🇸","Spagna"], red_bull_ring:["GP d'Austria","🇦🇹","Austria"], silverstone:["GP di Gran Bretagna","🇬🇧","Regno Unito"],
  spa:["GP del Belgio","🇧🇪","Belgio"], hungaroring:["GP d'Ungheria","🇭🇺","Ungheria"], zandvoort:["GP d'Olanda","🇳🇱","Paesi Bassi"],
  monza:["GP d'Italia","🇮🇹","Italia"], madring:["GP di Spagna","🇪🇸","Spagna"], baku:["GP dell'Azerbaigian","🇦🇿","Azerbaigian"],
  sepang:["GP del Bahrain a Sepang","🇲🇾","Malesia"], marina_bay:["GP di Singapore","🇸🇬","Singapore"], americas:["GP degli Stati Uniti","🇺🇸","Stati Uniti"],
  rodriguez:["GP di Città del Messico","🇲🇽","Messico"], interlagos:["GP del Brasile","🇧🇷","Brasile"], vegas:["GP di Las Vegas","🇺🇸","Stati Uniti"],
  losail:["GP del Qatar","🇶🇦","Qatar"], yas_marina:["GP di Abu Dhabi","🇦🇪","Emirati Arabi Uniti"]
};
const NAT = {British:'🇬🇧',Italian:'🇮🇹',Monegasque:'🇲🇨',Dutch:'🇳🇱',Australian:'🇦🇺',French:'🇫🇷',Spanish:'🇪🇸',German:'🇩🇪',Canadian:'🇨🇦',Thai:'🇹🇭',
  'New Zealander':'🇳🇿',Argentine:'🇦🇷',Argentinian:'🇦🇷',Brazilian:'🇧🇷',Finnish:'🇫🇮',Mexican:'🇲🇽',Japanese:'🇯🇵',American:'🇺🇸',Danish:'🇩🇰',Swedish:'🇸🇪',Chinese:'🇨🇳'};
const SESS = {FirstPractice:'Prove libere 1',SecondPractice:'Prove libere 2',ThirdPractice:'Prove libere 3',SprintQualifying:'Qualifiche Sprint',Sprint:'Sprint',Qualifying:'Qualifiche',Race:'Gara'};
const gpName = r => GP[r.circuitId]?.[0] || r.name;
const gpFlag = r => GP[r.circuitId]?.[1] || '🏁';
const gpCountry = r => GP[r.circuitId]?.[2] || r.country;

const fmtDate = (d, o) => new Intl.DateTimeFormat('it-IT', {timeZone:'Europe/Rome', ...o}).format(d);
const when = (date, time) => new Date(date + 'T' + (time || '12:00:00Z'));
const nf = n => (Math.round(n * 10) / 10).toLocaleString('it-IT');
const km = n => n.toLocaleString("it-IT", {minimumFractionDigits: 3});

function teamOf(id) { for (let i = done.length - 1; i >= 0; i--) { const x = done[i].results.find(r => r.d === id); if (x) return x.c; } return null; }
const teamCol = c => TM[c]?.col || '#888';
const teamName = c => TM[c]?.n || c;
const standOf = id => lastStand.find(s => s[0] === id);

const STAT = {};
F.drivers.forEach(d => STAT[d.id] = {wins:0, pod:0, poles:0, fl:0, dnf:0, starts:0, best:99, dotd:0, sprintW:0, pts:0});
done.forEach(r => {
  r.results.forEach(x => { const s = STAT[x.d]; s.starts++; if (x.p === 1) s.wins++; if (x.p <= 3) s.pod++; if (x.fl) s.fl++;
    if (!/^(Finished|Lapped|\+)/.test(x.s) && x.s !== 'Finished') s.dnf++; if (x.p < s.best && /^\d+$/.test(x.pt)) s.best = x.p; });
  if (r.quali[0]) STAT[r.quali[0].d].poles++;
  if (r.sprint[0]) STAT[r.sprint[0].d].sprintW++;
  if (r.dotd && STAT[r.dotd]) STAT[r.dotd].dotd++;
});
lastStand.forEach(s => { if (STAT[s[0]]) STAT[s[0]].pts = s[1]; });

/* titolo matematico: il vantaggio del primo supera i punti ancora in palio (GP 25 + sprint 8 per pilota; 43 + 15 per squadra) */
function clinch(stands, perGP, perSprint) {
  for (let i = 0; i < stands.length; i++) { const left = F.races.slice(i + 1), max = left.length * perGP + left.filter(r => r.sessions.Sprint).length * perSprint;
    const st = stands[i]; if (st[0][1] - st[1][1] > max) return {id: st[0][0], round: i + 1, race: F.races[i]}; }
  return null;
}
const CHAMP = clinch(F.dstand, 25, 8), CCHAMP = clinch(F.cstand, 43, 15);
const champBadge = (txt = 'Campione del mondo') => `<span class="champ">🏆 ${txt}</span>`;

/* ---------- minifig generata (per piloti senza set e per il tuo pilota) ---------- */
const HAIR = {
  short: c => `<path d="M68 52c0-18 12-24 32-24s32 6 32 24v6c-6-8-14-10-22-10h-22c-8 0-14 3-20 10z" fill="${c}"/>`,
  curly: c => `<g fill="${c}">${[70,82,94,106,118,130].map((x,i)=>`<circle cx="${x}" cy="${36+(i%2)*4}" r="10"/>`).join('')}<rect x="64" y="38" width="72" height="14" rx="7"/></g>`,
  long: c => `<path d="M66 54c0-20 14-26 34-26s34 6 34 26v40h-10V58H76v36H66z" fill="${c}"/>`,
  spiky: c => `<path d="M66 54 72 26l8 14 8-18 8 16 8-18 8 18 8-16 6 16 6 18z" fill="${c}"/>`,
  none: () => ''
};
const HELM = {
  stripe: (a,b) => `<path d="M126 150a34 34 0 0 1 60-14l-8 6a26 26 0 0 0-46 10z" fill="${b}"/>`,
  star: (a,b) => `<path d="m160 126 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="${b}"/>`,
  flame: (a,b) => `<path d="M124 158c10-4 14-18 26-18-6 6 0 10 8 6-4 8 6 10 14 2 0 10-8 18-22 20-12 2-22-2-26-10z" fill="${b}"/>`,
  split: (a,b) => `<path d="M156 116a34 34 0 0 1 0 68z" fill="${b}"/>`
};
function makeFig(o) {
  const skin = o.skin || '#F7C844', suit = o.suit || '#E10600', s2 = o.suit2 || '#111', h1 = o.helm || suit, h2 = o.helm2 || '#fff';
  const face = o.face === 'focus'
    ? `<path d="M84 60h10M106 60h10" stroke="#1b1b1b" stroke-width="3" stroke-linecap="round"/><path d="M92 86h16" stroke="#1b1b1b" stroke-width="3" stroke-linecap="round"/>`
    : `<path d="M90 82q10 9 20 0" stroke="#1b1b1b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const num = esc(String(o.num ?? '').slice(0,2)), code = esc(String(o.code || '').slice(0,3).toUpperCase());
  return `<svg viewBox="0 0 200 286" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="minifig">
  <ellipse cx="100" cy="280" rx="62" ry="5" fill="rgba(0,0,0,.18)"/>
  <rect x="54" y="214" width="44" height="58" rx="4" fill="${suit}"/><rect x="102" y="214" width="44" height="58" rx="4" fill="${suit}"/>
  <rect x="54" y="258" width="44" height="14" rx="3" fill="${s2}"/><rect x="102" y="258" width="44" height="14" rx="3" fill="${s2}"/>
  <rect x="52" y="198" width="96" height="18" rx="4" fill="${s2}"/>
  <path d="M64 110h72l14 90H50z" fill="${suit}"/>
  <path d="M64 110h18l-20 90H50z" fill="${s2}" opacity=".9"/><path d="M118 110h18l14 90h-12z" fill="${s2}" opacity=".9"/>
  <text x="100" y="168" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-weight="900" font-size="34" fill="#fff" stroke="${s2}" stroke-width="1.5">${num}</text>
  <text x="114" y="193" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-weight="800" font-size="11" fill="#fff">${code}</text>
  <path d="M66 116 40 178" stroke="${suit}" stroke-width="20" stroke-linecap="round"/>
  <circle cx="38" cy="190" r="11" fill="none" stroke="${skin}" stroke-width="7"/>
  <path d="M134 116 150 150" stroke="${suit}" stroke-width="20" stroke-linecap="round"/>
  <g><circle cx="156" cy="150" r="34" fill="${h1}"/>${(HELM[o.helmStyle]||HELM.stripe)(h1,h2)}
   <path d="M128 146a30 22 0 0 1 56 0v6h-56z" fill="#16212e" opacity=".88"/><path d="M132 144a24 16 0 0 1 22-10" stroke="#9fd2ff" stroke-width="3" fill="none" opacity=".7"/></g>
  <rect x="90" y="98" width="20" height="14" fill="${skin}"/>
  <rect x="86" y="18" width="28" height="14" rx="3" fill="${skin}"/>
  <rect x="66" y="28" width="68" height="72" rx="18" fill="${skin}"/>
  ${(HAIR[o.hair]||HAIR.short)(o.hairCol || '#4a2a12')}
  <ellipse cx="89" cy="68" rx="4.5" ry="6" fill="#1b1b1b"/><ellipse cx="111" cy="68" rx="4.5" ry="6" fill="#1b1b1b"/>
  <circle cx="90.5" cy="66" r="1.5" fill="#fff"/><circle cx="112.5" cy="66" r="1.5" fill="#fff"/>${face}
</svg>`;
}
function figFor(id) {
  const d = D[id]; const c = teamOf(id);
  if (F.figs.includes(d.code)) return `<img src="assets/fig_${d.code}.webp" alt="Minifig ${esc(d.last)}" loading="lazy">`;
  return makeFig({suit: teamCol(c), suit2:'#15151a', helm: teamCol(c), helm2:'#fff', num:d.num, code:d.code, hair:'short', hairCol:'#1d1d1d'});
}
const avatar = id => `<div class="av">${figFor(id)}</div>`;
const helmetFor = id => F.figs.includes(D[id].code) ? `assets/helmet_${D[id].code}.webp?v=2` : null;

/* ---------- stato utente ---------- */
const store = {
  get() { try { return JSON.parse(localStorage.getItem('bg_me')) || {}; } catch { return {}; } },
  set(v) { try { localStorage.setItem('bg_me', JSON.stringify(v)); } catch {} }
};
let ME = Object.assign({list: [], active: 0, fav: null}, store.get());
const saveMe = () => store.set(ME);

/* ---------- navigazione ---------- */
let tab = 'home', timers = [];
const clearTimers = () => { timers.forEach(t => t && t.clear ? t.clear() : clearInterval(t)); timers = []; };
document.querySelectorAll('.tabbar button').forEach(b => b.onclick = () => go(b.dataset.tab));
function go(t) {
  tab = t; clearTimers();
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  ({home, standings, races, tracks, me})[t]();
  window.scrollTo({top: 0});
  requestAnimationFrame(() => requestAnimationFrame(() => view.classList.add('in')));
  try { history.replaceState(null, '', '#' + t); } catch {}
}
function setView(html, title) { view.classList.remove('in'); view.innerHTML = html; $('#topTitle').textContent = title; }
addEventListener('scroll', () => $('#topbar').classList.toggle('show', scrollY > 60), {passive: true});
document.addEventListener('click', e => {
  const t = e.target.closest('[data-open]'); if (!t) return;
  const [k, v] = t.dataset.open.split(':'); open(k, v);
});

/* ---------- sheet ---------- */
const sheetWrap = $('#sheetWrap'), sheetBody = $('#sheetBody');
function openSheet(html) {
  sheetBody.innerHTML = html; sheetBody.scrollTop = 0;
  sheetWrap.classList.add('open'); sheetWrap.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { sheetBody.classList.add('in'); sheetBody.querySelectorAll('.podium').forEach(p => p.classList.add('play')); }, 180);
}
function closeSheet() { sheetWrap.classList.remove('open'); sheetWrap.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; sheetBody.classList.remove('in'); }
$('#sheetClose').onclick = closeSheet; $('#sheetDim').onclick = closeSheet;
addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
(() => { let y0 = null; const sh = $('#sheet');
  sh.addEventListener('touchstart', e => { y0 = sheetBody.scrollTop <= 0 ? e.touches[0].clientY : null; }, {passive: true});
  sh.addEventListener('touchmove', e => { if (y0 === null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) { sh.style.transition = 'none'; sh.style.transform = `translateY(${dy}px)`; } }, {passive: true});
  sh.addEventListener('touchend', e => { if (y0 === null) return; const dy = e.changedTouches[0].clientY - y0; sh.style.transition = ''; sh.style.transform = ''; if (dy > 120) closeSheet(); y0 = null; });
})();
function open(k, v) { ({driver: driverSheet, team: teamSheet, race: raceSheet, track: trackSheet})[k]?.(v); }

/* ---------- componenti ---------- */
function podiumHTML(r) {
  const top = r.results.slice(0, 3); if (top.length < 3) return '';
  const order = [top[1], top[0], top[2]], cls = ['p2', 'p1', 'p3'], lab = ['2', '1', '3'];
  return `<div class="podium">${order.map((x, i) => `<div class="pod ${cls[i]}" data-open="driver:${x.d}">
    <div class="f-wrap" style="width:100%;display:flex;justify-content:center">${F.figs.includes(D[x.d].code) ? `<img class="f" src="assets/fig_${D[x.d].code}.webp" alt="">` : `<div class="f" style="width:80%">${figFor(x.d)}</div>`}</div>
    <div class="nm">${esc(D[x.d].last)}</div><div class="blk">${lab[i]}</div></div>`).join('')}</div>`;
}
function countdownHTML(id) { return `<div class="cd" id="${id}"><div><b>--</b><span>giorni</span></div><div><b>--</b><span>ore</span></div><div><b>--</b><span>min</span></div><div><b>--</b><span>sec</span></div></div>`; }
function runCountdown(id, target) {
  const tick = () => { const el = document.getElementById(id); if (!el) return; let s = Math.max(0, (target - Date.now()) / 1000);
    const v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), Math.floor(s % 60)];
    el.querySelectorAll('b').forEach((b, i) => b.textContent = String(v[i]).padStart(2, '0')); };
  tick(); timers.push(setInterval(tick, 1000));
}
function countUp(el, to, dur = 1100) { if (!el) return; const t0 = performance.now(); const f = t => { if (!el.isConnected) return; const k = Math.min(1, (t - t0) / dur); el.textContent = nf(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
function pointsChart(ids, w = 340, h = 150) {
  const n = F.dstand.length; const series = ids.map(id => F.dstand.map(st => (st.find(s => s[0] === id) || [0, 0])[1]));
  const max = Math.max(10, ...series.flat()); const X = i => 30 + i * (w - 40) / (n - 1), Y = v => h - 22 - v / max * (h - 40);
  const grid = [0, .5, 1].map(f => `<line x1="30" x2="${w - 10}" y1="${Y(max * f)}" y2="${Y(max * f)}" stroke="var(--sep)"/><text x="24" y="${Y(max * f) + 4}" text-anchor="end" font-size="10" fill="var(--label2)">${Math.round(max * f)}</text>`).join('');
  const lines = series.map((s, k) => { const col = k === 0 ? teamCol(teamOf(ids[0])) : 'var(--label3)'; const d = s.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('');
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${k ? 2 : 3}" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"><animate attributeName="stroke-dashoffset" from="1" to="0" dur="1.4s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1"/></path>`; }).join('');
  const lbl = [1, Math.ceil(n / 2), n].map(i => `<text x="${X(i - 1)}" y="${h - 6}" text-anchor="middle" font-size="10" fill="var(--label2)">R${i}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}">${grid}${lines}${lbl}</svg>`;
}
function globeSVG(lat, lng) {
  const R = 54, c = 60, lat0 = lat * Math.PI / 180, lon0 = lng * Math.PI / 180; let p = '';
  const proj = (la, lo) => { la *= Math.PI / 180; lo *= Math.PI / 180; const cosc = Math.sin(lat0) * Math.sin(la) + Math.cos(lat0) * Math.cos(la) * Math.cos(lo - lon0);
    return cosc < 0 ? null : [c + R * Math.cos(la) * Math.sin(lo - lon0), c - R * (Math.cos(lat0) * Math.sin(la) - Math.sin(lat0) * Math.cos(la) * Math.cos(lo - lon0))]; };
  const line = pts => { let d = '', pen = false; pts.forEach(q => { if (!q) { pen = false; return; } d += (pen ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); pen = true; }); return d; };
  for (let lo = -180; lo < 180; lo += 30) { const a = []; for (let la = -90; la <= 90; la += 5) a.push(proj(la, lo)); p += line(a); }
  for (let la = -60; la <= 60; la += 30) { const a = []; for (let lo = -180; lo <= 180; lo += 5) a.push(proj(la, lo)); p += line(a); }
  return `<svg class="globe" viewBox="0 0 120 120"><defs><radialGradient id="gg" cx="35%" cy="30%"><stop offset="0" stop-color="#5aa9ff"/><stop offset="1" stop-color="#0a3a7a"/></radialGradient></defs>
  <circle cx="60" cy="60" r="${R}" fill="url(#gg)"/><path d="${p}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width=".7"/>
  <circle cx="60" cy="60" r="5" fill="#E10600" stroke="#fff" stroke-width="2"/><circle cx="60" cy="60" r="5" fill="none" stroke="#E10600" stroke-width="2"><animate attributeName="r" values="5;18" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite"/></circle></svg>`;
}
const posTxt = x => x.pt == null ? String(x.p) : /^\d+$/.test(x.pt) ? x.pt : ({R:'RIT',D:'SQ',W:'NP',N:'NC',E:'ESC',F:'NQ'}[x.pt] || x.pt);
const statusIt = s => s === 'Finished' ? '' : s === 'Lapped' ? 'Doppiato' : /^\+\d+ Laps?$/.test(s) ? s.replace('Laps','giri').replace('Lap','giro') : s === 'Retired' ? 'Ritirato' : s === 'Disqualified' ? 'Squalificato' : s === 'Did not start' ? 'Non partito' : s;

/* ---------- HOME ---------- */
function home() {
  const leader = lastStand[0], second = lastStand[1], L = D[leader[0]], lc = teamOf(leader[0]);
  const carTeams = lastCStand.slice(0, 4).map(c => c[0]);
  const dotdCount = {}; done.forEach(r => r.dotd && (dotdCount[r.dotd] = (dotdCount[r.dotd] || 0) + 1));
  const dotdTop = Object.entries(dotdCount).sort((a, b) => b[1] - a[1]);
  const fav = ME.fav && D[ME.fav] ? ME.fav : null;
  const target = nextRace ? when(nextRace.date, nextRace.time) : null;
  setView(`
  <div class="ltitle"><div><p>${fmtDate(new Date(), {weekday:'long', day:'numeric', month:'long'})}</p><h1>F1 2026</h1></div><span class="badge red">Round ${done.length}/${F.races.length}</span></div>

  <div class="fcar teamring" id="teamCar"><canvas role="img" aria-label="Carosello delle squadre: scorri e tocca per aprire la squadra"></canvas>
    <button class="fc-prev glass" aria-label="Squadra precedente">‹</button><button class="fc-next glass" aria-label="Squadra successiva">›</button></div>
  <div class="fcinfo"><div id="tcName"></div><button class="btn sec" id="tcOpen">Apri squadra ›</button></div>

  <div class="sec-h"><h2>${CHAMP ? 'Campione 2026' : 'Leader del mondiale'}</h2>${CHAMP ? `<span class="small muted">titolo dal round ${CHAMP.round}</span>` : ''}</div>
  <div class="card leader tap ${CHAMP ? 'is-champ' : ''}" data-open="driver:${leader[0]}">
    <div class="bg" style="background:linear-gradient(135deg, ${teamCol(lc)} 0%, color-mix(in srgb, ${teamCol(lc)} 45%, #000) 100%)"></div>
    ${CHAMP ? '<div class="confetti">' + Array.from({length: 18}, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:-${(i * .53) % 4}s;background:${['#F2C45A', '#fff', '#E10600', '#00D7B6'][i % 4]}"></i>`).join('') + '</div>' : ''}
    <div class="txt"><div>${CHAMP ? champBadge() : ''}<div class="small" style="opacity:.85;margin-top:${CHAMP ? 6 : 0}px">${NAT[L.nat] || ''} ${esc(teamName(lc))}</div><div style="font-size:24px;font-weight:800">${esc(L.first)} ${esc(L.last)}</div></div>
      <div><div class="big num" id="leadPts">0</div><div class="small" style="opacity:.85">punti · +${nf(leader[1] - second[1])} su ${esc(D[second[0]].last)}</div></div></div>
    <div class="fig">${figFor(leader[0])}</div>
  </div>

  ${lastRace ? `<div class="sec-h"><h2>Ultimo GP</h2><button data-open="race:${lastRace.round}">Risultati</button></div>
  <div class="card tap" data-open="race:${lastRace.round}">
    <div class="row" style="padding:16px 16px 0"><div class="flag">${gpFlag(lastRace)}</div><div class="grow"><div class="rnd">Round ${lastRace.round} · ${fmtDate(when(lastRace.date, lastRace.time), {day:'numeric', month:'long'})}</div><div style="font-weight:700;font-size:19px">${gpName(lastRace)}</div></div></div>
    <div id="homePod">${podiumHTML(lastRace)}</div>
    ${lastRace.dotd ? `<div class="row" style="padding:12px 16px;border-top:.5px solid var(--sep)"><img src="${helmetFor(lastRace.dotd) || ''}" alt="" style="width:40px"><div class="grow"><div class="small muted">Pilota del giorno (voto dei fan)</div><b>${esc(D[lastRace.dotd].first)} ${esc(D[lastRace.dotd].last)}</b></div><span class="chip">⭐ DOTD</span></div>` : ''}
  </div>` : ''}

  ${nextRace ? `<div class="sec-h"><h2>Prossimo GP</h2><button data-open="track:${nextRace.round}">Dettagli</button></div>
  <div class="card pad tap nextgp" data-open="track:${nextRace.round}" style="color:#fff;background:linear-gradient(135deg,#1b1d24,#3a0d0c 120%)">
    <div class="nxmap">${trackMap(nextRace.circuitId, 'nx')}</div>
    <div class="row" style="position:relative"><div class="flag">${gpFlag(nextRace)}</div><div class="grow"><div class="rnd" style="color:rgba(255,255,255,.7)">Round ${nextRace.round} · ${esc(nextRace.locality)}</div><div style="font-weight:800;font-size:21px">${gpName(nextRace)}</div>
    <div class="small" style="opacity:.8">Gara: ${fmtDate(target, {weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'})} (ora italiana)</div></div></div>
    ${countdownHTML('cdHome')}
    <div id="nextQuali"></div>
  </div>
  ${GRIDIMG[nextRace.round] ? `<div class="sec-h"><h2>Griglia di partenza</h2><span class="small muted">tocca per ingrandire</span></div>
  <div class="gridimgs">${GRIDIMG[nextRace.round].map((src, i) => `<button class="gridimg tap" data-grid="${nextRace.round}:${i}"><img src="${src}" alt="Griglia di partenza ${gpName(nextRace)}, posizioni ${i ? '11–22' : '1–10'}" loading="lazy"><span>${i ? '11 – 22' : '1 – 10'}</span></button>`).join('')}</div>` : ''}` : ''}

  <div class="sec-h"><h2>News F1</h2><button id="newsAll">Tutte</button></div>
  <div class="list" id="newsHome">${newsList(newsItems().slice(0, 5))}</div>

  <div class="sec-h"><h2>Piloti del giorno</h2><span class="small muted">voto dei fan · ${done.filter(r => r.dotd).length} GP</span></div>
  <div class="hscroll">${dotdTop.map(([id, n], i) => `<button class="card hcard tap" data-open="driver:${id}"><img src="${helmetFor(id) || ''}" alt="Casco ${esc(D[id].last)}" style="animation-delay:-${i * .7}s"><b>${esc(D[id].last)}</b><div class="small muted">${n} ${n > 1 ? 'volte' : 'volta'}</div></button>`).join('')}</div>

  <div class="sec-h"><h2>Il tuo preferito</h2><button onclick="document.querySelector('[data-tab=me]').click()">${fav ? 'Cambia' : 'Scegli'}</button></div>
  <div>
    ${favCard(fav)}
  </div>
  <p class="foot">Dati ufficiali F1 2026 (Jolpica/Ergast) aggiornati dopo il ${gpName(lastRace)}. Pilota del giorno: voto dei fan su F1.com. Minifig e auto: LEGO® Speed Champions. Progetto amatoriale non affiliato a LEGO o Formula 1.</p>
  `, 'F1 2026');
  countUp($('#leadPts'), leader[1]);
  setTimeout(() => $('#homePod')?.firstElementChild?.classList.add('play'), 250);
  if (target) runCountdown('cdHome', target);
  if (nextRace) liveQuali(nextRace).then(q => { const el = $('#nextQuali'); if (el && q && q.length) el.innerHTML = qualiTop3(q); });
  $('#newsAll').onclick = newsSheet;
  liveNews().then(ok => { const el = $('#newsHome'); if (ok && el) el.innerHTML = newsList(newsItems().slice(0, 5)); });
  // carosello 3D delle 11 squadre, in ordine di classifica costruttori (gira da solo: pausa + scatto)
  const tids = lastCStand.map(s => s[0]); let shownT = tids[0];
  favCarousel($('#teamCar'), tids, 0, t => { shownT = t; const cs = lastCStand.find(s => s[0] === t), ds = lastStand.filter(s => s[4][s[4].length - 1] === t).slice(0, 2).map(s => D[s[0]].last).join(' · ');
    $('#tcName').innerHTML = `<div class="small" style="color:${teamCol(t)};font-weight:800">P${cs[2]} costruttori${CCHAMP && CCHAMP.id === t ? ' · 🏆 campione' : ''}</div><div class="fcn"><b>${esc(teamName(t))}</b></div><div class="small muted">${nf(cs[1])} punti · ${esc(ds)}</div>`; },
    t => open('team', t), 'team');
  $('#tcOpen').onclick = () => open('team', shownT);
}
/* ---------- striscia animata a scene ---------- */
const VIDEO360 = ['ferrari', 'red_bull', 'mclaren', 'mercedes', 'aston_martin', 'williams', 'alpine', 'haas', 'audi', 'cadillac'];
/* video 360: fermo sul primo fotogramma, parte solo al tocco */
function v360HTML(num, cls) { return `<div class="vbox ${cls}"><video src="video/${num}_360.mp4" poster="video/${num}_poster.webp" muted playsinline preload="none"></video><span class="vplay"><i>▶</i> Giro a 360°</span></div>`; }
function stopVid(box) { const v = box.querySelector('video'); v.pause(); box.classList.remove('playing'); }
function bindVid(root) { root.querySelectorAll('.vbox').forEach(b => { const v = b.querySelector('video');
  b.onclick = e => { e.stopPropagation(); if (b.classList.contains('playing')) return stopVid(b); v.currentTime = 0; b.classList.add('playing'); v.play().catch(() => b.classList.remove('playing')); };
  v.onended = () => b.classList.remove('playing'); }); }
const bestDriverOf = t => lastStand.find(s => s[4][s[4].length - 1] === t)?.[0];
const shortTeam = t => teamName(t).replace(' Racing', '');
function miniHead(id) { const h = helmetFor(id); return h ? `<img src="${h}" alt="">` : `<span class="mh">${figFor(id)}</span>`; }
function stripHTML(carTeams) {
  const top5 = lastStand.slice(0, 5), leadTeam = lastCStand[0][0], vt = VIDEO360.includes(leadTeam) ? leadTeam : VIDEO360[0];
  const topTeams = lastCStand.slice(0, 5).map(c => c[0]);
  const grid = lastStand.filter(s => s[4][s[4].length - 1] && TM[s[4][s[4].length - 1]]).map(s => s[0]);
  const chip = id => `<span class="gchip" style="--c:${teamCol(teamOf(id))}">${miniHead(id)}<b>${esc(D[id].code)}</b>${esc(D[id].last)}</span>`;
  const half = Math.ceil(grid.length / 2), rowA = grid.slice(0, half), rowB = grid.slice(half);
  const scenes = [
    {k: 'race', t: 'Lotta per il mondiale', s: carTeams.map(shortTeam).join(' · '), html: `<div class="sky"></div>
      <div class="track" id="track"><div class="tk tk-a"></div><div class="tk tk-b"></div><div class="tmid"></div>
        ${Array.from({length: 8}, (_, i) => `<i class="tspeed" style="top:${12 + i * 10}%;width:${14 + (i * 37) % 22}%;animation-duration:${.45 + (i % 3) * .18}s;animation-delay:-${i * .23}s"></i>`).join('')}</div>
      ${carTeams.map((t, i) => { const d = bestDriverOf(t); return `<div class="car" data-i="${i}" style="--c:${teamCol(t)}"><span class="csh"></span>
        ${d ? `<span class="ctag">${miniHead(d)}${esc(D[d].last)}</span>` : ''}<img src="assets/car_${TM[t].img}.webp" alt="Auto ${esc(teamName(t))}"><i></i></div>`; }).join('')}`},
    {k: 'top', t: "Vista dall'alto", s: 'Classifica costruttori · top 5', html: `<div class="asphalt">${topTeams.map((t, i) => `<div class="tlane" style="--i:${i}">
      <span class="tlab"><b>P${i + 1}</b> ${esc(shortTeam(t))}</span><img class="tcar" src="assets/top_${TM[t].img}.webp" alt="" style="--d:${(i * .37) % 1.3}s;--sp:${2.6 + (i * .53) % 1.4}s"></div>`).join('')}</div>`},
    {k: 'figs', t: 'Top 5 piloti', s: CHAMP ? `${esc(D[CHAMP.id].last)} campione del mondo` : `Dopo ${done.length} GP`, html: `<div class="spot"></div><div class="figrow">${top5.map((s, i) => `<button class="f5" style="--i:${i}" data-open="driver:${s[0]}">
      <div class="f5img">${figFor(s[0])}</div><div class="f5n"><b>${CHAMP && CHAMP.id === s[0] ? "🏆" : i + 1}</b> ${esc(D[s[0]].last)}</div><div class="f5p">${nf(s[1])} pt</div></button>`).join('')}</div>`},
    {k: 'v360', t: 'Giro a 360°', s: `LEGO® ${TM[vt].set?.num || ''} · ${esc(TM[vt].set?.name || teamName(vt))}`, html: `<div class="studio"></div>
      ${v360HTML(TM[vt].set.num, 'v360')}
      <button class="vmore" data-open="team:${vt}">Tutte le squadre ›</button>`},
    {k: 'grid', t: 'La griglia 2026', s: `${grid.length} piloti in classifica`, html: `<div class="mq"><div class="mqr">${rowA.concat(rowA).map(chip).join('')}</div>
      <div class="mqr rev">${rowB.concat(rowB).map(chip).join('')}</div></div>`}
  ];
  return `<div class="strip" id="strip">${scenes.map((sc, i) => `<div class="scene sc-${sc.k}${i ? '' : ' act'}" data-k="${sc.k}">${sc.html}</div>`).join('')}
    <div class="tag"><b id="stT">${scenes[0].t}</b><span id="stS">${scenes[0].s}</span></div>
    <div class="dots">${scenes.map((sc, i) => `<button class="${i ? '' : 'on'}" data-i="${i}" aria-label="${esc(sc.t)}"></button>`).join('')}</div>
    <script type="application/json" id="stMeta">${JSON.stringify(scenes.map(s => [s.t, s.s])).replace(/</g, '\\u003c')}</script></div>`;
}
function runStrip() {
  const strip = $('#strip'); if (!strip) return;
  const scenes = [...strip.querySelectorAll('.scene')], dots = [...strip.querySelectorAll('.dots button')], meta = JSON.parse($('#stMeta').textContent);
  let cur = 0, timer;
  const show = i => { cur = (i + scenes.length) % scenes.length;
    scenes.forEach((s, k) => s.classList.toggle('act', k === cur)); dots.forEach((d, k) => d.classList.toggle('on', k === cur));
    $('#stT').textContent = meta[cur][0]; $('#stS').textContent = meta[cur][1];
    strip.querySelectorAll('.vbox').forEach(b => { if (!b.closest('.scene').classList.contains('act')) stopVid(b); });
    clearTimeout(timer); timer = setTimeout(next, 6500); };
  const next = () => { if (!strip.isConnected) return; if (strip.querySelector('.scene.act .vbox.playing')) { timer = setTimeout(next, 1500); return; } show(cur + 1); };
  dots.forEach(d => d.onclick = e => { e.stopPropagation(); show(+d.dataset.i); });
  let x0 = null; strip.addEventListener('touchstart', e => x0 = e.touches[0].clientX, {passive: true});
  strip.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
  timers.push({clear: () => clearTimeout(timer)});
  bindVid(strip);
  show(0);
  stripMotion();
}
function stripMotion() {
  const cars = [...document.querySelectorAll('#strip .car')]; if (!cars.length) return;
  // le auto LEGO sono fotografate di 3/4: il muso punta in basso a sinistra a ~20°.
  // pista e corsie seguono lo stesso asse, così il moto è coerente con la prospettiva.
  const strip = $('#strip'), track = $('#track'), ANG = 20 * Math.PI / 180;
  const u = [Math.cos(ANG), -Math.sin(ANG)], v = [Math.sin(ANG), Math.cos(ANG)]; // u: verso il retro (su-destra) · v: perpendicolare
  const plan = [[.0, 1], [.2, 0], [.44, 1], [.64, 0]]; // [posizione lungo la pista (× larghezza), corsia 0 = esterna, 1 = interna]
  let W, H, O, S;
  const layout = () => { W = strip.clientWidth; H = strip.clientHeight;
    S = Math.min(W, (H - 107) / (.64 * Math.sin(ANG) + .40 * .482)); // ampiezza utile: lo schieramento resta sempre dentro la striscia
    O = [(W - (S * .64 * Math.cos(ANG) + S * .40)) / 2, H - 10];
    const L = Math.hypot(W, H) * 2.2, T = 132, cx = O[0] + u[0] * S * .5 - v[0] * 30, cy = O[1] + u[1] * S * .5 - v[1] * 30;
    Object.assign(track.style, {width: L + 'px', height: T + 'px', left: (cx - L / 2) + 'px', top: (cy - T / 2) + 'px', transform: `rotate(${-20}deg)`});
    cars.forEach(c => c.style.width = Math.round(S * .40) + "px"); };
  layout(); addEventListener('resize', layout);
  let raf; const t0 = performance.now();
  const f = t => { if (!strip.isConnected) return cancelAnimationFrame(raf); const s = (t - t0) / 1000;
    const pos = cars.map((c, i) => { const [a, lane] = plan[i];
      const along = S * a + Math.sin(s * (.42 + i * .11) + i * 1.9) * S * .05;          // sorpassi lenti avanti/indietro
      const off = (lane ? 0 : -50) + Math.sin(s * .7 + i) * 3;                           // corsia + piccolo ondeggiamento
      const x = O[0] + u[0] * along + v[0] * off, y = O[1] + u[1] * along + v[1] * off;
      return {c, x, y}; });
    pos.sort((p, q) => p.y - q.y).forEach((p, k) => { const cw = p.c.offsetWidth, ch = p.c.offsetHeight, j = Math.sin(s * 31 + k * 2) * .6;
      p.c.style.zIndex = 2 + k; p.c.style.transform = `translate(${(p.x).toFixed(1)}px, ${(p.y - ch + j).toFixed(1)}px)`; });
    raf = requestAnimationFrame(f); };
  raf = requestAnimationFrame(f);
}

/* ---------- CLASSIFICHE ---------- */
let standMode = 'drivers';
function standings() {
  const maxD = lastStand[0][1], maxC = lastCStand[0][1];
  const drv = lastStand.map((s, i) => { const c = s[4][s[4].length - 1], d = D[s[0]];
    return `<button class="li stag" style="--i:${i}" data-open="driver:${s[0]}"><div class="pos">${s[2]}</div>${avatar(s[0])}
      <div class="grow"><div class="ellip" style="font-weight:600">${NAT[d.nat] || ''} ${esc(d.first)} <b>${esc(d.last)}</b>${ME.fav === s[0] ? ' ⭐' : ''}</div>
      <div class="small muted ellip">${CHAMP && CHAMP.id === s[0] ? '<b class="gold">🏆 Campione</b> · ' : ''}${esc(teamName(c))}${s[3] ? ` · ${s[3]} vittori${s[3] > 1 ? 'e' : 'a'}` : ''}</div>
      <div class="pbar"><i style="--w:${s[1] / maxD};background:${teamCol(c)}"></i></div></div><div class="pts">${nf(s[1])}</div></button>`; }).join('');
  const con = lastCStand.map((s, i) => `<button class="li carrow stag" style="--i:${i}" data-open="team:${s[0]}"><div class="pos">${s[2]}</div>
      <div class="carimg"><img src="assets/car_${TM[s[0]].img}.webp" alt="" loading="lazy"></div>
      <div class="grow"><div style="font-weight:700" class="ellip">${esc(teamName(s[0]))}</div><div class="small muted">${CCHAMP && CCHAMP.id === s[0] ? '<b class="gold">🏆 Campione</b> · ' : ''}${s[3] ? s[3] + ' vittorie' : 'nessuna vittoria'}</div>
      <div class="pbar"><i style="--w:${s[1] / maxC};background:${teamCol(s[0])}"></i></div></div><div class="pts">${nf(s[1])}</div></button>`).join('');
  setView(`<div class="ltitle"><div><p>Dopo ${done.length} GP</p><h1>Classifiche</h1></div></div>
    <div class="seg" id="seg"><span class="knob"></span><button data-m="drivers">Piloti</button><button data-m="constructors">Costruttori</button></div>
    <div class="list" id="stList">${standMode === 'drivers' ? drv : con}</div>`, 'Classifiche');
  const seg = $('#seg'), knob = seg.querySelector('.knob'), bs = seg.querySelectorAll('button');
  const place = () => { const b = [...bs].find(x => x.dataset.m === standMode); knob.style.width = b.offsetWidth + 'px'; knob.style.transform = `translateX(${b.offsetLeft - 2}px)`; };
  requestAnimationFrame(place);
  bs.forEach(b => b.onclick = () => { if (standMode === b.dataset.m) return; standMode = b.dataset.m; place(); view.classList.remove('in');
    $('#stList').innerHTML = standMode === 'drivers' ? drv : con; requestAnimationFrame(() => requestAnimationFrame(() => view.classList.add('in'))); });
}

/* ---------- GARE ---------- */
function races() {
  setView(`<div class="ltitle"><div><p>${F.races.length} Gran Premi · ${F.races.filter(r => r.sessions.Sprint).length} weekend Sprint</p><h1>Gare</h1></div></div>
  <div class="list">${F.races.map((r, i) => { const w = r.results[0];
    return `<button class="li rcard stag" style="--i:${i}" data-open="${w ? 'race' : 'track'}:${r.round}"><div class="flag">${gpFlag(r)}</div>
    <div class="grow"><div class="rnd">R${r.round} · ${fmtDate(when(r.date, r.time), {day:'numeric', month:'short'})}${r.sessions.Sprint ? ' · Sprint' : ''}</div>
    <div class="ellip" style="font-weight:700">${gpName(r)}</div><div class="small muted ellip">${w ? '🏆 ' + esc(D[w.d].first + ' ' + D[w.d].last) + (r.dotd ? ' · ⭐ ' + esc(D[r.dotd].last) : '') : esc(r.circuit)}</div></div>
    ${w ? `<div class="wf">${F.figs.includes(D[w.d].code) ? `<img src="assets/fig_${D[w.d].code}.webp" alt="" loading="lazy">` : figFor(w.d)}</div>` : `<span class="chip ${r === nextRace ? 'next' : ''}">${r === nextRace ? 'Prossima' : 'In programma'}</span>`}</button>`; }).join('')}</div>`, 'Gare');
}
function resTable(list, kind) {
  if (!list.length) return '<p class="muted">Nessun dato per questa sessione.</p>';
  return `<div class="card pad" style="padding:6px 12px"><table class="table">${list.map(x => { const d = D[x.d];
    const right = kind === 'q' ? (x.q3 || x.q2 || x.q1 || '') : (x.t || statusIt(x.s));
    const gain = kind !== 'q' && x.g ? x.g - x.p : 0;
    return `<tr data-open="driver:${x.d}" style="cursor:pointer"><td style="width:30px;font-weight:800">${posTxt(x)}</td><td style="width:44px">${avatar(x.d).replace('class="av"', 'class="av" style="width:36px;height:36px"')}</td>
      <td><b>${esc(d.last)}</b> ${x.fl ? '<span title="Giro più veloce">🟣</span>' : ''}<div class="small muted">${esc(teamName(x.c))}${kind === 'q' ? '' : ` · via P${x.g || 'pit'}`} ${gain > 0 ? `<span class="up">▲${gain}</span>` : gain < 0 ? `<span class="dn">▼${-gain}</span>` : ''}</div></td>
      <td class="r num small">${esc(right)}${kind !== 'q' && x.pts ? `<div style="font-weight:700">+${nf(x.pts)}</div>` : ''}</td></tr>`; }).join('')}</table></div>`;
}
function raceSheet(round) {
  const r = F.races.find(x => x.round == round); if (!r.results.length) return trackSheet(round);
  const fl = r.results.find(x => x.fl), pole = r.quali[0];
  const tabs = [['race', 'Gara'], ['quali', 'Qualifiche']].concat(r.sprint.length ? [['sprint', 'Sprint']] : []);
  openSheet(`<div class="dhero" style="background:linear-gradient(160deg,#16181f,#3b0b0a);min-height:200px"><div class="meta" style="max-width:100%">
    <div class="small" style="opacity:.75">${gpFlag(r)} Round ${r.round} · ${fmtDate(when(r.date, r.time), {day:'numeric', month:'long', year:'numeric'})}</div><h2>${gpName(r)}</h2><div class="first">${esc(r.circuit)}</div></div></div>
    <div class="card" style="margin-top:14px">${podiumHTML(r)}</div>
    <div class="stats">
      <div class="stat"><span>Pole</span><b style="font-size:17px">${pole ? esc(D[pole.d].last) : '–'}</b><span>${pole ? esc(pole.q3 || '') : ''}</span></div>
      <div class="stat"><span>Giro veloce</span><b style="font-size:17px">${fl ? esc(D[fl.d].last) : '–'}</b><span>${fl ? esc(fl.fl) : ''}</span></div>
      <div class="stat"><span>Pilota del giorno</span><b style="font-size:17px">${r.dotd ? esc(D[r.dotd].last) : '–'}</b><span>voto fan</span></div>
    </div>
    <div class="seg" id="rseg" style="margin-top:18px"><span class="knob"></span>${tabs.map(t => `<button data-k="${t[0]}">${t[1]}</button>`).join('')}</div>
    <div id="rtab">${resTable(r.results)}</div>
    <p style="margin-top:14px"><button class="btn sec" data-open="track:${r.round}" style="width:100%">Scheda della pista</button></p>`);
  const seg = $('#rseg'), knob = seg.querySelector('.knob'), bs = seg.querySelectorAll('button'); let k = 'race';
  const place = () => { const b = [...bs].find(x => x.dataset.k === k); knob.style.width = b.offsetWidth + 'px'; knob.style.transform = `translateX(${b.offsetLeft - 2}px)`; };
  setTimeout(place, 60);
  bs.forEach(b => b.onclick = () => { k = b.dataset.k; place(); $('#rtab').innerHTML = k === 'race' ? resTable(r.results) : k === 'quali' ? resTable(r.quali, 'q') : resTable(r.sprint); });
}

/* ---------- PISTE ---------- */
function weekendRange(r) { const s = Object.values(r.sessions).map(x => when(x[0], x[1])).concat([when(r.date, r.time)]).sort((a, b) => a - b);
  const a = s[0], b = s[s.length - 1]; return a.getMonth() === b.getMonth() ? `${fmtDate(a, {day:'numeric'})}–${fmtDate(b, {day:'numeric', month:'long'})}` : `${fmtDate(a, {day:'numeric', month:'short'})} – ${fmtDate(b, {day:'numeric', month:'short'})}`; }
function tracks() {
  setView(`<div class="ltitle"><div><p>Calendario 2026 · ${F.races.length} circuiti</p><h1>Piste</h1></div></div>
  <div class="tgrid">${F.races.map((r, i) => { const st = r.results.length ? 'done' : r === nextRace ? 'next' : '';
    const col = r.results[0] ? teamCol(r.results[0].c) : '#E10600';
    return `<button class="card tcard tap stag" style="--i:${i};text-align:left" data-open="track:${r.round}"><div class="glow" style="--g:${col}"></div>
      <div class="row"><div class="flag">${gpFlag(r)}</div><div class="grow"><div class="rnd">R${r.round} · ${weekendRange(r)}</div><div class="ellip" style="font-weight:800;font-size:18px">${esc(r.circuit)}</div><div class="small muted">${esc(r.locality)}, ${esc(gpCountry(r))}</div></div>
      <span class="chip ${st}">${st === 'done' ? 'Corsa' : st === 'next' ? 'Prossima' : 'In arrivo'}</span></div>
      <div class="facts"><div class="fact"><b>${km(r.len)}</b><span>km</span></div><div class="fact"><b>${r.turns}</b><span>curve</span></div><div class="fact"><b>${r.laps || '–'}</b><span>giri</span></div><div class="fact"><b>${r.first}</b><span>1° GP</span></div></div>
      ${r.results[0] ? `<div class="small muted">🏆 ${esc(D[r.results[0].d].last)} · Pole ${esc(D[r.quali[0]?.d]?.last || '–')}</div>` : `<div class="small muted">${r.sessions.Sprint ? 'Weekend Sprint · ' : ''}Gara ${fmtDate(when(r.date, r.time), {weekday:'long', hour:'2-digit', minute:'2-digit'})}</div>`}
    </button>`; }).join('')}</div>`, 'Piste');
}
function trackSheet(round) {
  const r = F.races.find(x => x.round == round);
  const sess = Object.entries(r.sessions).map(([k, v]) => [k, when(v[0], v[1])]).concat([['Race', when(r.date, r.time)]]).sort((a, b) => a[1] - b[1]);
  const isNext = r === nextRace, w = r.results[0], fl = r.results.find(x => x.fl);
  const dist = r.laps ? (r.laps * r.len) : null;
  const maps = `https://maps.apple.com/?ll=${r.lat},${r.lng}&q=${encodeURIComponent(r.circuit)}`;
  openSheet(`<div class="dhero" style="background:radial-gradient(120% 90% at 80% 20%,#26324a,#0c0f16);min-height:250px;align-items:center">
    <div class="meta"><div class="small" style="opacity:.75">${gpFlag(r)} Round ${r.round} · ${weekendRange(r)}</div><h2>${esc(r.circuit)}</h2><div class="first">${gpName(r)}</div>
    <div class="small" style="opacity:.75;margin-top:6px">${esc(r.locality)}, ${esc(gpCountry(r))}</div></div>
    <div style="position:absolute;right:14px;top:56px">${globeSVG(r.lat, r.lng)}</div></div>
    ${isNext ? `<div class="card pad" style="margin-top:14px;color:#fff;background:linear-gradient(135deg,#E10600,#7a0300)"><b>Alla partenza mancano</b>${countdownHTML('cdTrack')}</div>` : ''}
    ${CIRC[r.circuitId] ? `<div class="sec-h"><h2>Il tracciato</h2><span class="small muted">${r.turns} curve · ${km(r.len)} km</span></div>
      <div class="card trackcard">${trackMap(r.circuitId, 'tk')}</div>` : ''}
    ${!w ? `<div id="liveQuali"></div>` : ''}
    <div class="stats">
      <div class="stat"><span>Lunghezza</span><b>${km(r.len)}</b><span>km</span></div>
      <div class="stat"><span>Curve</span><b>${r.turns}</b><span>totali</span></div>
      <div class="stat"><span>Giri</span><b>${r.laps || '–'}</b><span>${dist ? nf(Math.round(dist * 10) / 10) + ' km' : 'distanza'}</span></div>
      <div class="stat"><span>Primo GP</span><b>${r.first}</b><span>in F1</span></div>
      <div class="stat"><span>Formato</span><b style="font-size:17px">${r.sessions.Sprint ? 'Sprint' : 'Classico'}</b><span>weekend</span></div>
      <div class="stat"><span>Coordinate</span><b style="font-size:14px">${r.lat.toFixed(3)}<br>${r.lng.toFixed(3)}</b></div>
    </div>
    <div class="sec-h"><h2>Programma</h2><span class="small muted">ora italiana</span></div>
    <div class="list">${sess.map(([k, d]) => `<div class="li"><div class="grow"><b>${SESS[k]}</b><div class="small muted">${fmtDate(d, {weekday:'long', day:'numeric', month:'long'})}</div></div><div class="num" style="font-weight:700">${fmtDate(d, {hour:'2-digit', minute:'2-digit'})}</div></div>`).join('')}</div>
    ${w ? `<div class="sec-h"><h2>2026 su questa pista</h2><button data-open="race:${r.round}">Risultati</button></div>
      <div class="card">${podiumHTML(r)}</div>
      <div class="list" style="margin-top:10px">
        <div class="li"><div class="grow">Pole position</div><b>${esc(D[r.quali[0].d].last)} · ${esc(r.quali[0].q3 || '')}</b></div>
        ${fl ? `<div class="li"><div class="grow">Giro più veloce</div><b>${esc(D[fl.d].last)} · ${esc(fl.fl)}</b></div>` : ''}
        ${r.dotd ? `<div class="li"><div class="grow">Pilota del giorno</div><b>⭐ ${esc(D[r.dotd].last)}</b></div>` : ''}
      </div>` : ''}
    <p style="margin-top:18px"><a class="mapbtn" href="${maps}" target="_blank" rel="noopener">📍 Apri il circuito in Mappe</a></p>`);
  if (isNext) runCountdown('cdTrack', when(r.date, r.time));
  if (!w) liveQuali(r).then(q => { const el = $('#liveQuali'); if (el && q && q.length) el.innerHTML = `<div class="sec-h"><h2>Qualifiche</h2><span class="small muted">ordine dei tempi</span></div>${resTable(q, "q")}<p class="small muted" style="margin:8px 4px 0">La griglia di partenza può cambiare per penalità.</p>`; });
}

/* ---------- NEWS: copia statica (news.js, aggiornata dall'attività del lunedì) + feed dal vivo tramite il Worker ---------- */
const API = window.BG_API || '';
let NEWS = (window.NEWS && window.NEWS.items) || [];
async function liveNews() { if (!API) return false;
  try { const j = await (await fetch(API + '/news')).json(); if (!j.items || !j.items.length) return false;
    const seen = new Set(NEWS.map(n => n.l)); NEWS = j.items.filter(n => !seen.has(n.l)).concat(NEWS).sort((a, b) => b.d - a.d); return true; } catch { return false; } }
const newsItems = () => NEWS;
const NAMEIDX = () => F.drivers.map(d => [d.id, d.last.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()]).filter(x => x[1].length > 3);
function newsWho(t) { const s = t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); const m = NAMEIDX().find(([, n]) => new RegExp('\\b' + n + '\\b').test(s)); return m ? m[0] : null; }
function ago(ms) { const m = Math.round((Date.now() - ms) / 60000); if (m < 60) return m + ' min fa'; const h = Math.round(m / 60); if (h < 24) return h + ' h fa'; return fmtDate(new Date(ms), {day: 'numeric', month: 'short'}); }
function newsList(items) {
  if (!items.length) return '<div class="li"><div class="grow muted">Nessuna notizia disponibile.</div></div>';
  return items.map(n => { const who = newsWho(n.t);
    return `<a class="li news" href="${esc(n.l)}" target="_blank" rel="noopener">${who ? avatar(who).replace('class="av"', 'class="av" style="width:42px;height:42px"') : '<div class="av newsav">F1</div>'}
      <div class="grow"><div class="small muted">${esc(n.s)} · ${ago(n.d)}</div><div class="ntitle">${esc(n.t.replace(/^F1 \| /, ''))}</div></div></a>`; }).join('');
}
function newsSheet() {
  // raggruppa per weekend di gara: ogni notizia va nella settimana del GP più recente prima della sua data
  const groups = new Map();
  for (const n of NEWS) { const r = [...F.races].reverse().find(x => when(x.date, x.time) - 3 * 86400e3 <= n.d) || F.races[0];
    if (!groups.has(r.round)) groups.set(r.round, {r, items: []}); groups.get(r.round).items.push(n); }
  openSheet(`<div class="dhero" style="background:linear-gradient(160deg,#1b1d24,#3a0d0c);min-height:150px"><div class="meta" style="max-width:100%"><div class="small" style="opacity:.75">${NEWS.length} notizie · aggiornate ${NEWS[0] ? ago(NEWS[0].d) : ''}</div><h2>News F1</h2></div></div>
    ${[...groups.values()].map(g => `<div class="sec-h"><h2 style="font-size:18px">${gpFlag(g.r)} Settimana del ${gpName(g.r)}</h2><span class="small muted">${g.items.length}</span></div><div class="list">${newsList(g.items)}</div>`).join('')}
    <p class="foot">Titoli e link da Motorsport.com, FormulaPassion e Formula1.com: tocca una notizia per leggerla sul sito della fonte.</p>`);
}

/* ---------- griglie di partenza ufficiali con le minifig al posto delle foto ---------- */
const GRIDIMG = {21: ['assets/grid_r21_1.jpg?v=1', 'assets/grid_r21_2.jpg?v=1']};
document.addEventListener('click', e => { const b = e.target.closest('[data-grid]'); if (!b) return; const [rd, i] = b.dataset.grid.split(':'), r = F.races.find(x => x.round == rd);
  openSheet(`<div class="dhero" style="background:linear-gradient(160deg,#2a0606,#0b0b0e);min-height:150px"><div class="meta" style="max-width:100%"><div class="small" style="opacity:.75">${gpFlag(r)} Round ${r.round}</div><h2>Griglia di partenza</h2><div class="first">${gpName(r)}</div></div></div>
    ${GRIDIMG[rd].map((src, k) => `<img class="gridfull" id="gf${k}" src="${src}" alt="Griglia di partenza, posizioni ${k ? '11–22' : '1–10'}">`).join('')}
    <p class="foot">Grafica ufficiale F1 con le minifig LEGO® al posto delle foto dei piloti. Camara non ha una minifig: è rappresentato con una figura generica nei colori Haas.</p>`);
  setTimeout(() => $('#gf' + i)?.scrollIntoView({block: 'start'}), 300); });

/* ---------- mappe dei circuiti (github.com/bacinger/f1-circuits, MIT) ---------- */
const CIRC = window.CIRCUITS || {};
function trackMap(cid, uid) {
  const c = CIRC[cid]; if (!c) return '';
  const id = 'tp-' + uid + '-' + cid;
  return `<svg class="trackmap" viewBox="-6 -6 112 112" role="img" aria-label="Tracciato ${esc(c.name)}">
    <path id="${id}" d="${c.d}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="6.5" stroke-linejoin="round" transform="translate(.8 1.2)"/>
    <path d="${c.d}" fill="none" stroke="#3a3d45" stroke-width="5" stroke-linejoin="round"/>
    <path d="${c.d}" fill="none" stroke="#f5f5f7" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="${c.d}" fill="none" stroke="#E10600" stroke-width="1.6" stroke-linejoin="round" stroke-dasharray="1.6 3.2" class="tm-dash"/>
    <circle r="2.6" fill="#E10600" stroke="#fff" stroke-width="1"><animateMotion dur="9s" repeatCount="indefinite" rotate="auto"><mpath href="#${id}"/></animateMotion></circle>
    <g transform="translate(${c.d.slice(1).split('L')[0].split(' ').map(Number).join(' ')})"><rect x="-2.6" y="-2.6" width="5.2" height="5.2" fill="#fff"/><rect x="-2.6" y="-2.6" width="2.6" height="2.6" fill="#111"/><rect x="0" y="0" width="2.6" height="2.6" fill="#111"/></g>
  </svg>`;
}
/* qualifiche del prossimo GP: lette dal vivo dall'API Jolpica appena disponibili */
const LIVEQ = {};
async function liveQuali(r) {
  if (r.quali.length) return r.quali; if (LIVEQ[r.round]) return LIVEQ[r.round];
  const s = r.sessions.Qualifying; if (!s || when(s[0], s[1]) > Date.now()) return null;
  try { const j = await (await fetch(`https://api.jolpi.ca/ergast/f1/2026/${r.round}/qualifying/`)).json();
    const q = (j.MRData.RaceTable.Races[0] || {}).QualifyingResults || [];
    q.forEach(x => { const d = x.Driver; if (!D[d.driverId]) { D[d.driverId] = {id: d.driverId, code: d.code, num: d.permanentNumber, first: d.givenName, last: d.familyName, nat: d.nationality}; STAT[d.driverId] = {wins: 0, pod: 0, poles: 0, fl: 0, dnf: 0, starts: 0, best: 99, dotd: 0, sprintW: 0, pts: 0}; } });
    return (LIVEQ[r.round] = q.map(x => ({p: +x.position, d: x.Driver.driverId, c: x.Constructor.constructorId, q1: x.Q1, q2: x.Q2, q3: x.Q3})));
  } catch { return null; }
}
function qualiTop3(q) {
  return `<div class="nxq"><div class="small" style="opacity:.8;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Qualifiche · tempi</div>
    <div class="nxq3">${q.slice(0, 3).map(x => `<div class="nxqd"><div class="wf" style="width:44px;height:44px">${F.figs.includes(D[x.d].code) ? `<img src="assets/fig_${D[x.d].code}.webp" alt="">` : figFor(x.d)}</div>
      <div><b>P${x.p} ${esc(D[x.d].last)}</b><div class="small" style="opacity:.75">${esc(x.q3 || x.q2 || x.q1 || '')}</div></div></div>`).join('')}</div></div>`;
}

/* ---------- PILOTA ---------- */
function driverSheet(id) {
  const d = D[id], c = teamOf(id), col = teamCol(c), s = STAT[id], st = standOf(id), h = helmetFor(id);
  const leader = lastStand[0][0];
  const chips = done.map(r => { const x = r.results.find(y => y.d === id); if (!x) return `<div class="rchip" style="opacity:.35"><small>${GP[r.circuitId]?.[1] || ''}</small>–</div>`;
    const p = posTxt(x); const cls = x.p === 1 ? 'g1' : x.p === 2 ? 'g2' : x.p === 3 ? 'g3' : /^\d+$/.test(x.pt) ? '' : 'dnf';
    return `<div class="rchip ${cls}" data-open="race:${r.round}" title="${esc(gpName(r))}"><small>${GP[r.circuitId]?.[1] || ''}</small>${p}</div>`; }).join('');
  const age = d.dob ? Math.floor((Date.now() - new Date(d.dob)) / 31557600000) : '';
  openSheet(`<div class="dhero" style="background:linear-gradient(150deg, ${col} 0%, color-mix(in srgb, ${col} 40%, #000) 100%)">
    <div class="num-bg">${esc(d.num || '')}</div>${h ? `<img class="dhelm" src="${h}" alt="Casco">` : ''}
    <button class="fav glass" id="favBtn" aria-label="Preferito">${ME.fav === id ? '★' : '☆'}</button>
    <div class="meta">${CHAMP && CHAMP.id === id ? champBadge() : ''}<div class="small" style="opacity:.85">${NAT[d.nat] || ''} ${esc(teamName(c))} · #${esc(d.num || '')}</div><div class="first">${esc(d.first)}</div><h2>${esc(d.last)}</h2></div>
    <div class="dfig">${figFor(id)}</div></div>
    <div class="stats">
      <div class="stat"><span>Posizione</span><b>P${st ? st[2] : '–'}</b><span>mondiale</span></div>
      <div class="stat"><span>Punti</span><b id="dPts">0</b><span>${st && id !== leader ? '−' + nf(lastStand[0][1] - st[1]) + ' dal leader' : 'leader'}</span></div>
      <div class="stat"><span>Vittorie</span><b>${s.wins}</b><span>${s.sprintW ? '+ ' + s.sprintW + ' sprint' : 'GP'}</span></div>
      <div class="stat"><span>Podi</span><b>${s.pod}</b><span>su ${s.starts} gare</span></div>
      <div class="stat"><span>Pole</span><b>${s.poles}</b><span>giri veloci ${s.fl}</span></div>
      <div class="stat"><span>Pilota del giorno</span><b>${s.dotd}</b><span>voto fan</span></div>
    </div>
    <div class="sec-h"><h2>Andamento punti</h2><span class="small muted">${id === leader ? 'leader' : 'vs leader (grigio)'}</span></div>
    <div class="card pad">${pointsChart(id === leader ? [id] : [id, leader])}</div>
    <div class="sec-h"><h2>Gara per gara</h2></div><div class="chips">${chips}</div>
    <div class="list" style="margin-top:16px">
      <div class="li"><div class="grow">Miglior risultato</div><b>${s.best < 99 ? 'P' + s.best : '–'}</b></div>
      <div class="li"><div class="grow">Ritiri / non classificato</div><b>${s.dnf}</b></div>
      <div class="li"><div class="grow">Data di nascita</div><b>${d.dob ? fmtDate(new Date(d.dob + 'T12:00:00Z'), {day:'numeric', month:'long', year:'numeric'}) + ' · ' + age + ' anni' : '–'}</b></div>
      ${c ? `<button class="li" data-open="team:${c}"><div class="grow">Squadra</div><b style="color:${col}">${esc(teamName(c))} ›</b></button>` : ''}
    </div>`);
  setTimeout(() => countUp($('#dPts'), s.pts), 300);
  $('#favBtn').onclick = e => { e.stopPropagation(); ME.fav = ME.fav === id ? null : id; saveMe(); e.currentTarget.textContent = ME.fav === id ? '★' : '☆'; if (tab === 'home' || tab === 'standings' || tab === 'me') go(tab); };
}

/* ---------- SQUADRA ---------- */
function teamSheet(c) {
  const m = TM[c], cs = lastCStand.find(x => x[0] === c);
  const drivers = lastStand.filter(s => s[4][s[4].length - 1] === c);
  const wins = done.filter(r => r.results[0]?.c === c).length, pods = done.reduce((a, r) => a + r.results.slice(0, 3).filter(x => x.c === c).length, 0);
  const hist = F.cstand.map(st => (st.find(x => x[0] === c) || [0, 0])[1]); const max = Math.max(...hist, 1);
  const helms = drivers.map(s => s[0]).filter(id => helmetFor(id)).slice(0, 2);
  openSheet(`<div class="dhero" style="background:linear-gradient(160deg, ${m.col}, color-mix(in srgb, ${m.col} 35%, #000));min-height:250px">
    <div class="thelms">${helms.map((id, i) => `<button class="thelm" data-open="driver:${id}" style="--i:${i}"><img src="${helmetFor(id)}" alt="Casco ${esc(D[id].last)}"><span>${esc(D[id].code)}</span></button>`).join('')}</div>
    <div class="meta" style="max-width:56%">
    ${CCHAMP && CCHAMP.id === c ? champBadge('Campione costruttori') : ''}<div class="small" style="opacity:.85">P${cs[2]} costruttori · ${nf(cs[1])} punti</div><h2>${esc(m.n)}</h2></div></div>
    <div class="plate" style="margin-top:14px"><img src="assets/hero_${m.img}.webp" alt="Set LEGO ${esc(m.n)}"></div>
    ${m.set ? `<div class="list" style="margin-top:10px">
      <div class="li"><div class="grow"><b>LEGO® Speed Champions ${m.set.num}</b><div class="small muted">Auto da corsa F1® ${esc(m.set.name)}</div></div></div>
      <div class="li"><div class="grow">Pezzi</div><b class="num">${m.set.pcs}</b></div>
      <div class="li"><div class="grow">Prezzo</div><b>${esc(m.set.price)}</b></div>
      <div class="li"><div class="grow">Uscita</div><b>${esc(m.set.date)}</b></div>
      <a class="li" href="https://www.lego.com/it-it/product/${m.set.num}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none"><div class="grow"><b>Vedi su LEGO.com</b></div>↗</a>
    </div>` : ''}
    ${VIDEO360.includes(c) ? `<div class="sec-h"><h2>Giro a 360°</h2><span class="small muted">video LEGO®</span></div>
      ${v360HTML(m.set.num, 'plate vplate')}` : ''}
    <div class="sec-h"><h2>Prospettive</h2><span class="small muted">tocca l'auto per animarla</span></div>
    <div class="seg" id="vseg"><span class="knob"></span><button data-v="car">3/4 frontale</button><button data-v="side">Laterale</button><button data-v="top">Dall'alto</button></div>
    <button class="plate pview v-car" id="pview" aria-label="Anima l'auto"><img src="assets/car_${m.img}.webp" alt="Auto ${esc(m.n)}"></button>
    <div class="stats"><div class="stat"><span>Vittorie</span><b>${wins}</b></div><div class="stat"><span>Podi</span><b>${pods}</b></div><div class="stat"><span>Punti</span><b id="tPts">0</b></div></div>
    <div class="sec-h"><h2>Piloti</h2></div>
    <div class="list">${drivers.map(s => `<button class="li" data-open="driver:${s[0]}">${avatar(s[0])}<div class="grow"><b>${esc(D[s[0]].first)} ${esc(D[s[0]].last)}</b><div class="small muted">P${s[2]} · ${nf(s[1])} punti</div></div>›</button>`).join('')}</div>
    <div class="sec-h"><h2>Punti round per round</h2></div>
    <div class="card pad"><svg class="chart" viewBox="0 0 340 120">${hist.map((v, i) => { const prev = i ? hist[i - 1] : 0, gain = v - prev, hgt = gain / Math.max(...hist.map((x, j) => x - (j ? hist[j - 1] : 0)), 1) * 90;
      return `<rect x="${8 + i * 16.4}" y="${100 - hgt}" width="11" height="${hgt}" rx="3" fill="${m.col}"><animate attributeName="height" from="0" to="${hgt}" dur=".8s" begin="${i * .03}s" fill="freeze"/><animate attributeName="y" from="100" to="${100 - hgt}" dur=".8s" begin="${i * .03}s" fill="freeze"/></rect><text x="${13.5 + i * 16.4}" y="114" font-size="8" text-anchor="middle" fill="var(--label2)">${i + 1}</text>`; }).join('')}</svg></div>
    `);
  setTimeout(() => countUp($('#tPts'), cs[1]), 300);
  bindVid(sheetBody);
  const seg = $('#vseg'), knob = seg.querySelector('.knob'), bs = [...seg.querySelectorAll('button')], pv = $('#pview'), img = pv.querySelector('img');
  let v = 'car';
  const place = () => { const b = bs.find(x => x.dataset.v === v); knob.style.width = b.offsetWidth + 'px'; knob.style.transform = `translateX(${b.offsetLeft - 2}px)`; };
  setTimeout(place, 80);
  bs.forEach(b => b.onclick = () => { if (v === b.dataset.v) return; v = b.dataset.v; place(); pv.className = 'plate pview v-' + v + ' swap';
    setTimeout(() => { img.src = `assets/${v}_${m.img}.webp`; pv.classList.remove('swap'); }, 180); });
  pv.onclick = () => { pv.classList.remove('go'); void pv.offsetWidth; pv.classList.add('go'); };
  pv.addEventListener('animationend', () => pv.classList.remove('go'));
}

/* ---------- CAROSELLO 3D stile Apple (dalla skill apple-carousel, scena "media3d" museo) ----------
   anello 3D di card, scatto con ease estrema [.85,0,.15,1], profondità di campo, riflesso sul pavimento.
   Interattivo: swipe/trascina, frecce, tocco sulla card frontale = scegli. */
function cbezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t, dX = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x;
    for (let i = 0; i < 8; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= (X(t) - x) / d; }
    if (t < 0 || t > 1 || Math.abs(X(t) - x) > 1e-4) { let a = 0, b = 1; t = x; for (let i = 0; i < 40; i++) { X(t) < x ? a = t : b = t; t = (a + b) / 2; } }
    return Y(t); };
}
const loadImgP = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
/* pittori delle card: piloti (verticali, minifig) e squadre (orizzontali, auto 3/4 frontale) */
const CARD = {
  driver: {aspect: 1.38, frac: .44, src: id => F.figs.includes(D[id].code) ? `assets/fig_${D[id].code}.webp` : 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(figFor(id)),
    paint(x, w, h, id, im) { const col = teamCol(teamOf(id));
      const gr = x.createLinearGradient(0, 0, w * .4, h); gr.addColorStop(0, col); gr.addColorStop(1, '#0d0d10'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      const sp = x.createRadialGradient(w / 2, h * .62, 0, w / 2, h * .62, w * .7); sp.addColorStop(0, 'rgba(255,255,255,.28)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = sp; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,.14)'; x.font = `900 ${Math.round(h * .38)}px -apple-system,system-ui,Helvetica`; x.textAlign = 'right'; x.fillText(D[id].num || '', w * .96, h * .36);
      if (im) { const fh = h * .7, fw = fh * im.width / im.height; x.drawImage(im, (w - fw) / 2, h * .84 - fh, fw, fh); }
      x.fillStyle = 'rgba(0,0,0,.42)'; x.fillRect(0, h * .84, w, h * .16);
      x.fillStyle = '#fff'; x.textAlign = 'left'; x.font = `800 ${Math.round(h * .062)}px -apple-system,system-ui,Helvetica`; x.fillText(D[id].last.toUpperCase(), w * .07, h * .935);
      x.textAlign = 'right'; x.font = `700 ${Math.round(h * .05)}px -apple-system,system-ui,Helvetica`; x.fillStyle = 'rgba(255,255,255,.75)'; x.fillText('P' + (standOf(id)?.[2] ?? '–'), w * .93, h * .935);
      if (ME.fav === id) { x.font = `${Math.round(h * .08)}px -apple-system`; x.textAlign = 'left'; x.fillText('⭐', w * .06, h * .1); } }},
  team: {aspect: .74, frac: .62, src: t => `assets/car_${TM[t].img}.webp`,
    paint(x, w, h, t, im) { const col = teamCol(t), cs = lastCStand.find(s => s[0] === t);
      const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, col); gr.addColorStop(1, '#0d0d10'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      const sp = x.createRadialGradient(w / 2, h * .62, 0, w / 2, h * .62, w * .55); sp.addColorStop(0, 'rgba(255,255,255,.55)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = sp; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,.16)'; x.font = `900 ${Math.round(h * .5)}px -apple-system,system-ui,Helvetica`; x.textAlign = 'right'; x.fillText(cs ? 'P' + cs[2] : '', w * .97, h * .44);
      if (im) { const fw = w * .9, fh = fw * im.height / im.width; x.drawImage(im, (w - fw) / 2, h * .8 - fh, fw, fh); }
      x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, h * .8, w, h * .2);
      x.fillStyle = '#fff'; x.textAlign = 'left'; x.font = `800 ${Math.round(h * .085)}px -apple-system,system-ui,Helvetica`; x.fillText(teamName(t).toUpperCase(), w * .05, h * .925);
      x.textAlign = 'right'; x.font = `700 ${Math.round(h * .07)}px -apple-system,system-ui,Helvetica`; x.fillStyle = 'rgba(255,255,255,.8)'; x.fillText(cs ? nf(cs[1]) + ' pt' : '', w * .95, h * .925);
      if (CCHAMP && CCHAMP.id === t) { x.font = `${Math.round(h * .11)}px -apple-system`; x.textAlign = 'left'; x.fillText('🏆', w * .04, h * .15); } }}
};
function favCarousel(root, ids, start, onChange, onPick, kind = 'driver') {
  const K = CARD[kind];
  const cv = root.querySelector('canvas'), g = cv.getContext('2d');
  const N = 8, STEP = 360 / N, rad = d => d * Math.PI / 180, EASE = cbezier(.85, 0, .15, 1);
  const LAYER = document.createElement('canvas'), LG = LAYER.getContext('2d');
  const canBlur = 'filter' in g;
  let W, H, DPR, CW, CH, R, rot = -start * STEP, anim = null, raf = 0, idleT = 0, lastUser = 0;
  const TEX = new Map(), REFL = new Map(), FIG = new Map();
  const mod = (a, n) => ((a % n) + n) % n;
  const cur = () => mod(Math.round(-rot / STEP), ids.length);
  // --- texture delle card (come paintCard della skill: card arrotondata + contenuto + didascalia)
  async function figImg(id) { if (FIG.has(id)) return FIG.get(id); const im = await loadImgP(K.src(id)); FIG.set(id, im); return im; }
  function tex(id) { if (TEX.has(id)) return TEX.get(id);
    const c = document.createElement('canvas'); c.width = Math.round(CW); c.height = Math.round(CH); const x = c.getContext('2d'), w = c.width, h = c.height;
    x.beginPath(); x.roundRect(0, 0, w, h, Math.min(w, h) * .09); x.clip();
    K.paint(x, w, h, id, FIG.get(id));
    TEX.set(id, c); return c; }
  function refl(id) { if (REFL.has(id)) return REFL.get(id); const t = tex(id), c = document.createElement('canvas'); c.width = t.width; c.height = t.height; const x = c.getContext('2d');
    x.translate(0, c.height); x.scale(1, -1); x.drawImage(t, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = 'destination-in'; const gr = x.createLinearGradient(0, 0, 0, c.height * .55); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, c.width, c.height);
    REFL.set(id, c); return c; }
  // --- camera e proiezione (identiche alla skill)
  const cam = () => { const p = rad(5), focal = 2.6 * W; return {cx: W / 2, cy: H * .40, c: Math.cos(p), s: Math.sin(p), focal, dist: focal + R}; };
  const proj = (C, x, y, z) => { const y2 = y * C.c + z * C.s, z2 = z * C.c - y * C.s, d = C.dist - z2, k = C.focal / d; return {x: C.cx + x * k, y: C.cy + y2 * k, d, k}; };
  function surface(ctx, C, t, xz, yTop, yBot, cols, a) { const tw = t.width, th = t.height, sw = tw / cols; let prev = null; ctx.globalAlpha = a;
    for (let i = 0; i <= cols; i++) { const [x, z] = xz(i / cols), T = proj(C, x, yTop, z), B = proj(C, x, yBot, z);
      if (prev) { const [pT, pB] = prev; ctx.setTransform((T.x - pT.x) / sw, (T.y - pT.y) / sw, (pB.x - pT.x) / th, (pB.y - pT.y) / th, pT.x, pT.y); ctx.drawImage(t, (i - 1) * sw, 0, sw, th, 0, 0, sw * 1.06 + .6, th); }
      prev = [T, B]; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; }
  function withBlur(b, fn) { if (!canBlur || b < .4) return fn(g); LG.setTransform(1, 0, 0, 1, 0, 0); LG.clearRect(0, 0, W, H); fn(LG); g.filter = `blur(${b.toFixed(1)}px)`; g.drawImage(LAYER, 0, 0); g.filter = 'none'; }
  function draw() { if (!W || !CW) return;
    g.clearRect(0, 0, W, H); const C = cam(), focusD = proj(C, 0, 0, R).d, c0 = -rot / STEP, cards = [];
    for (let k = 0; k < N; k++) { const gi = k + N * Math.round((c0 - k) / N), id = ids[mod(gi, ids.length)];
      const th = rad(k * STEP + rot), c = Math.cos(th), s = Math.sin(th);
      const xz = u => { const uu = (u - .5) * CW; return [R * s + uu * c, R * c - uu * s]; };
      cards.push({id, xz, d: proj(C, R * s, 0, R * c).d, facing: c}); }
    cards.sort((a, b) => b.d - a.d);
    const alpha = c => c.facing >= 0 ? 1 : .35, blur = c => 7 * DPR * Math.abs(c.d - focusD) / (2 * R);
    for (const c of cards) withBlur(blur(c) + 2 * DPR, x => surface(x, C, refl(c.id), c.xz, CH / 2 + 4 * DPR, CH * 1.5 + 4 * DPR, 22, .3 * alpha(c)));
    for (const c of cards) withBlur(blur(c), x => surface(x, C, tex(c.id), c.xz, -CH / 2, CH / 2, 22, alpha(c)));
  }
  function size() { if (!root.isConnected) { ro && ro.disconnect(); return; } if (!root.clientWidth) return; DPR = Math.min(2, devicePixelRatio || 1); W = Math.round(root.clientWidth * DPR); H = Math.round(root.clientHeight * DPR);
    cv.width = LAYER.width = W; cv.height = LAYER.height = H; CW = Math.min(W * K.frac, H * .72 / K.aspect); CH = CW * K.aspect; R = CW * (K.aspect < 1 ? 1.36 : 1.42); TEX.clear(); REFL.clear(); draw(); }
  // --- animazione a scatto (pausa + giro con ease forte, come lo "step" della skill)
  function go(to, dur = 680) { cancelAnimationFrame(raf); const from = rot, t0 = performance.now();
    const f = t => { const k = Math.min(1, (t - t0) / dur); rot = from + (to - from) * EASE(k); draw(); if (k < 1) raf = requestAnimationFrame(f); else { anim = null; onChange(ids[cur()]); } };
    anim = true; raf = requestAnimationFrame(f); }
  const snap = (dir = 0) => go((Math.round(-rot / STEP) + dir) * -STEP);
  const user = () => { lastUser = performance.now(); };
  // trascinamento
  let dragX = null, dragRot = 0, moved = 0, vx = 0, lastX = 0, lastT = 0;
  cv.addEventListener('pointerdown', e => { user(); cancelAnimationFrame(raf); dragX = e.clientX; dragRot = rot; moved = 0; vx = 0; lastX = e.clientX; lastT = performance.now(); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (dragX === null) return; const dx = e.clientX - dragX; moved = Math.max(moved, Math.abs(dx));
    const now = performance.now(); vx = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
    rot = dragRot + dx * DPR / CW * STEP * .9; draw(); });
  const end = e => { if (dragX === null) return; dragX = null; user();
    if (moved < 6) { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width; if (x > .3 && x < .7) { onPick(ids[cur()]); TEX.clear(); REFL.clear(); draw(); return; } return snap(x < .5 ? -1 : 1); }
    const fling = Math.abs(vx) > .45 ? (vx > 0 ? 1 : -1) : 0; go((Math.round(-rot / STEP) - fling) * -STEP); };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  root.querySelector('.fc-prev').onclick = () => { user(); snap(-1); };
  root.querySelector('.fc-next').onclick = () => { user(); snap(1); };
  root.tabIndex = 0; root.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { user(); snap(-1); } if (e.key === 'ArrowRight') { user(); snap(1); } if (e.key === 'Enter') onPick(ids[cur()]); });
  // giro automatico quando nessuno tocca: pausa e scatto, come nel video
  idleT = setInterval(() => { if (!root.isConnected) return clearInterval(idleT); if (!anim && dragX === null && performance.now() - lastUser > 7000 && !document.hidden) snap(1); }, 2600);
  timers.push(idleT);
  const ro = new ResizeObserver(() => size()); ro.observe(root);
  Promise.all(ids.map(figImg)).then(() => { TEX.clear(); REFL.clear(); size(); onChange(ids[cur()]); });
  size(); onChange(ids[cur()]);
  return {to: id => { const i = ids.indexOf(id); if (i >= 0) { const c = Math.round(-rot / STEP), d = mod(i - c + ids.length / 2, ids.length) - ids.length / 2; go((c + Math.round(d)) * -STEP); } }, refresh: () => { TEX.clear(); REFL.clear(); draw(); }};
}

/* ---------- PILOTA PREFERITO ---------- */
function lastResultOf(id) { for (let i = done.length - 1; i >= 0; i--) { const x = done[i].results.find(r => r.d === id); if (x) return [done[i], x]; } return null; }
function favCard(id) {
  if (!id) return `<button class="card pad tap favempty" onclick="document.querySelector('[data-tab=me]').click()"><div style="font-size:46px">⭐</div><b>Scegli il tuo pilota preferito</b><div class="small muted">tra i ${lastStand.length} piloti del mondiale 2026</div></button>`;
  const d = D[id], c = teamOf(id), col = teamCol(c), st = standOf(id), s = STAT[id], lr = lastResultOf(id);
  return `<div class="card favcard tap" data-open="driver:${id}" style="--c:${col}">
    <div class="favbg"></div><div class="favnum">${esc(d.num || '')}</div>
    <div class="favtxt"><div class="small" style="opacity:.85">⭐ Preferito · ${NAT[d.nat] || ''} ${esc(teamName(c))}</div>
      <div class="favname">${esc(d.first)} <b>${esc(d.last)}</b></div>
      <div class="favstats"><div><b>P${st ? st[2] : '–'}</b><span>mondiale</span></div><div><b>${nf(s.pts)}</b><span>punti</span></div><div><b>${s.wins}</b><span>vittorie</span></div><div><b>${s.pod}</b><span>podi</span></div></div>
      ${lr ? `<div class="small" style="opacity:.85;margin-top:8px">Ultimo GP: ${gpFlag(lr[0])} ${posTxt(lr[1]) === lr[1].pt ? 'P' + lr[1].pt : posTxt(lr[1])}${lr[1].pts ? ' · +' + nf(lr[1].pts) + ' pt' : ''}${s.dotd ? ' · ⭐ DOTD ×' + s.dotd : ''}</div>` : ''}</div>
    <div class="favfig">${figFor(id)}</div></div>`;
}
function me() {
  const teams = lastCStand.map(c => c[0]);
  const byTeam = teams.map(t => [t, lastStand.filter(s => (s[4][s[4].length - 1]) === t).map(s => s[0])]);
  const ids = lastStand.map(s => s[0]), start = Math.max(0, ids.indexOf(ME.fav));
  setView(`<div class="ltitle"><div><p>Scorri e scegli tra i ${ids.length} piloti del 2026</p><h1>Preferito</h1></div><button class="badge" id="favClear" ${ME.fav ? '' : 'hidden'}>Rimuovi</button></div>
    <div class="fcar" id="fcar"><canvas role="img" aria-label="Carosello dei piloti: scorri per sceglierne uno"></canvas>
      <button class="fc-prev glass" aria-label="Pilota precedente">‹</button><button class="fc-next glass" aria-label="Pilota successivo">›</button></div>
    <div class="fcinfo"><div id="fcName"></div><button class="btn" id="fcPick"></button></div>
    <div class="sec-h"><h2>Il tuo preferito</h2></div><div id="favTop">${favCard(ME.fav)}</div>
    <div class="sec-h"><h2>Tutti i piloti</h2><span class="small muted">per squadra</span></div>
    ${byTeam.map(([t, list], k) => `<div class="sec-h" style="margin-top:14px"><h2 style="font-size:17px"><span class="tdot" style="background:${teamCol(t)}"></span>${esc(teamName(t))}</h2></div>
      <div class="pickgrid">${list.map((id, i) => `<button class="pick ${ME.fav === id ? 'on' : ''}" style="--c:${teamCol(t)}" data-pick="${id}">
        <div class="pickfig">${figFor(id)}</div><div class="pickname"><b>${esc(D[id].last)}</b><span>#${esc(D[id].num || '')} · P${standOf(id)?.[2] ?? '–'}</span></div><i class="pickstar">★</i></button>`).join('')}</div>`).join('')}
    <p class="foot">Il preferito resta salvato su questo dispositivo, compare nella Home ed è evidenziato con ⭐ in classifica.</p>`, 'Preferito');
  let shown = ids[start];
  const info = id => { shown = id; const st = standOf(id), c = teamOf(id), isFav = ME.fav === id;
    $('#fcName').innerHTML = `<div class="small" style="color:${teamCol(c)};font-weight:700">${esc(teamName(c))} · #${esc(D[id].num || '')}</div><div class="fcn">${esc(D[id].first)} <b>${esc(D[id].last)}</b></div><div class="small muted">P${st ? st[2] : '–'} · ${nf(STAT[id].pts)} punti${CHAMP && CHAMP.id === id ? ' · 🏆 campione' : ''}</div>`;
    const b = $('#fcPick'); b.textContent = isFav ? '★ Il tuo preferito' : '⭐ Scegli come preferito'; b.classList.toggle('sec', isFav); };
  const pick = id => { ME.fav = id; saveMe(); $('#favTop').innerHTML = favCard(id); $('#favClear').hidden = false;
    document.querySelectorAll('[data-pick]').forEach(b => b.classList.toggle('on', b.dataset.pick === id)); car.refresh(); info(shown); };
  const car = favCarousel($('#fcar'), ids, start, info, pick);
  $('#fcPick').onclick = () => pick(shown);
  document.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { pick(b.dataset.pick); car.to(b.dataset.pick); $('#fcar').scrollIntoView({behavior: 'smooth', block: 'center'}); });
  $('#favClear').onclick = () => { ME.fav = null; saveMe(); $('#favTop').innerHTML = favCard(null); $('#favClear').hidden = true; document.querySelectorAll('[data-pick]').forEach(b => b.classList.remove('on')); car.refresh(); info(shown); };
}

/* ---------- avvio ---------- */
const start = (location.hash || '#home').slice(1);
go(['home', 'standings', 'races', 'tracks', 'me'].includes(start) ? start : 'home');
})();
