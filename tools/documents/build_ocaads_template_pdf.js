const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const workspacePath = require('./workspace-path');
const OUT = workspacePath('OCAADS_CodeSwift_Submission.pdf');
const W = 960;
const H = 540;
const PAGE_DIR = workspacePath(
  '.opencode', 'omnirush', 'inbox', 'pdf-pages',
  'f5e7ad8cd9cd94c9-c4739bc9-2b7e-42d9-8774-45ed0ebde2b4'
);

const C = {
  navy: '#14263D',
  navy2: '#203B5A',
  blue: '#2C78B8',
  sky: '#DCECF7',
  orange: '#D35400',
  orange2: '#F28C28',
  teal: '#0D9386',
  red: '#C94F5A',
  violet: '#6950A4',
  ink: '#1D2732',
  gray: '#596673',
  light: '#F7F9FC',
  line: '#CBD5DF',
  white: '#FFFFFF',
};

const doc = new PDFDocument({
  size: [W, H],
  margin: 0,
  autoFirstPage: false,
  info: {
    Title: 'OCAADS - CodeSwift CodeSlayer 2K26 Submission',
    Author: 'CodeSwift',
    Subject: 'Orbital Collision Avoidance & Anomaly Diagnosis System',
  },
});

doc.pipe(fs.createWriteStream(OUT));

function fill(color) { doc.fillColor(color); return doc; }
function stroke(color, width = 1) { doc.strokeColor(color).lineWidth(width); return doc; }
function rect(x, y, w, h, color) { fill(color).rect(x, y, w, h).fill(); }
function rounded(x, y, w, h, r, color, border = null, width = 1) {
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
function line(x1, y1, x2, y2, color = C.line, width = 1, dash = null) {
  doc.save();
  if (dash) doc.dash(dash, { space: dash * 1.5 });
  stroke(color, width).moveTo(x1, y1).lineTo(x2, y2).stroke();
  doc.restore();
}
function arrow(x1, y1, x2, y2, color = C.blue, width = 1.8) {
  line(x1, y1, x2, y2, color, width);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 7;
  const a = [x2 - len * Math.cos(angle - Math.PI / 6), y2 - len * Math.sin(angle - Math.PI / 6)];
  const b = [x2 - len * Math.cos(angle + Math.PI / 6), y2 - len * Math.sin(angle + Math.PI / 6)];
  doc.save();
  fill(color).moveTo(x2, y2).lineTo(a[0], a[1]).lineTo(b[0], b[1]).closePath().fill();
  doc.restore();
}
function text(value, x, y, w, h, size = 12, color = C.ink, font = 'Helvetica', options = {}) {
  doc.font(font).fontSize(size).fillColor(color).text(value, x, y, {
    width: w,
    height: h,
    align: options.align || 'left',
    lineGap: options.lineGap === undefined ? 1 : options.lineGap,
    characterSpacing: options.characterSpacing || 0,
  });
}
function bold(value, x, y, w, h, size = 12, color = C.ink, options = {}) {
  text(value, x, y, w, h, size, color, 'Helvetica-Bold', options);
}
function small(value, x, y, w, color = C.gray, options = {}) {
  bold(value.toUpperCase(), x, y, w, 12, 8.3, color, { characterSpacing: 1.1, align: options.align || 'left' });
}
function bullet(value, x, y, w, accent = C.orange, size = 11.5, color = C.ink) {
  circle(x + 4, y + 8, 3, accent);
  text(value, x + 15, y, w - 15, 22, size, color);
}
function chip(value, x, y, w, color = C.blue, bg = C.white) {
  rounded(x, y, w, 21, 10, bg, color, 1);
  bold(value.toUpperCase(), x, y + 6, w, 9, 7.2, color, { align: 'center' });
}
function node(value, x, y, w, h, color = C.blue, sub = '') {
  rounded(x, y, w, h, 10, C.white, color, 1.6);
  circle(x + 18, y + 17, 6, color);
  bold(value, x + 32, y + 10, w - 42, 15, 9.5, color);
  if (sub) text(sub, x + 14, y + 31, w - 24, h - 35, 9.5, C.gray);
}
function metric(value, caption, x, y, w, accent = C.blue) {
  rounded(x, y, w, 58, 10, C.sky, accent, 1);
  bold(value, x + 10, y + 9, w - 20, 24, 20, accent);
  text(caption, x + 10, y + 36, w - 20, 18, 8.2, C.gray);
}
function iconSatellite(x, y, color = C.blue, scale = 1) {
  rect(x - 8 * scale, y - 7 * scale, 16 * scale, 14 * scale, C.white);
  stroke(color, 1.4).rect(x - 8 * scale, y - 7 * scale, 16 * scale, 14 * scale).stroke();
  rect(x - 24 * scale, y - 5 * scale, 12 * scale, 10 * scale, C.sky);
  rect(x + 12 * scale, y - 5 * scale, 12 * scale, 10 * scale, C.sky);
  stroke(color, 1).moveTo(x - 24 * scale, y - 5 * scale).lineTo(x - 12 * scale, y - 5 * scale).stroke();
  stroke(color, 1).moveTo(x + 12 * scale, y - 5 * scale).lineTo(x + 24 * scale, y - 5 * scale).stroke();
  line(x, y + 7 * scale, x, y + 15 * scale, color, 1);
}
function iconRadar(x, y, color = C.orange) {
  circle(x, y, 28, C.white, color, 1.2);
  circle(x, y, 18, C.white, color, 0.8);
  circle(x, y, 8, C.white, color, 0.8);
  line(x, y, x + 22, y - 14, color, 1.8);
  dot(x + 22, y - 14, 3.2, color);
}
function dot(x, y, r, color) { circle(x, y, r, color); }
function dotGrid(x, y, w, h, step = 18) {
  for (let xx = x; xx < x + w; xx += step) line(xx, y, xx, y + h, '#E8EEF4', 0.4);
  for (let yy = y; yy < y + h; yy += step) line(x, yy, x + w, yy, '#E8EEF4', 0.4);
}
function earthGraphic(cx, cy, scale = 1) {
  ellipse(cx - 80 * scale, cy - 43 * scale, 160 * scale, 86 * scale, C.white, C.blue, 1.4);
  ellipse(cx - 48 * scale, cy - 70 * scale, 96 * scale, 140 * scale, C.white, C.violet, 1.1);
  ellipse(cx - 100 * scale, cy - 65 * scale, 200 * scale, 130 * scale, C.white, C.teal, 0.9);
  circle(cx, cy, 25 * scale, '#B9DDF1', C.blue, 1);
  text('EARTH', cx - 23 * scale, cy - 5 * scale, 46 * scale, 12 * scale, 8.5 * scale, C.navy, 'Helvetica-Bold', { align: 'center' });
  dot(cx + 81 * scale, cy - 30 * scale, 4.5 * scale, C.orange2);
  dot(cx - 75 * scale, cy + 52 * scale, 4.5 * scale, C.red);
}
function overlayTeamName() {
  // The template's original oval is preserved underneath; this only replaces its placeholder text.
  doc.save();
  fill(C.white).ellipse(18, 94, 170, 56).fill();
  stroke('#7B858E', 0.8).ellipse(18, 94, 170, 56).stroke();
  doc.restore();
  bold('CodeSwift', 18, 112, 170, 18, 19, C.navy, { align: 'center' });
}
function background(pageNumber) {
  const ext = pageNumber === 1 ? 'jpg' : 'png';
  const file = path.join(PAGE_DIR, `page-${String(pageNumber).padStart(3, '0')}.${ext}`);
  doc.addPage({ size: [W, H], margin: 0 });
  doc.image(file, 0, 0, { width: W, height: H });
  overlayTeamName();
  // Preserve the template title bar and organizer marks, while clearing the placeholder body.
  rect(0, 171, W, 369, C.light);
  line(0, 171, W, 171, '#D6DEE7', 0.7);
}
function pageFoot(note, pageNumber) {
  line(44, 519, 916, 519, '#D6DEE7', 0.7);
  text(note, 46, 523, 760, 10, 7.2, C.gray, 'Helvetica');
  bold(`CodeSwift  |  ${pageNumber}/7`, 816, 523, 98, 10, 7.2, C.gray, { align: 'right' });
}
function sectionTitle(value, x = 46, y = 188, w = 500) {
  bold(value, x, y, w, 24, 17, C.orange);
  line(x, y + 28, x + Math.min(w, 235), y + 28, C.orange2, 2.2);
}
function panel(x, y, w, h, border = C.line, fillColor = C.white) {
  rounded(x, y, w, h, 12, fillColor, border, 1);
}

// Slide 1: leave all submitter details blank except the requested team name.
background(1);
sectionTitle('PROJECT DETAILS', 52, 194, 350);
small('Project title', 60, 234, 180, C.orange);
line(60, 258, 445, 258, C.navy, 1.1);
small('Team name', 60, 284, 180, C.orange);
bold('CodeSwift', 60, 303, 330, 28, 24, C.navy);
small('Team members + roles', 60, 350, 250, C.orange);
line(60, 375, 445, 375, C.navy, 1.1);
line(60, 400, 445, 400, C.line, 1);
small('Tracks chosen', 60, 432, 180, C.orange);
line(60, 456, 445, 456, C.navy, 1.1);
text('[ fill before submission ]', 60, 465, 250, 13, 8.5, C.gray, 'Helvetica-Oblique');
panel(535, 197, 365, 271, C.sky, C.white);
small('Project visual placeholder', 560, 220, 250, C.blue);
earthGraphic(715, 334, 1.15);
chip('Evidence-first mission control', 615, 431, 200, C.orange);
text('Leave this slide editable for the\nfinal project title, member names, and tracks.', 571, 458, 290, 24, 9.4, C.gray, 'Helvetica-Oblique', { align: 'center' });
pageFoot('Title fields intentionally left open for the team to complete.', 1);

// Slide 2: problem statement and target audience.
background(2);
sectionTitle('PROBLEM WE ARE SOLVING', 46, 188, 430);
sectionTitle('TARGET USERS', 644, 188, 250);
panel(46, 227, 560, 255, C.line, C.white);
small('The broken workflow', 68, 249, 220, C.red);
node('COLLISION AVOIDANCE', 68, 281, 220, 66, C.orange2, 'CDMs + orbital data\nmanual risk ranking');
node('ANOMALY DIAGNOSIS', 360, 281, 220, 66, C.red, 'telemetry plots + weather\nmanual root-cause search');
arrow(289, 314, 350, 314, C.navy2, 1.4);
bold('The operator has to join the evidence by hand.', 90, 365, 470, 20, 13, C.navy, { align: 'center' });
bullet('Close approaches can be buried among many objects.', 70, 402, 500, C.orange2, 10.4);
bullet('Telemetry anomalies are hard to interpret in isolation.', 70, 424, 500, C.red, 10.4);
bullet('Small teams lack the specialist tools used by large missions.', 70, 446, 500, C.violet, 10.4);

metric('11,000+', 'active satellites', 642, 227, 128, C.blue);
metric('1.2M+', 'tracked debris*', 784, 227, 128, C.orange2);
panel(642, 303, 270, 179, C.sky, C.blue);
small('Primary B2B audience', 662, 325, 210, C.blue);
iconSatellite(675, 365, C.blue, 0.65);
bold('University + CubeSat teams', 700, 353, 190, 16, 10.2, C.navy);
text('Accessible operations support', 700, 371, 190, 14, 9, C.gray);
iconSatellite(675, 408, C.orange2, 0.65);
bold('Small commercial operators', 700, 396, 190, 16, 10.2, C.navy);
text('Protect mission life and fuel', 700, 414, 190, 14, 9, C.gray);
iconSatellite(675, 451, C.violet, 0.65);
bold('Research / government missions', 700, 439, 190, 16, 10.2, C.navy);
text('Shared investigation view', 700, 457, 190, 14, 9, C.gray);
text('*Context figures from the project brief; verify the latest official release before submission.', 642, 489, 270, 14, 6.8, C.gray, 'Helvetica-Oblique');
pageFoot('OCAADS targets operators and systems engineers in small-satellite mission operations.', 2);

// Slide 3: unique solution.
background(3);
sectionTitle('KEY FEATURES', 46, 188, 360);
sectionTitle('WHY IT IS DIFFERENT', 560, 188, 340);
panel(46, 227, 440, 255, C.line, C.white);
small('Observe -> detect -> correlate -> diagnose -> decide', 68, 248, 380, C.teal);
const flow = [
  ['OBSERVE', 'orbit +\ntelemetry', C.blue],
  ['DETECT', 'close approach\n+ anomaly', C.red],
  ['CORRELATE', 'same spacecraft\n+ same timeline', C.violet],
  ['DIAGNOSE', 'rules +\n evidence', C.orange2],
  ['DECIDE', 'review +\n what-if', C.teal],
];
flow.forEach((f, i) => {
  const x = 64 + (i % 3) * 134;
  const y = i < 3 ? 286 : 376;
  node(f[0], x, y, 118, 57, f[2], f[1]);
  if (i === 0 || i === 1) arrow(x + 120, y + 29, x + 130, y + 29, C.line, 1.2);
  if (i === 2) arrow(123, 348, 123, 367, C.line, 1.2);
  if (i === 3) arrow(x + 120, y + 29, x + 130, y + 29, C.line, 1.2);
});
bullet('SGP4-based seven-day conjunction screening', 68, 449, 390, C.blue, 9.3);
bullet('Isolation Forest anomaly scoring on telemetry', 68, 468, 390, C.red, 9.3);

panel(560, 227, 352, 255, C.orange2, C.white);
small('The novelty is the evidence chain', 582, 249, 300, C.orange);
iconRadar(612, 302, C.orange);
bold('Where is the satellite?', 656, 283, 220, 17, 11.3, C.navy);
text('Orbital propagation finds nearby objects and time of closest approach.', 656, 303, 215, 30, 9.2, C.gray);
iconSatellite(612, 376, C.red, 0.75);
bold('How is it behaving?', 656, 358, 220, 17, 11.3, C.navy);
text('Telemetry scoring flags unusual behavior and passes the event to diagnosis.', 656, 378, 215, 30, 9.2, C.gray);
line(612, 333, 612, 358, C.orange2, 1.4, 3);
chip('Open data + explainable rules', 595, 427, 235, C.teal);
text('Unlike siloed tools, OCAADS connects both answers around the same spacecraft.', 582, 453, 298, 30, 8.8, C.gray, 'Helvetica-Bold', { align: 'center' });
pageFoot('Unique capability: link a telemetry anomaly to relevant orbital context without overclaiming causation.', 3);

// Slide 4: technology stack and architecture.
background(4);
sectionTitle('TECH STACK', 46, 188, 250);
sectionTitle('ARCHITECTURE', 365, 188, 480);
panel(46, 227, 272, 255, C.line, C.white);
small('Frontend', 68, 249, 220, C.teal);
bold('React + TypeScript', 68, 269, 220, 17, 11, C.navy);
text('Tables, charts, evidence view', 68, 287, 210, 16, 9.2, C.gray);
small('Backend', 68, 319, 220, C.blue);
bold('Python + FastAPI', 68, 339, 220, 17, 11, C.navy);
text('Typed REST endpoints', 68, 357, 210, 16, 9.2, C.gray);
small('Analytics', 68, 389, 220, C.violet);
bold('SGP4 / Skyfield', 68, 409, 220, 17, 11, C.navy);
text('NumPy + pandas + scikit-learn', 68, 427, 215, 16, 9.2, C.gray);
small('Storage', 68, 459, 220, 12, C.orange);
text('SQLite / fixtures first; PostgreSQL later', 68, 474, 220, 14, 8.7, C.gray);

// Architecture flow.
const archSources = [
  ['CelesTrak', C.blue], ['ESA / NASA\ntelemetry', C.teal], ['NOAA SWPC\noptional', C.orange2],
];
archSources.forEach((s, i) => {
  const x = 365 + i * 177;
  rounded(x, 224, 146, 42, 8, C.sky, s[1], 1);
  bold(s[0], x + 7, 238, 132, 18, 9.5, C.navy, { align: 'center' });
  arrow(x + 73, 269, x + 73, 282, C.navy2, 1.2);
});
rounded(413, 282, 392, 36, 8, C.white, C.teal, 1.4);
bold('INGEST + NORMALIZE', 428, 294, 136, 14, 9.3, C.teal);
text('fetch | validate | cache | align time + units', 570, 294, 215, 13, 8.8, C.gray);
arrow(610, 321, 610, 334, C.navy2, 1.2);
const eng = [
  ['ORBITAL', 'SGP4\nTCA + distance', C.blue],
  ['TELEMETRY / ML', 'features\nIsolation Forest', C.red],
  ['DIAGNOSIS', 'time window\nrules + evidence', C.violet],
];
eng.forEach((e, i) => {
  const x = 365 + i * 177;
  node(e[0], x, 334, 146, 56, e[2], e[1]);
  arrow(x + 73, 394, x + 73, 407, C.navy2, 1.2);
});
rounded(456, 407, 310, 35, 8, C.white, C.orange2, 1.3);
bold('FASTAPI API', 472, 418, 100, 14, 9.3, C.orange);
text('typed JSON + offline fallback', 574, 418, 174, 13, 8.8, C.gray);
arrow(611, 445, 611, 456, C.navy2, 1.2);
rounded(430, 456, 361, 27, 7, C.sky, C.blue, 1);
bold('REACT DASHBOARD  |  tables + charts + evidence', 445, 464, 330, 12, 8.8, C.navy, { align: 'center' });
pageFoot('Stack choices keep the prototype portable and reproducible before production-scale infrastructure is needed.', 4);

// Slide 5: feasibility and showstoppers.
background(5);
sectionTitle('FEASIBILITY', 46, 188, 260);
sectionTitle('SHOWSTOPPERS + MITIGATIONS', 574, 188, 300);
metric('36 h', 'bounded hackathon MVP', 46, 226, 116, C.teal);
metric('4', 'team workstreams', 174, 226, 116, C.blue);
metric('100', 'comparison objects', 302, 226, 116, C.violet);
metric('OFFLINE', 'cached demo fallback', 430, 226, 128, C.orange2);
panel(46, 304, 512, 178, C.line, C.white);
small('Build path', 68, 325, 180, C.blue);
const build = [
  ['1', 'Foundation', 'freeze data + API contracts', C.blue],
  ['2', 'Detection', 'SGP4 screening + telemetry score', C.red],
  ['3', 'Correlation', 'time window + rule diagnosis', C.violet],
  ['4', 'Demo hardening', 'dashboard + offline replay', C.teal],
];
build.forEach((b, i) => {
  const y = 354 + i * 28;
  circle(78, y + 7, 8, b[3]);
  bold(b[0], 73, y + 2, 10, 12, 7.5, C.white, { align: 'center' });
  bold(b[1], 99, y, 130, 15, 9.8, b[3]);
  text(b[2], 230, y, 280, 15, 9.3, C.gray);
  if (i < 3) line(78, y + 15, 78, y + 25, C.line, 1);
});

const riskRows = [
  ['External API failure', 'Cache TLE / OMM inputs; ship offline fixture', C.blue],
  ['Wrong units / frames', 'Established libraries + deterministic sanity tests', C.orange2],
  ['False positives', 'Evaluate an inspected or labelled subset', C.red],
  ['Scope creep', 'Defer Pc, deep learning, live streaming, 3D', C.violet],
];
riskRows.forEach((r, i) => {
  const y = 226 + i * 63;
  rounded(574, y, 340, 49, 8, C.white, r[2], 1);
  bold(r[0], 588, y + 9, 132, 14, 9.2, r[2]);
  text(r[1], 726, y + 8, 175, 30, 8.6, C.gray);
});
rounded(574, 485, 340, 27, 7, '#FFF1E7', C.orange, 1);
bold('Prototype assessment, not certified flight software.', 588, 493, 312, 11, 8.8, C.orange, { align: 'center' });
pageFoot('Feasibility comes from ruthless scope control, public data, established libraries, and a complete offline demo path.', 5);

// Slide 6: USP and business model.
background(6);
sectionTitle('USP (UNIQUE SELLING PROPOSITION)', 46, 188, 480);
sectionTitle('BUSINESS MODEL', 575, 188, 300);
panel(46, 227, 480, 255, C.teal, C.white);
bold('Connect the "where"\nwith the "how is it behaving?"', 70, 254, 400, 52, 21, C.navy);
text('OCAADS combines orbital close approaches, telemetry anomalies, and contextual evidence in one explainable investigation workflow.', 70, 326, 402, 44, 11.4, C.gray);
chip('OPEN DATA', 70, 399, 90, C.blue);
chip('EXPLAINABLE', 172, 399, 106, C.violet);
chip('HUMAN-IN-THE-LOOP', 290, 399, 160, C.orange2);
iconRadar(92, 458, C.teal);
text('Novelty: a small operator can see the evidence chain, not just another alert.', 134, 443, 350, 34, 9.5, C.navy, 'Helvetica-Bold');

panel(575, 227, 339, 255, C.orange2, C.white);
const model = [
  ['CUSTOMERS', 'University teams\nCubeSat operators\nSmall startups', C.teal],
  ['REVENUE', 'Per-satellite SaaS\n$500-$5,000 / month*', C.orange],
  ['SUSTAIN', 'Tiered analytics\nOnboarding + support', C.violet],
];
model.forEach((m, i) => {
  const y = 255 + i * 69;
  circle(603, y + 7, 7, m[2]);
  small(m[0], 620, y, 130, m[2]);
  text(m[1], 620, y + 19, 225, 34, 9.8, C.gray);
  if (i < model.length - 1) line(603, y + 28, 603, y + 60, C.line, 1, 3);
});
text('*Illustrative pricing hypothesis; validate with target operators.', 594, 456, 285, 14, 7.8, C.gray, 'Helvetica-Oblique');
pageFoot('Business model: accessible SaaS for small operators, with room for enterprise integrations later.', 6);

// Slide 7: references. The template instruction page is intentionally omitted.
background(7);
sectionTitle('REFERENCES', 46, 188, 320);
text('Selected sources supporting the problem, data, and technical approach.', 48, 222, 600, 18, 10.5, C.gray);
const refGroups = [
  ['Official data + space context', [
    'CelesTrak - Current GP Element Sets: celestrak.org/NORAD/elements/',
    'ESA - Space Environment Report: esa.int/Space_Safety/Space_Debris',
    'Space-Track.org - public tracking service: space-track.org/',
    'NOAA SWPC - space-weather data: swpc.noaa.gov/',
  ], C.blue],
  ['Libraries + methods', [
    'SGP4 Python library: pypi.org/project/sgp4/',
    'Skyfield documentation: rhodesmill.org/skyfield/',
    'scikit-learn Isolation Forest: scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html',
    'FastAPI documentation: fastapi.tiangolo.com/',
  ], C.violet],
  ['Datasets + project basis', [
    'ESA and NASA public telemetry/anomaly datasets referenced in the project brief.',
    'OCAADS project documents: problem statement, HOW, realistic MVP, team handbook.',
    'All prototype outputs should record source, timestamp, units, and provenance type.',
  ], C.orange],
];
refGroups.forEach((g, gi) => {
  const x = gi === 0 ? 46 : gi === 1 ? 486 : 46;
  const y = gi === 2 ? 366 : 253;
  const w = gi === 2 ? 868 : 392;
  const h = gi === 2 ? 116 : 98;
  panel(x, y, w, h, g[2], C.white);
  small(g[0], x + 18, y + 17, w - 36, g[2]);
  g[1].forEach((r, i) => bullet(r, x + 18, y + 42 + i * 16, w - 36, g[2], 8.3));
});
panel(486, 366, 428, 116, C.teal, C.white);
small('Submission note', 508, 385, 200, C.teal);
text('The final submission should be checked for current source figures, team members, and chosen track before export.', 508, 414, 380, 39, 10, C.gray);
chip('INSTRUCTION SLIDE REMOVED', 508, 459, 205, C.orange);
pageFoot('References are intentionally concise; verify current figures and URLs before final submission.', 7);

doc.end();
