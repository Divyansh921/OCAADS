const fs=require('fs');
const workspacePath = require('./workspace-path');
const b=fs.readFileSync(workspacePath('OCAADS_CodeSwift_Submission.pdf'));
const s=b.toString('latin1');
const pages=(s.match(/\/Type \/Page(?!s)/g)||[]).length;
const boxes=(s.match(/\/MediaBox/g)||[]).length;
console.log(JSON.stringify({bytes:b.length,pages,mediaBoxes:boxes,header:s.slice(0,8),eof:s.slice(-20)},null,2));
