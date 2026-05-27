const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const os   = require('os');
const path = require('path');
const fs   = require('fs');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// ════════════════════════════════════════════════════════
//  SPØRGSMÅL  (rediger her for at ændre indhold)
// ════════════════════════════════════════════════════════

const POINTS = [100, 200, 300, 400, 500];

const CATEGORIES = [
  {
    name: "Lineære funktioner",
    questions: [
      { q: "Hvad er hældningskoefficienten <em>a</em> i&nbsp; f(x) = 3x − 7 ?",
        a: "a = 3" },
      { q: "Hvad er skæringen med y-aksen for&nbsp; f(x) = −2x + 5 ?",
        a: "b = 5 &nbsp;→&nbsp; skæringspunkt: (0, 5)" },
      { q: "Find ligningen for linjen der går gennem (0, 4) med hældning −3.",
        a: "f(x) = −3x + 4" },
      { q: "Find skæringspunktet for de to linjer:<br>f(x) = 2x + 1 &nbsp;og&nbsp; g(x) = −x + 7",
        a: "2x + 1 = −x + 7 &nbsp;⇒&nbsp; x = 2, y = 5<br><strong>Skæringspunkt: (2, 5)</strong>" },
      { q: "Find ligningen for linjen der går gennem punkterne (1, 3) og (3, 9).",
        a: "a = (9 − 3) / (3 − 1) = 3<br>b = 3 − 3·1 = 0<br><strong>f(x) = 3x</strong>" },
    ],
  },
  {
    name: "Eksponentielle funktioner",
    questions: [
      { q: "Hvad er fremskrivningsfaktoren, hvis noget vokser med 12 % om året?",
        a: "a = 1 + 0,12 = <strong>1,12</strong>" },
      { q: "En eksponentiel funktion har forskriften f(x) = 5 · 2<sup>x</sup>.<br>Hvad er f(3)?",
        a: "f(3) = 5 · 2³ = 5 · 8 = <strong>40</strong>" },
      { q: "Hvad er fordoblingskonstanten T₂ for en eksponentiel vækst på 10 % om året?<br><small>(Giv et afrundet svar)</small>",
        a: "T₂ = log(2) / log(1,1) ≈ <strong>7,3 år</strong>" },
      { q: "En bil kostede 200.000 kr. Den falder med 15 % i værdi hvert år.<br>Hvad er den værd efter 4 år?",
        a: "200.000 · 0,85⁴ ≈ 200.000 · 0,522 ≈ <strong>104.400 kr</strong>" },
      { q: "Hvornår er f(x) = 3 · 1,2<sup>x</sup> lig med 18?<br><small>(Løs for x)</small>",
        a: "1,2<sup>x</sup> = 6<br>x = log(6) / log(1,2) ≈ <strong>10,0</strong>" },
    ],
  },
  {
    name: "Andengradspolynomiet",
    questions: [
      { q: "Hvad er diskriminanten for&nbsp; x² + 6x + 9 ?",
        a: "d = 6² − 4·1·9 = 36 − 36 = <strong>0</strong><br>(Dobbeltrod)" },
      { q: "Løs ligningen:&nbsp; x² − 7x + 12 = 0",
        a: "d = 49 − 48 = 1<br>x = (7 ± 1) / 2<br><strong>x = 4 &nbsp;eller&nbsp; x = 3</strong>" },
      { q: "Find toppunktet for&nbsp; f(x) = x² − 6x + 11",
        a: "x<sub>top</sub> = −(−6) / (2·1) = 3<br>y<sub>top</sub> = 9 − 18 + 11 = 2<br><strong>Tp = (3, 2)</strong>" },
      { q: "En parabel har rødderne x = −2 og x = 4 og går gennem (0, −8).<br>Find forskriften f(x).",
        a: "f(x) = a(x + 2)(x − 4)<br>f(0) = a·2·(−4) = −8 &nbsp;⇒&nbsp; a = 1<br><strong>f(x) = x² − 2x − 8</strong>" },
      { q: "Løs ligningen:&nbsp; 3x² − 5x − 2 = 0",
        a: "d = 25 + 24 = 49<br>x = (5 ± 7) / 6<br><strong>x = 2 &nbsp;eller&nbsp; x = −⅓</strong>" },
    ],
  },
  {
    name: "Trigonometri",
    questions: [
      { q: "Hvad er værdien af sin(90°)?",
        a: "<strong>sin(90°) = 1</strong>" },
      { q: "I en retvinklet trekant er den modstående katete 4 og hypotenusen 8.<br>Find vinklen v.",
        a: "sin(v) = 4 / 8 = 0,5<br><strong>v = 30°</strong>" },
      { q: "Brug cosinusrelationen til at finde siden c,<br>når a = 5, b = 7 og C = 60°.",
        a: "c² = 5² + 7² − 2·5·7·cos(60°)<br>c² = 25 + 49 − 35 = 39<br><strong>c ≈ 6,24</strong>" },
      { q: "Find arealet af en trekant med sider a = 6, b = 8<br>og den mellemliggende vinkel C = 45°.",
        a: "T = ½ · 6 · 8 · sin(45°)<br>T = 24 · (√2/2)<br><strong>T ≈ 17,0</strong>" },
      { q: "Brug sinusrelationen til at finde vinkel B,<br>når a = 10, A = 40° og b = 7.",
        a: "sin(B) / 7 = sin(40°) / 10<br>sin(B) = 7 · sin(40°) / 10 ≈ 0,450<br><strong>B ≈ 26,7°</strong>" },
    ],
  },
  {
    name: "Potensfunktioner",
    questions: [
      { q: "Hvad er den generelle form for en potensfunktion?",
        a: "<strong>f(x) = b · x<sup>a</sup></strong><br>hvor a og b er konstanter" },
      { q: "Forenkel udtrykket:&nbsp; x⁵ / x²",
        a: "x⁵ / x² = <strong>x³</strong><br>(Potensregel: x<sup>m</sup> / x<sup>n</sup> = x<sup>m−n</sup>)" },
      { q: "En potensfunktion går gennem (1, 2) og (2, 8).<br>Find forskriften f(x).",
        a: "f(1) = b·1<sup>a</sup> = b = 2<br>f(2) = 2·2<sup>a</sup> = 8 &nbsp;⇒&nbsp; 2<sup>a</sup> = 4 &nbsp;⇒&nbsp; a = 2<br><strong>f(x) = 2x²</strong>" },
      { q: "Forenkel udtrykket:&nbsp; (x³)² · x⁻¹",
        a: "(x³)² = x⁶<br>x⁶ · x⁻¹ = <strong>x⁵</strong>" },
      { q: "En potensfunktion har eksponent a = ½.<br>Hvis f(4) = 6, hvad er så f(16)?",
        a: "f(x) = b · x<sup>½</sup><br>f(4) = b·√4 = 2b = 6 &nbsp;⇒&nbsp; b = 3<br>f(16) = 3·√16 = 3·4 = <strong>12</strong>" },
    ],
  },
  {
    name: "Formler",
    questions: [
      { q: "Hvad er formlen for arealet af en trekant?",
        a: "<strong>A = ½ · g · h</strong><br>(grundlinje × højde, divideret med 2)" },
      { q: "Hvad siger Pythagoras' sætning?",
        a: "I en retvinklet trekant:<br><strong>a² + b² = c²</strong><br>(c er hypotenusen)" },
      { q: "Skriv løsningsformlen (abc-formlen) for&nbsp; ax² + bx + c = 0.",
        a: "d = b² − 4ac<br><strong>x = (−b ± √d) / (2a)</strong>" },
      { q: "Hvad er formlen for renters rente (sammensat forrentning)?",
        a: "<strong>K<sub>n</sub> = K<sub>0</sub> · (1 + r)<sup>n</sup></strong><br>K₀ = startkapital, r = rente, n = antal perioder" },
      { q: "Skriv både sinusrelationen og cosinusrelationen.",
        a: "<strong>Sinusrelationen:</strong><br>a/sin(A) = b/sin(B) = c/sin(C)<br><br><strong>Cosinusrelationen:</strong><br>c² = a² + b² − 2ab·cos(C)" },
    ],
  },
];

// ════════════════════════════════════════════════════════
//  INDLÆS SPØRGSMÅL (fra fil hvis den findes)
// ════════════════════════════════════════════════════════

const QUESTIONS_FILE = path.join(__dirname, 'questions.json');

try {
  if (fs.existsSync(QUESTIONS_FILE)) {
    const saved = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    if (saved.categories) {
      CATEGORIES.length = 0;
      saved.categories.forEach(c => CATEGORIES.push(c));
    }
  }
} catch (e) {
  console.warn('Kunne ikke indlæse questions.json, bruger standardspørgsmål.', e.message);
}

// ── API: hent og gem spørgsmål ──────────────────────────

app.get('/api/questions', (req, res) => {
  res.json({ points: POINTS, categories: CATEGORIES });
});

app.post('/api/save-questions', (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) return res.status(400).json({ error: 'Ugyldigt format' });

  CATEGORIES.length = 0;
  categories.forEach(c => CATEGORIES.push(c));

  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify({ points: POINTS, categories: CATEGORIES }, null, 2), 'utf8');
  } catch (e) {
    return res.status(500).json({ error: 'Kunne ikke gemme filen: ' + e.message });
  }

  // Opdater alle host-klienter
  io.emit('questions-updated', { categories: CATEGORIES, points: POINTS });
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════
//  SPILTILSTAND
// ════════════════════════════════════════════════════════

let hostSocketId = null;
let teams      = new Map();  // socketId → { name, score }
let usedCells  = {};         // "col-row" → true
let currentQ   = null;       // { col, row, points, category, q, a, timerDuration, startedAt } | null
let answers    = {};         // teamName → answerText
let answerOrder = [];        // holdnavne i den rækkefølge de svarede
let timerTimeout = null;     // server-side auto-luk timer

function teamsArr() {
  return [...teams.values()]
    .map(t => ({ name: t.name, score: t.score }))
    .sort((a, b) => b.score - a.score);
}

// ════════════════════════════════════════════════════════
//  SOCKET.IO
// ════════════════════════════════════════════════════════

io.on('connection', socket => {

  // Send fuld tilstand til ny forbindelse
  socket.emit('state', {
    categories: CATEGORIES,
    points: POINTS,
    teams: teamsArr(),
    usedCells,
    currentQ,
  });

  // ── Host forbinder ──────────────────────────────────
  socket.on('host-connect', () => {
    hostSocketId = socket.id;
    socket.emit('host-ok');
    // Send eksisterende svar til host
    socket.emit('answers-update', { answers, answerOrder });
  });

  // ── Elev tilmelder hold ─────────────────────────────
  socket.on('join-team', (rawName) => {
    const name = String(rawName).trim().slice(0, 30);
    if (!name)
      return socket.emit('join-error', 'Holdnavn må ikke være tomt.');
    if ([...teams.values()].some(t => t.name.toLowerCase() === name.toLowerCase()))
      return socket.emit('join-error', 'Det holdnavn er allerede i brug.');

    teams.set(socket.id, { name, score: 0 });
    io.emit('teams-update', teamsArr());
    socket.emit('join-ok', name);

    // Send aktivt spørgsmål til nytilmeldt elev
    if (currentQ) socket.emit('question-opened', currentQ);
  });

  // ── Host åbner spørgsmål ────────────────────────────
  socket.on('open-question', ({ col, row, timerDuration }) => {
    if (socket.id !== hostSocketId) return;
    if (usedCells[`${col}-${row}`]) return;
    const entry = CATEGORIES[col]?.questions[row];
    if (!entry) return;

    const duration = Math.min(Math.max(parseInt(timerDuration) || 60, 5), 300);

    currentQ = {
      col, row,
      points:        POINTS[row],
      category:      CATEGORIES[col].name,
      q:             entry.q,
      a:             entry.a,
      timerDuration: duration,
      startedAt:     Date.now(),
    };
    answers = {};
    answerOrder = [];
    io.emit('question-opened', currentQ);
    socket.emit('answers-update', { answers, answerOrder });

    // Auto-luk når timer udløber
    clearTimeout(timerTimeout);
    timerTimeout = setTimeout(() => {
      if (!currentQ) return;
      usedCells[`${currentQ.col}-${currentQ.row}`] = true;
      currentQ = null;
      answers  = {};
      answerOrder = [];
      io.emit('used-cells-update', usedCells);
      io.emit('question-closed');
    }, duration * 1000);
  });

  // ── Elev indsender svar ─────────────────────────────
  socket.on('submit-answer', (raw) => {
    const team = teams.get(socket.id);
    if (!team || !currentQ) return;
    const answer = String(raw).trim().slice(0, 300);
    answers[team.name] = { text: answer, submittedAt: Date.now() };
    if (!answerOrder.includes(team.name)) answerOrder.push(team.name);
    socket.emit('answer-received', answer);
    if (hostSocketId) io.to(hostSocketId).emit('answers-update', { answers, answerOrder });
  });

  // ── Host afslører svar for alle ─────────────────────
  socket.on('reveal-answer', () => {
    if (socket.id !== hostSocketId || !currentQ) return;
    io.emit('answer-revealed', currentQ.a);
  });

  // ── Host tildeler/trækker point ──────────────────────
  socket.on('award-points', ({ teamName, delta }) => {
    if (socket.id !== hostSocketId) return;
    const entry = [...teams.entries()].find(([, t]) => t.name === teamName);
    if (entry) {
      entry[1].score += delta;
      io.emit('teams-update', teamsArr());
    }
  });

  // ── Host lukker spørgsmål ───────────────────────────
  socket.on('close-question', () => {
    if (socket.id !== hostSocketId) return;
    clearTimeout(timerTimeout);
    if (currentQ) {
      usedCells[`${currentQ.col}-${currentQ.row}`] = true;
      io.emit('used-cells-update', usedCells);
    }
    currentQ = null;
    answers  = {};
    answerOrder = [];
    io.emit('question-closed');
  });

  // ── Host nulstiller spillet ─────────────────────────
  socket.on('reset-game', () => {
    if (socket.id !== hostSocketId) return;
    clearTimeout(timerTimeout);
    teams.forEach(t => { t.score = 0; });
    usedCells = {};
    currentQ  = null;
    answers   = {};
    answerOrder = [];
    io.emit('game-reset');
    io.emit('teams-update', teamsArr());
  });

  // ── Frakobling ──────────────────────────────────────
  socket.on('disconnect', () => {
    if (socket.id === hostSocketId) hostSocketId = null;
    if (teams.has(socket.id)) {
      teams.delete(socket.id);
      io.emit('teams-update', teamsArr());
    }
  });
});

// ════════════════════════════════════════════════════════
//  START
// ════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║    Matematik Jeopardy - Server startet!  ║');
  console.log('╚══════════════════════════════════════════╝');

  if (process.env.PORT) {
    // Cloud-deploy (Railway, Render osv.)
    console.log('\n  Server korer pa cloud-porten ' + PORT);
    console.log('  Aaben /host.html og /player.html via din app-URL\n');
    return;
  }

  // Lokal koersel – vis IP til elever
  let localIP = 'DIN-IP';
  for (const list of Object.values(os.networkInterfaces())) {
    for (const iface of list) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }
  console.log(`\n  LAERER (host):  http://localhost:${PORT}/host.html`);
  console.log(`  ELEVER:         http://${localIP}:${PORT}/player.html\n`);
});
