const path = require('node:path');

// Resolve document inputs/outputs relative to the documentation workspace,
// not the shell's current directory. This file lives in coding/tools/documents/.
module.exports = (...parts) => path.resolve(__dirname, '../../..', ...parts);
