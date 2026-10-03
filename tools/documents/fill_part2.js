const pptxgen = require('pptxgenjs');
const workspacePath = require('./workspace-path');

const pptx = new pptxgen();
pptx.defineLayout({ name: 'OCAADS_10x5.625', width: 10, height: 5.625 });
pptx.layout = 'OCAADS_10x5.625';
pptx.author = 'OCAADS';
pptx.company = 'OCAADS';
pptx.subject = 'Problem statement and target audience';
pptx.title = 'OCAADS — Problem Statement & Target Audience';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-US',
};
pptx.layout = 'OCAADS_10x5.625';

const C = {
  bg: '071A2D',
  panel: '0E2940',
  panel2: '123650',
  white: 'F2F7FA',
  muted: 'A9BDCC',
  line: '2C526B',
  teal: '31C7B5',
  blue: '4D9DE0',
  amber: 'F4B942',
  coral: 'F06464',
  violet: '9278E8',
  ink: '071A2D',
};

function addText(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: opts.fontFace || 'Aptos',
    fontSize: opts.fontSize || 12,
    color: opts.color || C.white,
    bold: opts.bold || false,
    italic: opts.italic || false,
    margin: opts.margin === undefined ? 0 : opts.margin,
    breakLine: false,
    fit: 'shrink',
    valign: opts.valign || 'mid',
    align: opts.align || 'left',
    charSpacing: opts.charSpacing || 0,
    paraSpaceAfterPt: opts.paraSpaceAfterPt,
    bullet: opts.bullet,
  });
}
function box(slide, x, y, w, h, fill, line = C.line, radius = 0.12, transparency = 0) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: radius,
    fill: { color: fill, transparency },
    line: { color: line, width: 1 },
  });
}
function rect(slide, x, y, w, h, fill, transparency = 0) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fill, transparency },
    line: { color: fill, transparency: 100 },
  });
}
function line(slide, x1, y1, x2, y2, color = C.line, width = 1, dash = 'solid') {
  slide.addShape(pptx.ShapeType.line, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width, dashType: dash },
  });
}
function dot(slide, x, y, r, color) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x - r, y: y - r, w: 2 * r, h: 2 * r,
    fill: { color }, line: { color, transparency: 100 },
  });
}
function ring(slide, cx, cy, rx, ry, color, width = 1, transparency = 0, dash = 'solid') {
  slide.addShape(pptx.ShapeType.ellipse, {
    x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2,
    fill: { color: C.bg, transparency: 100 },
    line: { color, width, transparency, dashType: dash },
  });
}
function label(slide, text, x, y, w, color = C.teal, align = 'left') {
  addText(slide, text.toUpperCase(), x, y, w, 0.17, {
    fontSize: 8.5, color, bold: true, charSpacing: 1.1, align,
  });
}
function pill(slide, text, x, y, w, color, fill = C.panel2) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.25, rectRadius: 0.12,
    fill: { color: fill }, line: { color, width: 0.8 },
  });
  addText(slide, text.toUpperCase(), x, y + 0.015, w, 0.19, {
    fontSize: 7.2, color, bold: true, align: 'center', charSpacing: 0.7,
  });
}
function issueRow(slide, y, color, heading, body) {
  dot(slide, 0.92, y + 0.19, 0.09, color);
  addText(slide, heading, 1.12, y + 0.02, 1.55, 0.19, { fontSize: 11.5, color, bold: true });
  addText(slide, body, 2.72, y + 0.02, 2.92, 0.34, { fontSize: 10.1, color: C.muted });
}
function userCard(slide, y, color, heading, body) {
  box(slide, 6.63, y, 2.76, 0.48, C.panel2, color, 0.08);
  dot(slide, 6.87, y + 0.24, 0.08, color);
  addText(slide, heading, 7.08, y + 0.07, 2.06, 0.16, { fontSize: 9.8, color: C.white, bold: true });
  addText(slide, body, 7.08, y + 0.26, 2.06, 0.13, { fontSize: 8.2, color: C.muted });
}
function metric(slide, x, value, caption, color, w = 2.08) {
  box(slide, x, 5.09, w, 0.38, C.panel, color, 0.08);
  addText(slide, value, x + 0.1, 5.13, 0.65, 0.2, { fontSize: 13, color, bold: true });
  addText(slide, caption, x + 0.82, 5.14, w - 0.9, 0.16, { fontSize: 7.8, color: C.muted });
}

const slide = pptx.addSlide();
slide.background = { color: C.bg };

// Header: a restrained orbital motif keeps the original slide structure while making the topic unmistakably space-focused.
rect(slide, 0, 0, 10, 0.06, C.teal);
addText(slide, 'OCAADS', 0.55, 0.19, 1.1, 0.25, { fontSize: 15, color: C.teal, bold: true, charSpacing: 0.7 });
addText(slide, 'ORBITAL COLLISION AVOIDANCE & ANOMALY DIAGNOSIS SYSTEM', 1.72, 0.235, 4.8, 0.14, { fontSize: 7.2, color: C.muted, charSpacing: 0.35 });
label(slide, 'Problem statement  /  target audience', 7.05, 0.23, 2.4, C.amber, 'right');
line(slide, 0.55, 0.53, 9.45, 0.53, C.line, 0.8);
addText(slide, 'Problem Statement & Target Audience', 0.55, 0.66, 6.8, 0.38, { fontSize: 24, color: C.white, bold: true });
addText(slide, 'The mission-operations gap faced by small-satellite teams', 0.57, 1.07, 5.7, 0.2, { fontSize: 10.5, color: C.muted });

// Orbit graphic in the open header space.
ring(slide, 8.78, 0.82, 0.72, 0.19, C.blue, 1.1, 10);
ring(slide, 8.78, 0.82, 0.38, 0.68, C.violet, 1.0, 15);
ring(slide, 8.78, 0.82, 0.96, 0.46, C.teal, 0.8, 30, 'dash');
dot(slide, 8.78, 0.82, 0.13, '1D6D9D');
dot(slide, 9.42, 0.56, 0.045, C.amber);
dot(slide, 8.04, 1.08, 0.05, C.coral);
addText(slide, 'one spacecraft\n/ one timeline', 9.0, 0.67, 0.62, 0.34, { fontSize: 7.2, color: C.muted, italic: true, align: 'left' });

// Main two-column structure.
box(slide, 0.55, 1.37, 5.68, 3.47, C.panel, C.line, 0.14);
box(slide, 6.42, 1.37, 3.03, 3.47, C.panel, C.line, 0.14);

// Problem column.
label(slide, 'Problem we’re solving', 0.82, 1.59, 2.2, C.coral);
addText(slide, 'Orbital risk and spacecraft health are investigated in separate, mostly manual workflows.', 0.82, 1.84, 4.96, 0.58, { fontSize: 16.2, color: C.white, bold: true });
line(slide, 0.82, 2.52, 5.91, 2.52, C.line, 0.6);
issueRow(slide, 2.68, C.amber, 'Orbital risk', 'Review close-approach messages and decide whether a maneuver is needed.');
issueRow(slide, 3.19, C.coral, 'Spacecraft health', 'Inspect telemetry and historical behavior to find unusual patterns.');
issueRow(slide, 3.70, C.violet, 'Operational impact', 'Fragmented evidence slows decisions; false positives waste fuel and false negatives threaten mission life.');
box(slide, 0.82, 4.36, 4.98, 0.29, '241A2B', C.coral, 0.07);
addText(slide, 'Diagnosis can take hours–days while the operator is still deciding what happened.', 0.98, 4.42, 4.66, 0.14, { fontSize: 8.8, color: C.white, bold: true, align: 'center' });

// Target-audience column.
label(slide, 'Impacted audience', 6.69, 1.59, 1.8, C.blue);
addText(slide, 'Teams responsible for a satellite but without ESA/NASA-scale tooling or specialist capacity.', 6.69, 1.84, 2.45, 0.58, { fontSize: 13.3, color: C.white, bold: true });
userCard(slide, 2.68, C.teal, 'University / CubeSat teams', 'Flight operations + systems');
userCard(slide, 3.24, C.amber, 'SmallSat startups', 'Lean mission-control teams');
userCard(slide, 3.80, C.violet, 'Research / government', 'Mission-operations professionals');
line(slide, 6.69, 4.43, 9.18, 4.43, C.line, 0.6);
label(slide, 'User profile', 6.69, 4.51, 1.1, C.teal);
addText(slide, 'Age: 18+ technical professionals', 6.69, 4.69, 2.35, 0.14, { fontSize: 8.8, color: C.muted });
addText(slide, 'Sector: Aerospace / NewSpace / research', 6.69, 4.84, 2.35, 0.14, { fontSize: 8.8, color: C.muted });
pill(slide, 'B2B / INSTITUTIONAL', 6.69, 5.01, 1.62, C.teal);

// Real-life context strip: figures are taken directly from the project brief.
metric(slide, 0.55, '11,000+', 'active satellites', C.blue, 2.08);
metric(slide, 2.72, '1.2M+', 'tracked debris pieces', C.amber, 2.08);
metric(slide, 4.89, 'hours–days', 'anomaly diagnosis time', C.coral, 2.08);
metric(slide, 7.06, '$10k–$100k', 'mission-life cost of maneuvers', C.violet, 2.39);

addText(slide, 'Project-brief context figures; validate external citations before final submission.', 0.57, 5.52, 5.7, 0.08, { fontSize: 5.8, color: C.muted, italic: true });
addText(slide, 'OCAADS — problem + audience', 7.15, 5.52, 2.3, 0.08, { fontSize: 5.8, color: C.muted, align: 'right' });

pptx.writeFile({ fileName: workspacePath('ppt', 'pdf-ppt_part2_filled.pptx') });
