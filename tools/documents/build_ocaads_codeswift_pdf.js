const PDFDocument = require('pdfkit');
const fs = require('fs');

const workspacePath = require('./workspace-path');
const OUT = workspacePath('OCAADS_CodeSwift_Submission.pdf');
const W = 960;
const H = 540;

const C = {
  bg: '#081426',
  bg2: '#0B1C2D',
  panel: '#10243A',
  panel2: '#17344D',
  white: '#F2F7FA',
  muted: '#AABCCC',
  grid: '#456277',
  teal: '#31C7B5',
  amber: '#F4B942',
  coral: '#F06464',
  blue: '#4D9DE0',
  violet: '#9278E8',
};

const doc = new PDFDocument({
  size: [W, H],
  margin: 0,
  autoFirstPage: false,
  info: {
    Title: 'OCAADS - CodeSwift Submission',
    Author: 'CodeSwift',
    Subject: 'Orbital Collision Avoidance & Anomaly Diagnosis System',
    Keywords: 'OCAADS, satellite operations, conjunction screening, anomaly diagnosis',
  },
});

doc.pipe(fs.createWriteStream(OUT));

function fill(color) { doc.fillColor(color); return doc; }
function stroke(color, width = 1) { doc.strokeColor(color).lineWidth(width); return doc; }
function rect(x, y, w, h, color) { fill(color).rect(x, y, w, h).fill(); }
function line(x1, y1, x2, y2, color = C.grid, width = 1, dash = null) {
  doc.save();
  stroke(color, width);
  if (dash) doc.dash(dash, { space: dash * 1.5 });
  doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
  doc.restore();
}
function roundRect(x, y, w, h, r, color, border = null, width = 1) {
  doc.save();
  fill(color).roundedRect(x, y, w, h, r).fill();
  if (border) stroke(border, width).roundedRect(x, y, w, h, r).stroke();
  doc.restore();
}
function circle(x, y, r, color, border = null, width = 1) {
  doc.save();
  fill(color).circle(x, y, r).fill();
  if (border) stroke(border, width).circle(x, y, r).stroke();
  doc.restore();
}
function ellipse(x, y, w, h, color, border = null, width = 1, dash = null) {
  doc.save();
  if (dash) doc.dash(dash, { space: dash * 1.5 });
  fill(color).ellipse(x, y, w, h).fill();
  if (border) stroke(border, width).ellipse(x, y, w, h).stroke();
  doc.restore();
}
function text(value, x, y, w, h, size = 12, color = C.white, font = 'Helvetica', options = {}) {
  doc.font(font).fontSize(size).fillColor(color).text(value, x, y, {
    width: w,
    height: h,
    align: options.align || 'left',
    lineGap: options.lineGap === undefined ? 1 : options.lineGap,
    characterSpacing: options.characterSpacing || 0,
    continued: false,
  });
}
function bold(value, x, y, w, h, size = 12, color = C.white, options = {}) {
  text(value, x, y, w, h, size, color, 'Helvetica-Bold', options);
}
function label(value, x, y, w, color = C.teal, options = {}) {
  bold(value.toUpperCase(), x, y, w, 14, 8.5, color, { characterSpacing: 1.3, align: options.align || 'left' });
}
function pill(value, x, y, w, color, bg = null) {
  roundRect(x, y, w, 22, 11, bg || C.panel2, color, 1);
  bold(value.toUpperCase(), x, y + 6, w, 9, 7.5, color, { align: 'center' });
}
function arrow(x1, y1, x2, y2, color = C.blue, width = 2) {
  line(x1, y1, x2, y2, color, width);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = 8;
  const left = [x2 - len * Math.cos(ang - Math.PI / 6), y2 - len * Math.sin(ang - Math.PI / 6)];
  const right = [x2 - len * Math.cos(ang + Math.PI / 6), y2 - len * Math.sin(ang + Math.PI / 6)];
  doc.save();
  fill(color).moveTo(x2, y2).lineTo(left[0], left[1]).lineTo(right[0], right[1]).closePath().fill();
  doc.restore();
}
function dot(x, y, r, color) { circle(x, y, r, color); }
function starfield(seed = 1) {
  let n = seed;
  for (let i = 0; i < 70; i += 1) {
    n = (n * 9301 + 49297) % 233280;
    const x = (n / 233280) * W;
    n = (n * 9301 + 49297) % 233280;
    const y = 46 + (n / 233280) * (H - 70);
    const r = i % 5 === 0 ? 1.1 : 0.55;
    circle(x, y, r, i % 4 === 0 ? C.grid : '#29445C');
  }
}
function earthOrbit(cx, cy, scale = 1) {
  ellipse(cx - 92 * scale, cy - 49 * scale, 184 * scale, 98 * scale, C.bg, C.blue, 1.4);
  ellipse(cx - 57 * scale, cy - 83 * scale, 114 * scale, 166 * scale, C.bg, C.violet, 1.1);
  ellipse(cx - 116 * scale, cy - 76 * scale, 232 * scale, 152 * scale, C.bg, C.teal, 0.9);
  circle(cx, cy, 27 * scale, '#1A6E9E', C.blue, 1);
  text('EARTH', cx - 25 * scale, cy - 5 * scale, 50 * scale, 12 * scale, 9 * scale, C.white, 'Helvetica-Bold', { align: 'center' });
  dot(cx + 91 * scale, cy - 35 * scale, 5 * scale, C.amber);
  dot(cx - 86 * scale, cy + 63 * scale, 5 * scale, C.coral);
}
function topBar(section, page) {
  rect(0, 0, W, 44, C.bg2);
  bold('CODESWIFT', 34, 15, 110, 12, 9, C.teal, { characterSpacing: 1.4 });
  line(150, 22, 170, 22, C.teal, 2);
  text('OCAADS', 178, 15, 72, 12, 9, C.white, 'Helvetica-Bold');
  label(section, 690, 15, 180, C.muted, { align: 'right' });
  text(`${page} / 6`, 886, 15, 36, 12, 9, C.muted, 'Helvetica', { align: 'right' });
  line(34, 45, 926, 45, C.grid, 0.5);
}
function footer(note = '') {
  line(34, 510, 926, 510, C.grid, 0.5);
  text(note, 34, 517, 740, 10, 7.5, C.muted, 'Helvetica');
  text('CodeSwift', 840, 517, 86, 10, 7.5, C.muted, 'Helvetica-Bold', { align: 'right' });
}
function page(section, page, note = '') {
  doc.addPage({ size: [W, H], margin: 0 });
  rect(0, 0, W, H, C.bg);
  starfield(page * 19 + 7);
  topBar(section, page);
  footer(note);
}
function title(value, subtitle = '') {
  bold(value, 34, 68, 730, 32, 25, C.white);
  if (subtitle) text(subtitle, 36, 106, 850, 22, 12.5, C.muted, 'Helvetica');
}
function bullet(value, x, y, w, color = C.white, accent = C.teal, size = 11.5) {
  dot(x + 4, y + 8, 3, accent);
  text(value, x + 15, y, w - 15, 22, size, color, 'Helvetica');
}
function metric(value, caption, x, y, w, accent) {
  roundRect(x, y, w, 59, 10, C.panel2, accent, 1);
  bold(value, x + 12, y + 10, w - 24, 23, 21, accent);
  text(caption, x + 12, y + 37, w - 24, 14, 8.5, C.muted, 'Helvetica');
}
function personIcon(x, y, color) {
  circle(x, y, 8, color);
  doc.save();
  stroke(color, 2);
  doc.moveTo(x - 13, y + 22).bezierCurveTo(x - 12, y + 10, x + 12, y + 10, x + 13, y + 22).stroke();
  doc.restore();
}
function smallCard(x, y, w, h, heading, body, accent) {
  roundRect(x, y, w, h, 10, C.panel, accent, 1);
  label(heading, x + 14, y + 13, w - 28, accent);
  text(body, x + 14, y + 35, w - 28, h - 44, 11, C.white, 'Helvetica');
}

// Slide 1: leave the title fields open for the submitter, but set the team name.
page('TITLE SLIDE', 1, 'Fill the title, member names, and chosen tracks before submission.');
bold('PROJECT TITLE', 54, 76, 300, 18, 10, C.teal, { characterSpacing: 1.5 });
line(54, 112, 470, 112, C.white, 1.2);
text('[ fill before submission ]', 54, 120, 320, 20, 13, C.muted, 'Helvetica-Oblique');
bold('TEAM NAME', 54, 176, 250, 18, 10, C.teal, { characterSpacing: 1.5 });
bold('CodeSwift', 54, 206, 350, 38, 32, C.white);
bold('TEAM MEMBERS + ROLES', 54, 288, 300, 18, 10, C.teal, { characterSpacing: 1.5 });
line(54, 323, 470, 323, C.white, 1.2);
line(54, 350, 470, 350, C.grid, 1);
bold('TRACKS CHOSEN', 54, 402, 250, 18, 10, C.teal, { characterSpacing: 1.5 });
line(54, 437, 470, 437, C.white, 1.2);
text('[ healthcare / AI-ML / web3 / sustainability / IoT / open innovation ]', 54, 447, 420, 20, 9, C.muted, 'Helvetica-Oblique');
earthOrbit(728, 282, 1.45);
pill('MISSION-CONTROL CONCEPT', 612, 424, 205, C.amber);
text('Evidence-first decision support\nfor small-satellite operations', 594, 459, 270, 34, 12, C.white, 'Helvetica-Bold', { align: 'center' });

// Slide 2: problem and target audience.
page('PROBLEM + AUDIENCE', 2, 'Problem context and target users derived from the OCAADS project brief.');
title('Two critical signals. Two disconnected workflows.', 'OCAADS brings them onto one investigation timeline.');

roundRect(36, 146, 532, 284, 14, C.panel, C.grid, 1);
label('THE BROKEN WORKFLOW', 60, 166, 260, C.coral);
smallCard(60, 196, 222, 96, 'COLLISION AVOIDANCE', 'Review CDMs and orbital data\nRank close approaches\nDecide whether to act', C.amber);
smallCard(322, 196, 222, 96, 'ANOMALY DIAGNOSIS', 'Inspect telemetry plots\nCheck weather and history\nFind a probable cause', C.coral);
arrow(282, 244, 316, 244, C.grid, 1.4);
text('Today, the operator manually joins the evidence.', 72, 322, 460, 20, 13, C.white, 'Helvetica-Bold', { align: 'center' });
bullet('Slow investigation: hours to days', 84, 362, 430, C.white, C.amber, 11.5);
bullet('Fragmented evidence across tools and teams', 84, 386, 430, C.white, C.coral, 11.5);
bullet('Small operators lack expensive mission-control tooling', 84, 410, 430, C.white, C.violet, 11.5);

label('OPERATIONAL CONTEXT', 608, 151, 220, C.blue);
metric('11,000+', 'active satellites / growing traffic*', 608, 178, 155, C.blue);
metric('1.2M+', 'tracked debris objects / project context*', 778, 178, 155, C.amber);
roundRect(608, 252, 325, 177, 14, C.panel2, C.teal, 1);
label('TARGET USERS', 632, 273, 160, C.teal);
personIcon(643, 314, C.teal); bold('University / CubeSat teams', 665, 300, 225, 18, 12, C.white); text('Need accessible operations support', 665, 322, 230, 17, 10, C.muted);
personIcon(643, 360, C.amber); bold('Small commercial operators', 665, 346, 225, 18, 12, C.white); text('Need protect mission life and fuel', 665, 368, 230, 17, 10, C.muted);
personIcon(643, 406, C.violet); bold('Research / government missions', 665, 392, 225, 18, 12, C.white); text('Need a shared investigation view', 665, 414, 230, 17, 10, C.muted);
pill('B2B / MISSION OPERATIONS', 608, 447, 190, C.teal);
text('*Context figures from the project brief; verify the latest official release before final submission.', 608, 478, 325, 18, 7.2, C.muted, 'Helvetica-Oblique');

// Slide 3: unique solution.
page('UNIQUE SOLUTION', 3, 'The novelty is the connection between orbital risk and spacecraft health.');
title('One spacecraft. One timeline. Actionable evidence.', 'OCAADS turns disconnected signals into a transparent investigation workflow.');

label('CORE WORKFLOW', 52, 151, 160, C.teal);
const flow = [
  ['OBSERVE', 'Orbit +\ntelemetry', C.blue],
  ['DETECT', 'Close approach\n+ anomaly', C.coral],
  ['CORRELATE', 'Same spacecraft\n+ same timeline', C.violet],
  ['DIAGNOSE', 'Rules +\n evidence', C.amber],
  ['DECIDE', 'Review +\n what-if', C.teal],
];
flow.forEach((f, i) => {
  const x = 50 + i * 177;
  roundRect(x, 184, 142, 74, 12, C.panel2, f[2], 1);
  circle(x + 20, 207, 7, f[2]);
  bold(f[0], x + 36, 197, 94, 15, 10, f[2]);
  text(f[1], x + 15, 223, 112, 28, 10.5, C.white, 'Helvetica');
  if (i < flow.length - 1) arrow(x + 145, 221, x + 169, 221, C.grid, 1.5);
});

roundRect(50, 292, 400, 148, 14, C.panel, C.grid, 1);
label('KEY FEATURES', 72, 314, 160, C.blue);
bullet('SGP4-based seven-day conjunction screening', 72, 344, 350, C.white, C.blue, 11.2);
bullet('Isolation Forest anomaly scoring on telemetry', 72, 369, 350, C.white, C.coral, 11.2);
bullet('Time-window correlation with orbital context', 72, 394, 350, C.white, C.violet, 11.2);
bullet('Rule-based diagnosis with evidence and uncertainty', 72, 419, 350, C.white, C.amber, 11.2);

roundRect(480, 292, 429, 148, 14, C.panel, C.teal, 1);
label('WHY IT IS DIFFERENT', 504, 314, 200, C.teal);
bold('Existing alternatives', 504, 346, 160, 16, 10, C.muted);
bold('OCAADS', 738, 346, 150, 16, 10, C.teal);
line(504, 369, 884, 369, C.grid, 0.7);
text('Orbital data + telemetry handled separately', 504, 382, 215, 35, 10.5, C.muted);
text('One evidence chain around the spacecraft', 738, 382, 150, 35, 10.5, C.white, 'Helvetica-Bold');
text('Expensive tools or expert-only workflows', 504, 418, 215, 20, 10.5, C.muted);
text('Open data + explainable prototype', 738, 418, 150, 20, 10.5, C.white, 'Helvetica-Bold');
pill('NOVELTY: LINKS A TELEMETRY ANOMALY TO ORBITAL CONTEXT', 50, 463, 470, C.amber);
text('Human-in-the-loop: OCAADS prioritizes investigation; it does not claim autonomous control.', 535, 468, 370, 18, 9.3, C.muted, 'Helvetica-Oblique', { align: 'right' });

// Slide 4: technology stack and architecture.
page('TECH STACK + ARCHITECTURE', 4, 'MVP architecture: small, testable, reproducible, and offline-capable.');
title('A deliberately minimal stack for a defensible prototype.', 'Use established orbital and ML libraries; keep the data contracts explicit.');

roundRect(36, 148, 254, 318, 14, C.panel, C.grid, 1);
label('TECH STACK', 58, 172, 160, C.teal);
const stackGroups = [
  ['FRONTEND', 'React + TypeScript\nRecharts / 2D plots', C.teal],
  ['BACKEND', 'Python + FastAPI\nPydantic contracts', C.blue],
  ['ANALYTICS', 'SGP4 / Skyfield\nNumPy + pandas\nscikit-learn', C.violet],
  ['DATA', 'SQLite / file fixtures\nPostgreSQL later', C.amber],
];
stackGroups.forEach((g, i) => {
  const y = 205 + i * 61;
  label(g[0], 58, y, 100, g[2]);
  text(g[1], 58, y + 17, 205, 38, 10.2, C.white, 'Helvetica');
});

label('ARCHITECTURE', 330, 150, 180, C.blue);
const sources = [
  ['CelesTrak', C.blue], ['ESA / NASA\ntelemetry', C.teal], ['NOAA SWPC\noptional', C.amber],
];
sources.forEach((s, i) => {
  const x = 340 + i * 180;
  roundRect(x, 185, 150, 48, 10, C.panel2, s[1], 1);
  text(s[0], x + 10, 198, 130, 23, 10.5, C.white, 'Helvetica-Bold', { align: 'center' });
  arrow(x + 75, 236, x + 75, 252, C.grid, 1.3);
});
roundRect(375, 252, 448, 47, 10, C.panel2, C.teal, 1);
bold('INGEST + NORMALIZE', 393, 267, 154, 16, 10.5, C.teal);
text('fetch  |  validate  |  cache  |  align time + units', 555, 268, 250, 15, 10, C.white);
arrow(599, 301, 599, 318, C.grid, 1.5);
const engines = [
  ['ORBITAL ENGINE', 'SGP4\nseparation + TCA', C.blue],
  ['TELEMETRY / ML', 'features\nIsolation Forest', C.coral],
  ['DIAGNOSIS', 'time window\nrules + evidence', C.violet],
];
engines.forEach((e, i) => {
  const x = 330 + i * 191;
  roundRect(x, 321, 165, 62, 10, C.panel2, e[2], 1);
  label(e[0], x + 12, 335, 140, e[2], { align: 'center' });
  text(e[1], x + 12, 354, 140, 25, 10, C.white, 'Helvetica', { align: 'center' });
  arrow(x + 82, 386, x + 82, 403, C.grid, 1.5);
});
roundRect(420, 405, 360, 46, 10, C.panel2, C.amber, 1);
bold('FASTAPI APPLICATION API', 442, 420, 174, 16, 10.5, C.amber);
text('typed JSON endpoints + offline fallback', 620, 420, 142, 15, 9.5, C.white, 'Helvetica');
arrow(600, 453, 600, 465, C.grid, 1.4);
roundRect(430, 466, 340, 32, 9, C.panel2, C.teal, 1);
text('REACT OPERATOR DASHBOARD  |  tables + charts + evidence', 445, 476, 310, 12, 9.5, C.white, 'Helvetica-Bold', { align: 'center' });

// Slide 5: feasibility and showstoppers.
page('FEASIBILITY + SHOWSTOPPERS', 5, 'Build the connected vertical slice first; cut advanced scope before cutting integration.');
title('Feasible because the MVP is bounded and library-led.', 'The full vision is ambitious; the hackathon prototype is intentionally smaller.');

label('FEASIBILITY', 42, 150, 120, C.teal);
metric('36 h', 'focused hackathon target', 42, 176, 124, C.teal);
metric('4', 'clear team workstreams', 180, 176, 124, C.blue);
metric('100', 'comparison objects / demo set', 318, 176, 124, C.violet);
metric('OFFLINE', 'cached-data fallback', 456, 176, 124, C.amber);
roundRect(42, 258, 538, 193, 14, C.panel, C.grid, 1);
label('BUILD PATH', 66, 281, 130, C.blue);
const phases = [
  ['1', 'FOUNDATION', 'freeze data + API contracts', C.blue],
  ['2', 'DETECTION', 'SGP4 screening + telemetry score', C.coral],
  ['3', 'CORRELATION', 'time window + rule-based diagnosis', C.violet],
  ['4', 'DEMO HARDENING', 'dashboard + offline replay', C.teal],
];
phases.forEach((p, i) => {
  const y = 315 + i * 31;
  circle(78, y + 7, 9, p[3]);
  bold(p[0], 73, y + 2, 10, 12, 8, C.bg, { align: 'center' });
  bold(p[1], 100, y, 150, 16, 10, p[3]);
  text(p[2], 254, y, 290, 16, 10.5, C.white);
  if (i < 3) line(78, y + 16, 78, y + 28, C.grid, 1);
});

label('SHOWSTOPPERS + MITIGATIONS', 614, 150, 260, C.coral);
const risks = [
  ['External API failure', 'Cache orbital inputs; ship offline fixture', C.blue],
  ['Wrong units / frames', 'Use established libraries + sanity tests', C.amber],
  ['False positives', 'Evaluate a labelled / inspected subset', C.coral],
  ['Scope creep', 'Defer Pc, deep learning, live streaming, 3D', C.violet],
];
risks.forEach((r, i) => {
  const y = 178 + i * 67;
  roundRect(614, y, 310, 54, 10, C.panel2, r[2], 1);
  bold(r[0], 630, y + 10, 130, 15, 10, r[2]);
  text(r[1], 766, y + 9, 143, 30, 9.5, C.white, 'Helvetica');
});
roundRect(614, 459, 310, 40, 10, '#241A2B', C.amber, 1);
text('Prototype assessment, not certified flight software.', 628, 472, 282, 14, 10, C.amber, 'Helvetica-Bold', { align: 'center' });

// Slide 6: USP, business model, and compact references.
page('USP + BUSINESS MODEL', 6, 'References are consolidated here to honor the six-slide submission limit.');
title('Accessible mission-control decision support, built around evidence.', 'OCAADS is designed for small operators who need clarity without enterprise-only tooling.');

roundRect(38, 148, 414, 214, 14, C.panel, C.teal, 1);
label('USP / UNIQUE SELLING PROPOSITION', 62, 172, 300, C.teal);
bold('Connect the "where"\nwith the "how is it behaving?"', 62, 203, 340, 56, 21, C.white);
text('One workflow links orbital close approaches, telemetry anomalies, and contextual evidence so an operator can investigate faster and explain the next action.', 62, 277, 350, 47, 11.5, C.muted);
pill('OPEN DATA', 62, 337, 84, C.blue);
pill('EXPLAINABLE', 156, 337, 100, C.violet);
pill('HUMAN-IN-THE-LOOP', 266, 337, 142, C.amber);

roundRect(478, 148, 446, 214, 14, C.panel, C.amber, 1);
label('BUSINESS MODEL', 502, 172, 180, C.amber);
const model = [
  ['CUSTOMERS', 'Universities\nCubeSat teams\nSmall operators'],
  ['REVENUE', 'Per-satellite SaaS\nIllustrative: $500-$5,000 / month*'],
  ['SUSTAINABILITY', 'Tiered analytics\nOnboarding + support\nEnterprise integrations'],
];
model.forEach((m, i) => {
  const x = 502 + i * 136;
  circle(x + 11, 221, 7, [C.teal, C.amber, C.violet][i]);
  label(m[0], x + 27, 214, 104, [C.teal, C.amber, C.violet][i]);
  text(m[1], x, 245, 120, 66, 10.2, C.white, 'Helvetica');
  if (i < 2) arrow(x + 121, 226, x + 134, 226, C.grid, 1.1);
});
text('*Pricing is a validation hypothesis, not a final quote.', 502, 333, 390, 15, 8, C.muted, 'Helvetica-Oblique');

roundRect(38, 382, 886, 113, 12, C.panel2, C.grid, 1);
label('SELECTED REFERENCES', 60, 399, 180, C.blue);
const refs = [
  'CelesTrak - orbital elements: celestrak.org/NORAD/elements/',
  'ESA - Space Environment Report: esa.int/Space_Safety/Space_Debris',
  'Space-Track - tracking data: space-track.org/',
  'SGP4 Python library: pypi.org/project/sgp4/',
  'scikit-learn Isolation Forest: scikit-learn.org/.../IsolationForest.html',
  'NOAA SWPC - space weather: swpc.noaa.gov/',
];
refs.forEach((r, i) => {
  const col = i < 3 ? 60 : 492;
  const row = i % 3;
  dot(col + 4, 430 + row * 19, 2.5, i < 3 ? C.blue : C.teal);
  text(`[${i + 1}] ${r}`, col + 12, 423 + row * 19, 390, 14, 8.2, C.white, 'Helvetica');
});

doc.end();
