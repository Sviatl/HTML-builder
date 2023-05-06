const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
let directoryPath = 'styles';
directoryPath = path.join(__dirname, directoryPath);
const newDirectoryPath = 'project-dist';
const newFilename = 'bundle.css';
const newFilePath = path.join(__dirname, newDirectoryPath, newFilename);
const writeStream = fs.createWriteStream(newFilePath, { flags: 'w' });

copyStyles();

async function copyStyles() {
  const files = await fsPromises.readdir(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = await fsPromises.stat(filePath);
    if (stats.isFile()) {
      const fileExt = path.parse(filePath).ext;
      if (fileExt.toLocaleLowerCase() === '.css') {
        await addFile(filePath);
      }
    }
  }
}

async function addFile(filePath) {
  const readableStream = fs.createReadStream(filePath, 'utf-8');
  readableStream.on('data', chunk => writeStream.write(chunk));
}
