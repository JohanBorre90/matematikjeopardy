# Matematik Jeopardy – Projektlog

## Oversigt

Et multiplayer Jeopardy-spil til matematikundervisning i 1g.
Læreren styrer spillet fra én computer; eleverne deltager via deres egne enheder i realtid.

**Teknologistak:**
- Node.js + Express (server)
- Socket.io (realtidskommunikation via WebSockets)
- Vanilla HTML/CSS/JavaScript (klient)
- Railway (cloud-hosting)
- GitHub: https://github.com/JohanBorre90/matematikjeopardy

---

## Filer

| Fil | Beskrivelse |
|-----|-------------|
| `server.js` | Node.js-server. Håndterer spiltilstand, timer og Socket.io-events |
| `host.html` | Lærerens side: spilbræt, holdsvar, pointtildeling |
| `player.html` | Elevernes side: tilmelding, spørgsmål, svarindsendelse |
| `edit.html` | Redigeringsside: rediger spørgsmål og kategorier i browseren |
| `index.html` | Standalone offline-version (ingen server nødvendig) |
| `questions.json` | Gemte spørgsmål (oprettes automatisk ved første gemning i edit.html) |
| `package.json` | Node.js-afhængigheder (express, socket.io) |
| `start.bat` | Windows-genvej til lokal opstart |

---

## Spilflow

1. Lærer åbner `host.html` → forbinder som host via Socket.io
2. Elever åbner `player.html` → indtaster holdnavn → tilmeldes spillet
3. Lærer vælger spørgsmål på brættet → spørgsmål udsendes til alle
4. Nedtælingstimer starter (konfigurérbar, standard 60 sek)
5. Elever indsender svar fra deres enhed
6. Lærer kan se status (har svaret / afventer) og afsløre svar med "Vis holds svar"
7. Lærer klikker "Vis facit" → korrekt svar vises på alle skærme
8. Lærer tildeler/trækker point per hold med +/− knapper
9. Spørgsmålet lukkes manuelt eller automatisk når timer udløber

---

## Versionshistorik

### v1.0 – 2026-05-26
**Første version – standalone offline-quiz**
- Oprettet `index.html` med komplet Jeopardy-spil uden server
- 6 kategorier × 5 point-niveauer (100–500)
- Scoretavle for 3 hold med manuel point-tildeling
- Modal til visning af spørgsmål og svar
- Nulstil-funktion

**Matematikindhold (1g niveau):**
- Lineære funktioner
- Eksponentielle funktioner
- Andengradspolynomiet og andengradsligninger
- Trigonometri
- Potensfunktioner
- Formler (generel kategori)

---

### v2.0 – 2026-05-26
**Multiplayer – realtidssynkronisering via Socket.io**
- Ny `server.js` med Express + Socket.io
- Ny `host.html` (lærervisning med holdsvar-panel)
- Ny `player.html` (elevvisning, mobiltilpasset)
- Spiltilstand styres af serveren (enkelt kilde til sandhed)
- Hold tilmelder sig med navn – afvises ved dubletter
- Spørgsmål åbnes af lærer, udsendes til alle tilsluttede enheder
- Svar modtages og vises kun hos læreren
- "Vis facit" sender det korrekte svar til alle elevers skærme
- Point-tildeling (+/−) opdaterer scoretavlen live på alle enheder
- Deployet til Railway (cloud) via GitHub-integration

**Socket.io events (server ↔ klient):**
- `host-connect` / `host-ok`
- `join-team` / `join-ok` / `join-error`
- `open-question` / `question-opened`
- `submit-answer` / `answer-received` / `answers-update`
- `reveal-answer` / `answer-revealed`
- `award-points` / `teams-update`
- `close-question` / `question-closed` / `used-cells-update`
- `reset-game` / `game-reset`
- `state` (fuld spiltilstand ved forbindelse)

---

### v2.1 – 2026-05-26
**Nedtælingstimer**
- Timeren styres af serveren (`setTimeout`) – alle klienter er synkroniserede
- Varighed konfigurérbar af lærer (5–300 sek, standard 60)
- Spørgsmål lukkes automatisk på serveren når timer udløber
- Visuel nedtælling med farveovergang: grøn → gul (≤15 sek) → rød (≤5 sek)
- Timer vises hos lærer (i spørgsmålspanelet) og elever (ved spørgsmålsteksten)
- `startedAt` (Unix-timestamp) sendes med spørgsmålet så alle klienter kan beregne resterende tid korrekt – også ved sen tilslutning

---

### v2.2 – 2026-05-26
**UX-forbedringer i lærer-panelet**
- Holdsvar skjules som standard; lærer afslører dem med "Vis holds svar"-knap
- Knappen skifter tekst til "Skjul holds svar" ved klik
- Status vises altid: "Har svaret" (grøn) / "Afventer..." (grå)
- "Vis svar for alle" omdøbt til "Vis facit"

---

### v2.3 – 2026-05-26
**Redigeringsside**
- Ny `edit.html` tilgængelig på `/edit.html`
- Alle kategorinavne og spørgsmål/svar kan redigeres direkte i browseren
- Gemmer til `questions.json` på serveren via `POST /api/save-questions`
- Serveren indlæser `questions.json` ved opstart (falder tilbage til standardspørgsmål hvis filen ikke findes)
- Host-brættet opdateres live når ændringer gemmes (`questions-updated` event)
- Formattering med HTML understøttes (`<sup>`, `<sub>`, `<strong>`, `<br>` osv.)

**Nye server-endpoints:**
- `GET /api/questions` – returnerer aktuelle kategorier og point
- `POST /api/save-questions` – gemmer nye spørgsmål og broadcaster opdatering

---

## Kendte begrænsninger

- **Filpersistens på Railway:** `questions.json` gemmes på Railway's filsystem, som nulstilles ved re-deploy. Overvej en ekstern database (f.eks. Railway's PostgreSQL eller en gratis MongoDB Atlas) for permanent lagring af redigerede spørgsmål.
- **Ingen autentificering:** `host.html` og `edit.html` er ikke adgangskodebeskyttede. Det forudsættes at kun læreren kender/tilgår disse URL'er.
- **Én host ad gangen:** Hvis en ny browser forbinder som host, overtager den host-rollen. Den forrige host mister styring.
- **Hold-genforbindelse:** Hvis en elevs browser lukker under et spil, skal holdet tilmelde sig igen med samme navn.
