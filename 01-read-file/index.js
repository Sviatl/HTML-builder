const path = require('path');
const fileName = path.join(__dirname, 'text.txt');
const fs = require('fs');
const readableStream= fs.createReadStream(fileName, 'utf-8');
const { stdout } = process;
readableStream.on('data', chunk => stdout.write(chunk));
