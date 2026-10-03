const pptxgen = require('pptxgenjs');
const workspacePath = require('./workspace-path');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OCAADS Team';
pptx.subject = 'Orbital Collision Avoidance & Anomaly Diagnosis System';
pptx.title = 'OCAADS — From Orbital Risk to Actionable Evidence';
pptx.company = 'OCAADS';
pptx.lang = 'en-US';
pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'en-US' };
pptx.defineSlideMaster({
  title: 'MASTER', background: { color: '081426' },
  objects: [
    { line: { x:0.55, y:7.05, w:12.2, h:0, line:{color:'28455C', transparency:30, width:1} } },
    { text: { text:'OCAADS', options:{ x:0.58, y:7.1, w:1.2, h:0.18, fontFace:'Aptos', fontSize:8, color:'6F90A6', bold:true, margin:0 } } },
    { text: { text:'Orbital Collision Avoidance & Anomaly Diagnosis System', options:{ x:1.75, y:7.1, w:6.4, h:0.18, fontFace:'Aptos', fontSize:8, color:'6F90A6', margin:0 } } },
  ], slideNumber: { x:12.45, y:7.08, color:'6F90A6', fontFace:'Aptos', fontSize:8 }
});

const C = { bg:'081426', panel:'10243A', panel2:'17344D', white:'F2F7FA', muted:'AABCCC', grid:'456277', teal:'31C7B5', amber:'F4B942', coral:'F06464', blue:'4D9DE0', violet:'9278E8', dark:'0B1C2D' };
const W=13.333, H=7.5;
function slide(title, kicker='') { const s=pptx.addSlide('MASTER'); if(kicker) txt(s,kicker.toUpperCase(),0.6,0.34,5,0.2,10,C.teal,true); txt(s,title,0.6,0.6,12,0.45,28,C.white,true); return s; }
function txt(s,t,x,y,w,h,fs=16,color=C.white,bold=false,opts={}) { s.addText(t,{x,y,w,h,fontFace:opts.fontFace||'Aptos',fontSize:fs,color,bold,margin:opts.margin===undefined?0.04:opts.margin,breakLine:false,fit:'shrink',valign:opts.valign||'mid',align:opts.align||'left',italic:opts.italic||false,bullet:opts.bullet,paraSpaceAfterPt:opts.paraSpaceAfterPt}); }
function box(s,x,y,w,h,fill=C.panel,line=C.grid,r=0.12){s.addShape(pptx.ShapeType.roundRect,{x,y,w,h,rectRadius:r,fill:{color:fill},line:{color:line,width:1}})}
function line(s,x1,y1,x2,y2,color=C.grid,width=1,dash='solid'){s.addShape(pptx.ShapeType.line,{x:x1,y:y1,w:x2-x1,h:y2-y1,line:{color,width,dashType:dash,beginArrowType:'none',endArrowType:'none'}})}
function pill(s,label,x,y,w,color,fill){s.addShape(pptx.ShapeType.roundRect,{x,y,w,h:0.28,rectRadius:0.12,fill:{color:fill||color,transparency:80},line:{color:fill||color,width:1}});txt(s,label,x,y+0.01,w,0.23,9,color,true,{align:'center'});}
function bulletList(s,items,x,y,w,fs=16,color=C.white,gap=0.4){items.forEach((v,i)=>{s.addShape(pptx.ShapeType.ellipse,{x,y:y+i*gap+0.09,w:0.09,h:0.09,fill:{color:C.teal},line:{color:C.teal}});txt(s,v,x+0.18,y+i*gap,w-0.18,0.3,fs,color,false);});}
function metric(s,label,value,x,y,w,accent=C.teal){box(s,x,y,w,0.82,C.panel2,accent);txt(s,value,x+0.14,y+0.1,w-0.28,0.34,24,accent,true);txt(s,label,x+0.14,y+0.5,w-0.28,0.18,9,C.muted,false);}
function arrow(s,x1,y1,x2,y2,color=C.blue){s.addShape(pptx.ShapeType.line,{x:x1,y:y1,w:x2-x1,h:y2-y1,line:{color,width:2,endArrowType:'triangle'}});}
function node(s,label,x,y,w,color=C.blue,sub=''){box(s,x,y,w,0.64,C.panel2,color);txt(s,label,x+0.1,y+0.08,w-0.2,0.25,13,C.white,true,{align:'center'});if(sub)txt(s,sub,x+0.08,y+0.36,w-0.16,0.16,8,C.muted,false,{align:'center'});}
function orbit(s,cx,cy,rx,ry,color,width=1.5,dash='solid'){s.addShape(pptx.ShapeType.ellipse,{x:cx-rx,y:cy-ry,w:rx*2,h:ry*2,fill:{color:C.bg,transparency:100},line:{color,width,dashType:dash}});}
function dot(s,x,y,r,color){s.addShape(pptx.ShapeType.ellipse,{x:x-r,y:y-r,w:r*2,h:r*2,fill:{color},line:{color}});}

// 1. Cover
{ const s=pptx.addSlide('MASTER');
  txt(s,'OCAADS',0.72,0.55,3.2,0.55,34,C.teal,true); txt(s,'From orbital risk\nto actionable evidence',0.72,1.38,7.6,1.2,34,C.white,true); txt(s,'Orbital Collision Avoidance & Anomaly Diagnosis System',0.75,2.78,7.6,0.3,17,C.muted,false);
  pill(s,'MISSION-CONTROL ASSISTANT',0.75,3.35,2.35,C.amber); txt(s,'Observe  →  Detect  →  Correlate  →  Diagnose  →  Decide',0.75,3.9,7.8,0.35,19,C.white,true);
  // orbital motif
  orbit(s,10.0,3.55,2.4,1.3,C.blue,2); orbit(s,10.0,3.55,1.55,2.15,C.violet,1.5); orbit(s,10.0,3.55,3.0,2.1,C.teal,1); dot(s,10,3.55,0.48,'1A6E9E'); txt(s,'EARTH',9.48,3.4,1.05,0.25,12,C.white,true,{align:'center'}); dot(s,11.85,2.72,0.11,C.amber); txt(s,'tracked object',11.98,2.61,1.0,0.25,10,C.muted); dot(s,8.38,4.55,0.12,C.coral); txt(s,'target satellite',7.3,4.62,1.1,0.25,10,C.muted,{align:'right'});
  txt(s,'A software-first prototype for small-satellite operators',0.75,6.25,7.0,0.3,15,C.muted); }

// 2 Problem
{ const s=slide('The operational problem','WHY NOW');
  txt(s,'A satellite anomaly and a close approach are often investigated in separate tools, by separate people, on separate timelines.',0.65,1.25,11.8,0.55,20,C.white,true);
  const cards=[['COLLISION RISK','Review conjunction messages\nRank what needs attention',C.amber],['SPACECRAFT HEALTH','Inspect telemetry plots\nLook for unusual behavior',C.coral],['CONTEXT SEARCH','Check space weather\nSearch historical records',C.blue],['DECISION','Combine evidence\nRely on scarce expertise',C.violet]];
  cards.forEach((c,i)=>{let x=0.7+i*3.1; box(s,x,2.25,2.7,1.45,C.panel2,c[2]); txt(s,c[0],x+0.15,2.45,2.4,0.25,13,c[2],true); txt(s,c[1],x+0.15,2.84,2.35,0.55,14,C.white,false); if(i<3)arrow(s,x+2.72,2.98,x+3.02,2.98,C.grid);});
  box(s,0.7,4.35,11.9,1.2,'241A2B',C.coral); txt(s,'THE COST OF FRAGMENTATION',0.95,4.58,3.0,0.24,12,C.coral,true); txt(s,'Slower investigation  •  fragmented evidence  •  uncertainty at the moment an operator needs clarity',0.95,4.93,10.8,0.28,18,C.white,true);
  txt(s,'OCAADS connects the signals around the same spacecraft and the same timeline.',0.7,6.18,11.5,0.3,19,C.teal,true);
}

// 3 Target users
{ const s=slide('Who OCAADS is for','TARGET USERS');
  const users=[['University & CubeSat teams','Limited flight-operations staff\nNeed accessible, explainable tools'],['Small operators & startups','Need to protect mission life\nWithout enterprise tooling'],['Research & government missions','Need a common investigation view\nAcross orbital and health signals']];
  users.forEach((u,i)=>{let x=0.75+i*4.05;box(s,x,1.5,3.55,2.2,C.panel2,[C.teal,C.amber,C.violet][i]);dot(s,x+0.35,1.9,0.16,[C.teal,C.amber,C.violet][i]);txt(s,u[0],x+0.65,1.72,2.6,0.5,16,C.white,true);txt(s,u[1],x+0.28,2.55,2.95,0.6,15,C.muted,false);});
  box(s,1.8,4.45,9.7,1.08,C.panel,C.blue); txt(s,'PRIMARY USER',2.1,4.68,1.6,0.2,10,C.blue,true); txt(s,'An operator or systems engineer investigating a high-priority close approach, an unexpected telemetry event, or a possible link between the two.',3.9,4.58,7.2,0.45,16,C.white,true);
  txt(s,'Designed for human-in-the-loop decision support — not autonomous spacecraft control.',1.4,6.15,10.5,0.3,18,C.amber,true,{align:'center'});
}

// 4 Why possible
{ const s=slide('Why this is possible now','OPPORTUNITY');
  const items=[['PUBLIC ORBITAL DATA','CelesTrak and Space-Track provide orbital elements and tracking context',C.blue],['OPEN DATASETS','ESA and NASA telemetry/anomaly datasets support reproducible demos',C.teal],['MATURE PHYSICS LIBRARIES','SGP4 propagation is available through established open-source libraries',C.violet],['PRACTICAL ML','scikit-learn makes first-pass anomaly scoring accessible and testable',C.amber]];
  items.forEach((it,i)=>{let y=1.35+i*1.1;box(s,0.85,y,11.7,0.78,C.panel2,it[2]);txt(s,it[0],1.1,y+0.15,2.7,0.22,12,it[2],true);txt(s,it[1],4.0,y+0.14,8.0,0.3,15,C.white,false);});
  txt(s,'The opportunity is integration: combine established capabilities into one investigation workflow.',0.85,6.05,11.8,0.35,20,C.teal,true,{align:'center'});
}

// 5 solution
{ const s=slide('The OCAADS solution','PRODUCT');
  txt(s,'One spacecraft. One timeline. Multiple evidence sources.',0.8,1.15,11,0.4,22,C.white,true,{align:'center'});
  const stages=[['OBSERVE','Orbital data\nTelemetry\nContext',C.blue],['DETECT','Close approaches\nAnomaly scores',C.coral],['CORRELATE','Time windows\nEvidence links',C.violet],['DIAGNOSE','Rules\nProbable causes',C.amber],['DECIDE','Operator review\nWhat-if support',C.teal]];
  stages.forEach((st,i)=>{let x=0.72+i*2.48;node(s,st[0],x,2.25,1.9,st[2],st[1]);if(i<4)arrow(s,x+1.92,2.57,x+2.39,2.57,C.grid);});
  box(s,1.2,4.1,10.9,1.25,C.panel,C.teal); txt(s,'THE VALUE',1.55,4.38,1.5,0.22,11,C.teal,true); txt(s,'OCAADS does not replace the operator. It reduces manual searching and assembles the evidence needed for a faster, better-informed investigation.',3.0,4.3,8.7,0.55,18,C.white,true);
  txt(s,'Prototype posture: explainable, bounded, and honest about uncertainty.',1.3,6.2,10.8,0.3,18,C.muted,false,{align:'center',italic:true});
}

// 6 core mental model
{ const s=slide('Core mental model: the same spacecraft on the same timeline','SYSTEM THINKING');
  const lanes=[['ORBITAL STATE','Where is it?','Position + nearby objects',C.blue],['CONJUNCTION CONTEXT','What came close?','TCA + miss distance',C.amber],['TELEMETRY STATE','How is it behaving?','Signals + anomaly score',C.coral],['DIAGNOSIS CONTEXT','What else was happening?','Weather + history + rules',C.violet]];
  lanes.forEach((l,i)=>{let y=1.35+i*0.92;txt(s,l[0],0.85,y,2.1,0.22,11,l[3],true);box(s,3.05,y-0.02,8.8,0.55,C.panel2,l[3]);txt(s,l[1],3.3,y+0.06,2.0,0.2,15,C.white,true);txt(s,l[2],5.6,y+0.06,5.8,0.2,14,C.muted,false);});
  line(s,3.0,5.4,11.85,5.4,C.teal,2); txt(s,'DECISION SUPPORT',0.85,5.26,2.0,0.25,11,C.teal,true); txt(s,'Review a high-priority event, inspect evidence, and decide what to investigate next.',3.3,5.2,8.5,0.35,17,C.white,true);
  txt(s,'The system becomes intelligent because its outputs are connected through time and context.',0.8,6.28,11.7,0.28,17,C.teal,true,{align:'center'});
}

// 7 end-to-end workflow
{ const s=slide('End-to-end workflow','WORKFLOWS');
  const ws=[['1','INGEST','Orbital data\nTelemetry\nOptional context',C.blue],['2','PROPAGATE','Generate future\npositions with SGP4',C.blue],['3','SCREEN','Find and rank\nclose approaches',C.amber],['4','DETECT','Flag unusual\ntelemetry behavior',C.coral],['5','CORRELATE','Search nearby\nevents in time',C.violet],['6','DIAGNOSE','Explain evidence\nwith transparent rules',C.teal],['7','PRESENT','Dashboard +\noperator review',C.white]];
  ws.forEach((w,i)=>{let x=0.45+i*1.82;dot(s,x+0.42,1.65,0.25,w[3]);txt(s,w[0],x+0.28,1.49,0.28,0.25,15,C.bg,true,{align:'center'});txt(s,w[1],x,2.05,1.45,0.25,11,w[3],true,{align:'center'});txt(s,w[2],x,2.43,1.45,0.55,12,C.white,false,{align:'center'});if(i<6)arrow(s,x+0.95,1.65,x+1.62,1.65,C.grid);});
  box(s,0.8,4.35,11.6,1.18,C.panel,C.teal); txt(s,'EVIDENCE CHAIN',1.1,4.62,1.7,0.22,11,C.teal,true); txt(s,'Anomaly at 14:23 UTC  →  close approach several hours earlier  →  no competing space-weather event  →  possible conjunction-related event',3.05,4.5,8.9,0.5,17,C.white,true);
  txt(s,'Correlation supports prioritization; it does not prove causation.',1.0,6.15,11.3,0.3,17,C.amber,true,{align:'center'});
}

// 8 orbital screening graphic
{ const s=slide('Workflow 1 — Conjunction screening','ORBITAL ENGINE');
  txt(s,'Screen the target satellite against tracked objects, then rank what deserves operator attention.',0.7,1.12,11.8,0.32,18,C.white,true);
  // plot
  box(s,0.7,1.75,7.15,4.55,'0B1C2D',C.grid);
  orbit(s,4.2,4.0,2.55,1.35,C.blue,1.8); orbit(s,4.2,4.0,1.65,2.1,C.violet,1.4); orbit(s,4.2,4.0,3.0,2.0,C.teal,1);
  dot(s,4.2,4.0,0.5,'1A6E9E');txt(s,'EARTH',3.72,3.86,0.96,0.22,11,C.white,true,{align:'center'});
  dot(s,6.37,3.08,0.11,C.amber);txt(s,'object 47821',6.55,2.98,1.1,0.18,9,C.amber);
  dot(s,2.33,4.97,0.12,C.coral);txt(s,'target',1.6,5.13,0.8,0.18,9,C.coral);
  line(s,6.37,3.08,6.1,3.33,C.amber,1.4,'dash'); txt(s,'closest approach\nwindow',6.13,3.37,1.0,0.4,9,C.amber,true,{align:'center'});
  txt(s,'Illustrative geometry — not to scale',1.0,5.95,3.0,0.18,9,C.muted,false,{italic:true});
  // process card
  box(s,8.2,1.75,4.35,4.55,C.panel,C.blue); txt(s,'WHAT THE ENGINE DOES',8.5,2.02,3.6,0.25,12,C.blue,true);
  const steps=['Load TLE / OMM records','Propagate over 7 days','Compare positions in one frame','Find minimum separation','Record TCA + miss distance','Rank screening priority'];
  steps.forEach((v,i)=>{dot(s,8.62,2.57+i*0.47,0.08,C.blue);txt(s,v,8.82,2.43+i*0.47,3.25,0.25,13,C.white,false);});
  pill(s,'MVP CAVEAT',8.5,5.55,1.1,C.amber);txt(s,'Miss distance is a screening proxy — not Pc.',9.75,5.56,2.3,0.25,11,C.amber,true);
}

// 9 telemetry graphic
{ const s=slide('Workflow 2 — Telemetry anomaly detection','ML ENGINE');
  txt(s,'First ask: “Does this telemetry look unusual?” Diagnosis comes later.',0.7,1.12,11.8,0.32,18,C.white,true);
  box(s,0.7,1.75,8.0,4.6,'0B1C2D',C.grid);
  // axes
  line(s,1.2,5.65,8.3,5.65,C.grid,1); line(s,1.2,2.2,1.2,5.65,C.grid,1);
  for(let i=0;i<6;i++){let x=1.3+i*1.35;line(s,x,2.35,x,5.55,C.grid,0.5,'dash');txt(s,['10:00','10:05','10:10','10:15','10:20','10:25'][i],x-0.25,5.75,0.6,0.18,8,C.muted,false,{align:'center'});}
  // nominal band
  s.addShape(pptx.ShapeType.rect,{x:1.25,y:3.05,w:6.95,h:1.2,fill:{color:C.teal,transparency:88},line:{color:C.teal,transparency:100}});
  txt(s,'nominal operating envelope',1.38,3.1,2.3,0.18,9,C.teal,false);
  const pts=[[1.3,3.7],[1.8,3.55],[2.3,3.72],[2.8,3.48],[3.3,3.62],[3.8,3.56],[4.3,3.6],[4.8,3.46],[5.3,3.62],[5.8,3.5],[6.3,3.55],[6.8,3.42],[7.3,3.58],[7.8,3.48],[8.1,3.42]];
  for(let i=1;i<pts.length;i++)line(s,pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1],C.blue,2);
  const anomaly=[[6.1,3.0],[6.4,2.45],[6.7,2.75]]; for(let i=1;i<anomaly.length;i++)line(s,anomaly[i-1][0],anomaly[i-1][1],anomaly[i][0],anomaly[i][1],C.coral,2.5); anomaly.forEach(p=>dot(s,p[0],p[1],0.1,C.coral)); line(s,6.4,2.1,6.4,5.65,C.coral,1.2,'dash');txt(s,'flagged deviation',6.05,1.9,1.3,0.18,9,C.coral,true,{align:'center'});
  txt(s,'Observed signal',1.4,2.4,1.4,0.18,9,C.blue,true);txt(s,'Anomaly markers',6.95,4.8,1.1,0.18,9,C.coral,true);
  // right cards
  box(s,9.05,1.75,3.5,1.0,C.panel2,C.blue);txt(s,'1. PREPARE',9.3,1.98,1.2,0.2,11,C.blue,true);txt(s,'Clean + select features',10.6,1.94,1.65,0.24,12,C.white,false);
  box(s,9.05,3.0,3.5,1.0,C.panel2,C.violet);txt(s,'2. SCORE',9.3,3.23,1.2,0.2,11,C.violet,true);txt(s,'Isolation Forest',10.6,3.19,1.65,0.24,12,C.white,false);
  box(s,9.05,4.25,3.5,1.0,C.panel2,C.coral);txt(s,'3. EMIT',9.3,4.48,1.2,0.2,11,C.coral,true);txt(s,'Timestamp + score',10.6,4.44,1.65,0.24,12,C.white,false);
  txt(s,'Anomaly score ≠ failure probability. Measure performance before making claims.',8.95,5.75,3.7,0.43,12,C.amber,true,{align:'center'});
}

// 10 correlation timeline
{ const s=slide('Workflow 3 — Correlation and diagnosis','DIAGNOSIS ENGINE');
  txt(s,'The “holy shit” moment is not another alert — it is the evidence chain around the alert.',0.7,1.12,11.8,0.32,18,C.white,true);
  const x0=2.1,x1=11.9; line(s,x0,2.3,x1,2.3,C.grid,1); line(s,x0,3.55,x1,3.55,C.grid,1); line(s,x0,4.8,x1,4.8,C.grid,1);
  txt(s,'TELEMETRY',0.72,2.17,1.1,0.22,11,C.coral,true);txt(s,'ORBITAL CONTEXT',0.72,3.42,1.3,0.22,11,C.amber,true);txt(s,'DIAGNOSIS',0.72,4.67,1.1,0.22,11,C.teal,true);
  // time labels
  ['10:00','10:47','12:00','14:23','16:00'].forEach((v,i)=>{let x=2.2+i*2.3;line(s,x,1.75,x,5.35,C.grid,0.5,'dash');txt(s,v,x-0.3,5.52,0.6,0.18,9,C.muted,false,{align:'center'});});
  dot(s,7.6,2.3,0.14,C.coral);txt(s,'anomaly detected',7.18,1.83,1.0,0.24,11,C.coral,true,{align:'center'});
  dot(s,4.35,3.55,0.14,C.amber);txt(s,'close approach',3.88,3.0,1.0,0.24,11,C.amber,true,{align:'center'});
  s.addShape(pptx.ShapeType.rect,{x:4.35,y:1.98,w:3.25,h:3.15,fill:{color:C.amber,transparency:92},line:{color:C.amber,transparency:100}});txt(s,'time-window search',5.1,2.05,1.7,0.2,9,C.amber,false,{align:'center'});
  dot(s,9.0,4.8,0.14,C.teal);txt(s,'possible conjunction-related event',8.0,5.0,2.2,0.25,11,C.teal,true,{align:'center'});
  line(s,4.35,3.7,7.6,2.45,C.grid,1.2,'dash');line(s,7.6,2.45,9.0,4.65,C.grid,1.2,'dash');
  box(s,1.25,6.02,10.85,0.42,C.panel,C.teal);txt(s,'Example output: “A close approach occurred several hours before the telemetry deviation; no competing space-weather event was found.”',1.5,6.1,10.35,0.22,12,C.white,true,{align:'center'});
}

// 11 what-if
{ const s=slide('Workflow 4 — Maneuver / what-if support','DECISION SUPPORT');
  txt(s,'Show the operator what a possible avoidance action could change — without pretending to execute it.',0.7,1.12,11.8,0.32,18,C.white,true);
  // before / after visual
  box(s,0.8,1.8,5.35,3.8,C.panel,C.amber);txt(s,'BEFORE',1.05,2.05,1.1,0.22,13,C.amber,true);orbit(s,3.45,3.75,1.8,0.9,C.grid,1.2);dot(s,3.45,3.75,0.34,'1A6E9E');dot(s,4.95,3.1,0.11,C.coral);dot(s,1.95,4.4,0.11,C.blue);txt(s,'close approach',4.35,2.62,1.2,0.2,10,C.coral,true);txt(s,'screening priority: elevated',1.05,5.0,2.8,0.2,12,C.muted);
  box(s,7.15,1.8,5.35,3.8,C.panel,C.teal);txt(s,'ILLUSTRATIVE WHAT-IF',7.4,2.05,2.4,0.22,13,C.teal,true);orbit(s,9.8,3.75,1.8,0.9,C.grid,1.2);dot(s,9.8,3.75,0.34,'1A6E9E');dot(s,11.3,2.85,0.11,C.teal);dot(s,8.1,4.55,0.11,C.blue);txt(s,'increased separation',10.4,2.36,1.5,0.2,10,C.teal,true);txt(s,'precomputed demonstration only',7.4,5.0,3.1,0.2,12,C.muted);
  arrow(s,6.2,3.7,7.05,3.7,C.blue); pill(s,'ΔV / timing / direction',5.55,5.88,2.1,C.blue);
  txt(s,'Future: optimize fuel, timing, miss distance, and secondary conjunctions.',1.0,6.35,11.3,0.25,16,C.muted,false,{align:'center'});
}

// 12 architecture
{ const s=slide('System architecture','TECHNICAL DESIGN');
  const layers=[['DATA SOURCES','CelesTrak / Space-Track\nESA + NASA telemetry\nNOAA SWPC context',C.blue],['INGEST + NORMALIZE','Fetch • validate • cache\nTime + schema alignment',C.teal],['ANALYTICS ENGINES','SGP4 screening\nIsolation Forest\nCorrelation + rules',C.violet],['APPLICATION API','FastAPI\nTyped contracts\nOffline fallback',C.amber],['OPERATOR EXPERIENCE','React dashboard\nCharts • tables • evidence',C.coral]];
  layers.forEach((l,i)=>{let y=1.25+i*0.92;box(s,2.2,y,8.9,0.63,C.panel2,l[2]);txt(s,l[0],2.48,y+0.1,2.2,0.2,11,l[2],true);txt(s,l[1],5.0,y+0.08,5.6,0.35,13,C.white,false,{align:'center'});if(i<4)arrow(s,6.65,y+0.66,6.65,y+0.86,C.grid);});
  txt(s,'Human review remains between analytics and action.',3.7,6.0,5.9,0.27,18,C.teal,true,{align:'center'});
}

// 13 stack
{ const s=slide('Technology stack: use the smallest tool that proves the workflow','STACK');
  const cols=[['CORE ENGINES',['Python','NumPy / pandas','SGP4 / Skyfield / poliastro','scikit-learn'],C.blue],['APPLICATION',['FastAPI','Pydantic contracts','React + TypeScript','Recharts / D3'],C.teal],['STORAGE + DELIVERY',['SQLite / file fixtures first','PostgreSQL / Timescale later','Cached external inputs','Docker when needed'],C.violet]];
  cols.forEach((c,i)=>{let x=0.8+i*4.15;box(s,x,1.45,3.55,3.75,C.panel2,c[2]);txt(s,c[0],x+0.25,1.75,3.0,0.25,15,c[2],true);c[1].forEach((v,j)=>{dot(s,x+0.33,2.45+j*0.55,0.07,c[2]);txt(s,v,x+0.52,2.3+j*0.55,2.7,0.28,14,C.white,false);});});
  box(s,1.25,5.7,10.8,0.55,'241A2B',C.amber);txt(s,'Defer until the core works:',1.55,5.86,2.2,0.2,11,C.amber,true);txt(s,'Pc calculation • deep learning • live streaming • 3D • Kubernetes • autonomous control',3.85,5.84,7.7,0.24,13,C.white,true);
}

// 14 data sources
{ const s=slide('Data sources and evidence governance','DATA');
  const data=[['CelesTrak','Orbital elements for tracked objects','MVP primary source',C.blue],['Space-Track','Historical data + conjunction context','Optional / account may be required',C.violet],['ESA / NASA','Telemetry and anomaly datasets','Preloaded demo inputs',C.teal],['NOAA SWPC','Solar and space-weather context','Optional diagnostic signal',C.amber]];
  data.forEach((d,i)=>{let y=1.3+i*0.85;box(s,0.8,y,11.7,0.62,C.panel2,d[3]);txt(s,d[0],1.05,y+0.16,1.5,0.2,13,d[3],true);txt(s,d[1],2.8,y+0.14,4.2,0.25,14,C.white,false);txt(s,d[2],7.6,y+0.14,4.2,0.25,13,C.muted,false);});
  txt(s,'Every result should carry source, acquisition time, dataset version, units, frame, and provenance type.',1.0,5.15,11.3,0.32,18,C.white,true,{align:'center'});
  const tags=[['MEASURED',C.teal],['CALCULATED',C.blue],['MODEL-GENERATED',C.violet],['RULE-GENERATED',C.amber]];tags.forEach((t,i)=>pill(s,t[0],1.55+i*2.6,5.85,2.1,t[1]));
}

// 15 dashboard mockup
{ const s=slide('Operator dashboard concept','EXPERIENCE');
  box(s,0.6,1.1,12.15,5.65,'0B1C2D',C.grid);txt(s,'OCAADS  /  OPS-SAT',0.9,1.38,2.1,0.22,13,C.white,true);pill(s,'OFFLINE DEMO READY',9.7,1.3,1.65,C.teal);txt(s,'data snapshot: 2026-09-30 14:23 UTC',11.45,1.38,1.05,0.22,8,C.muted,false,{align:'right'});
  metric(s,'ACTIVE SCREENING EVENTS','03',0.9,1.82,2.15,C.amber);metric(s,'ANOMALY FLAGS','01',3.25,1.82,2.15,C.coral);metric(s,'AWAITING REVIEW','01',5.6,1.82,2.15,C.violet);metric(s,'DATA QUALITY','98%',7.95,1.82,2.15,C.teal);
  // left event queue
  box(s,0.9,2.95,3.25,3.35,C.panel,C.grid);txt(s,'EVENT QUEUE',1.15,3.18,1.5,0.2,10,C.muted,true);[['C-047821','01.2 km','elevated',C.amber],['A-2024-0315','score 0.87','new',C.coral],['C-039812','08.4 km','watch',C.blue]].forEach((e,i)=>{let y=3.65+i*0.78;box(s,1.1,y,2.85,0.58,C.panel2,e[3]);txt(s,e[0],1.27,y+0.08,1.1,0.2,11,C.white,true);txt(s,e[1],1.27,y+0.31,1.1,0.16,9,C.muted);pill(s,e[2].toUpperCase(),2.37,y+0.16,1.25,e[3]);});
  // central telemetry chart
  box(s,4.4,2.95,5.0,3.35,C.panel,C.grid);txt(s,'TELEMETRY / anomaly marker',4.65,3.18,2.5,0.2,10,C.muted,true);line(s,4.85,5.75,9.0,5.75,C.grid,1);line(s,4.85,3.62,4.85,5.75,C.grid,1);const p=[[5,5.0],[5.4,4.85],[5.8,5.0],[6.2,4.76],[6.6,4.9],[7.0,4.85],[7.4,4.9],[7.8,4.1],[8.2,4.55],[8.6,4.25],[8.95,4.35]];for(let i=1;i<p.length;i++)line(s,p[i-1][0],p[i-1][1],p[i][0],p[i][1],C.blue,2);dot(s,7.8,4.1,0.11,C.coral);line(s,7.8,3.62,7.8,5.75,C.coral,1,'dash');txt(s,'14:23',7.55,3.46,0.5,0.16,8,C.coral,true,{align:'center'});txt(s,'observed signal',5.0,5.97,1.2,0.16,8,C.blue);txt(s,'flagged',8.15,5.97,0.6,0.16,8,C.coral);
  // right detail
  box(s,9.65,2.95,2.7,3.35,C.panel,C.grid);txt(s,'SELECTED EVENT',9.9,3.18,1.6,0.2,10,C.muted,true);txt(s,'A-2024-0315',9.9,3.55,1.8,0.25,16,C.coral,true);txt(s,'Possible conjunction-related event',9.9,4.0,2.1,0.45,13,C.white,true);txt(s,'Evidence',9.9,4.7,0.8,0.18,10,C.teal,true);txt(s,'• anomaly score 0.87\n• close approach 4h earlier\n• no major space-weather signal',9.9,4.98,2.15,0.72,11,C.muted,false);pill(s,'PROTOTYPE ASSESSMENT',9.9,5.95,1.9,C.amber);
}

// 16 MVP boundary
{ const s=slide('MVP versus future product','SCOPE CONTROL');
  txt(s,'A small number of correct, connected workflows is more valuable than a long list of half-working technologies.',0.75,1.08,11.8,0.35,18,C.white,true);
  const left=['Cached/reproducible fixtures','One satellite + ~100 objects','7-day SGP4 propagation','Miss distance + TCA ranking','Isolation Forest','Rule-based diagnosis','2D charts + tables','Precomputed what-if'];
  const right=['Continuously refreshed feeds','Constellation-scale screening','Full Pc + uncertainty modeling','LSTM / transformer ensembles','Bayesian + RAG knowledge layer','Live telemetry + alerts','3D visualization','Maneuver optimization'];
  box(s,0.8,1.75,5.65,4.65,C.panel2,C.teal);box(s,6.9,1.75,5.65,4.65,C.panel2,C.violet);txt(s,'BUILD NOW',1.15,2.05,2.0,0.25,16,C.teal,true);txt(s,'BUILD LATER',7.25,2.05,2.0,0.25,16,C.violet,true);bulletList(s,left,1.18,2.62,4.85,14,C.white,0.42);bulletList(s,right,7.28,2.62,4.85,14,C.white,0.42);
}

// 17 team
{ const s=slide('Four-person team operating model','TEAM');
  const roles=[['ORBITAL LEAD','Ingestion • SGP4 • screening\nUnits, frames, TCA',C.blue],['ML LEAD','Telemetry adapter • preprocessing\nIsolation Forest • evaluation',C.coral],['DIAGNOSIS LEAD','Correlation windows • rules\nEvidence wording • limitations',C.violet],['FRONTEND / INTEGRATION','API contracts • dashboard\nEnd-to-end demo • reliability',C.teal]];
  roles.forEach((r,i)=>{let x=0.7+i*3.08;box(s,x,1.55,2.65,2.85,C.panel2,r[2]);dot(s,x+0.3,1.95,0.15,r[2]);txt(s,r[0],x+0.55,1.78,1.85,0.45,12,r[2],true);txt(s,r[1],x+0.25,2.55,2.15,0.7,14,C.white,false);});
  box(s,1.3,5.05,10.7,0.9,C.panel,C.amber);txt(s,'TEAM RULE',1.65,5.28,1.3,0.22,11,C.amber,true);txt(s,'No generated code is accepted unless its owner can explain inputs → transformation → output → failure cases.',3.15,5.18,8.2,0.38,15,C.white,true);
}

// 18 demo flow
{ const s=slide('The three-minute demo story','DEMO');
  const d=[['1','Situation','Select target satellite',C.blue],['2','Orbit risk','Show ranked close approaches',C.amber],['3','Health signal','Replay telemetry + flag anomaly',C.coral],['4','Investigation','Open evidence context',C.violet],['5','Diagnosis','Show probable assessment',C.teal],['6','What-if','Display precomputed maneuver view',C.white]];
  d.forEach((v,i)=>{let x=0.7+i*2.08;dot(s,x+0.36,2.05,0.25,v[3]);txt(s,v[0],x+0.2,1.89,0.32,0.25,15,C.bg,true,{align:'center'});txt(s,v[1],x,2.55,1.65,0.25,12,v[3],true,{align:'center'});txt(s,v[2],x,2.95,1.65,0.5,13,C.white,false,{align:'center'});if(i<5)arrow(s,x+0.7,2.05,x+1.82,2.05,C.grid);});
  box(s,1.0,4.45,11.35,1.25,C.panel,C.teal);txt(s,'DEMO PAYOFF',1.35,4.77,1.55,0.22,11,C.teal,true);txt(s,'“Something changed” becomes “Here is the surrounding evidence that may explain it — and what the operator should review next.”',3.2,4.67,8.65,0.48,18,C.white,true);
  txt(s,'Keep the demo as one investigation, not six disconnected features.',1.0,6.18,11.3,0.28,17,C.amber,true,{align:'center'});
}

// 19 risks
{ const s=slide('Risks, mitigations, and scientific honesty','VALIDATION');
  const risks=[['Orbital units / frames / timestamps','Established libraries + sanity checks + deterministic tests',C.blue],['External API failure','Cached snapshots + complete offline fixture',C.teal],['False positives / schema mismatch','Stable adapter + measured evaluation subset',C.coral],['Overclaiming diagnosis','Use “possible” / “correlated with”; show evidence',C.amber],['Scope expansion','Cut polish before cutting integration',C.violet]];
  risks.forEach((r,i)=>{let y=1.25+i*0.82;box(s,0.8,y,11.7,0.58,C.panel2,r[2]);txt(s,r[0],1.05,y+0.15,3.6,0.2,12,r[2],true);txt(s,r[1],4.85,y+0.13,7.3,0.25,14,C.white,false);});
  txt(s,'OCAADS is a prototype decision-support system — not certified flight software or an autonomous collision predictor.',1.0,5.95,11.3,0.35,17,C.amber,true,{align:'center'});
}

// 20 roadmap
{ const s=slide('Roadmap: learn → build → integrate → validate','NEXT STEPS');
  const stages=[['1','FOUNDATION','Freeze contracts\nBuild cached fixtures',C.blue],['2','DETECTION','Orbital engine\nTelemetry engine',C.coral],['3','CORRELATION','Evidence timeline\nRule-based diagnosis',C.violet],['4','OPERATIONALIZE','Dashboard hardening\nValidation + auditability',C.teal]];
  stages.forEach((st,i)=>{let x=0.75+i*3.05;dot(s,x+0.25,2.0,0.24,st[3]);txt(s,st[0],x+0.09,1.84,0.32,0.24,14,C.bg,true,{align:'center'});if(i<3)arrow(s,x+0.52,2.0,x+2.85,2.0,C.grid);box(s,x,2.55,2.5,1.6,C.panel2,st[3]);txt(s,st[1],x+0.18,2.82,2.1,0.22,13,st[3],true);txt(s,st[2],x+0.18,3.2,2.1,0.5,14,C.white,false);});
  box(s,1.35,4.95,10.6,0.95,C.panel,C.teal);txt(s,'FIRST BUILD SLICE',1.7,5.2,1.8,0.2,11,C.teal,true);txt(s,'One target + five objects → tested SGP4 separation → one telemetry anomaly → one evidence-linked diagnosis.',3.75,5.1,7.75,0.38,16,C.white,true);
}

// 21 close
{ const s=pptx.addSlide('MASTER');txt(s,'OCAADS',0.72,0.72,3.2,0.5,32,C.teal,true);txt(s,'A clearer path from\n“something happened”\nto “here is the evidence.”',0.72,1.55,7.4,1.7,31,C.white,true);txt(s,'Accessible mission-control decision support for small-satellite operators.',0.75,3.65,6.8,0.32,17,C.muted,false);pill(s,'OBSERVE',0.75,4.55,1.0,C.blue);pill(s,'DETECT',1.95,4.55,0.95,C.coral);pill(s,'CORRELATE',3.1,4.55,1.25,C.violet);pill(s,'DIAGNOSE',4.55,4.55,1.18,C.amber);pill(s,'DECIDE',5.93,4.55,0.95,C.teal);
  orbit(s,10.0,3.55,2.35,1.35,C.blue,2);orbit(s,10.0,3.55,1.4,2.0,C.violet,1.4);dot(s,10,3.55,0.48,'1A6E9E');dot(s,11.78,2.72,0.11,C.amber);dot(s,8.3,4.5,0.12,C.coral);txt(s,'Human-in-the-loop. Evidence-first. Prototype-bounded.',0.75,6.15,8.5,0.28,16,C.amber,true);
}

pptx.writeFile({ fileName: workspacePath('OCAADS_Project_Overview.pptx') });
