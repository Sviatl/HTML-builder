const fsPromises = require('fs').promises;
const fs = require('fs');
const readline = require('readline');
const path = require('path');
let fileNameHTMLSource = 'template.html';
fileNameHTMLSource = path.join(__dirname, fileNameHTMLSource);
let componentsPath = 'components';
componentsPath = path.join(__dirname, componentsPath);
let directoryPathCSS = 'styles';
directoryPathCSS = path.join(__dirname, directoryPathCSS);
let newDirectoryPath = 'project-dist';
newDirectoryPath = path.join(__dirname, newDirectoryPath);


buildPage();

async function buildPage() {
  // 1. Delete dest dir if exists
  let dirExist = false;
  try {
    await fsPromises.access(newDirectoryPath);
    dirExist = true;
  }
  catch {
    dirExist = false;
  }
  if (dirExist) {
    await deleteDirectory(newDirectoryPath);
  }

  //2. Make dir dist
  await fsPromises.mkdir(newDirectoryPath, { recursive: true });

  //3. Build html
  let fileNameHTML = 'index.html';
  fileNameHTML = path.join(newDirectoryPath, fileNameHTML);
  const writeStream = await fs.createWriteStream(fileNameHTML, { flags: 'w' });
  await addFileHTML(fileNameHTMLSource, writeStream);

  //4. Build css
  await copyStyles();

  //5. copy assets
  const source = path.join(__dirname, 'assets');
  const dest = path.join(newDirectoryPath, 'assets');
  copyDirectory(source, dest);
}

async function addFileHTML(filePath, writeStream) {
  const readableStream = fs.createReadStream(filePath, 'utf-8');
  const rl = await readline.createInterface({
    input: readableStream,
    crlfDelay: Infinity
  });
  await rl.on('line', (line) => {
    const regex = /\{\{(\w+)\}\}/;
    const match = line.match(regex);

    if (match) {
      const section = match[1];
      getSection(section, writeStream);
    } else {
      writeStream.write(line);
    }
  });
}

function getSection(section, writeStream) {
  fs.readdir(componentsPath, (err, files) => {
    if (err) {
      console.log(`Ошибка при чтении директории: ${err}`);
    } else {
      files.forEach((file) => {
        const filePath = path.join(componentsPath, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.log(`Ошибка при чтении файла ${filePath}: ${err}`);
          } else {
            if (stats.isFile()) {
              const fileName = path.parse(filePath).name;
              if (fileName === section) {
                const readableStream = fs.createReadStream(filePath, 'utf-8');
                readableStream.on('data', chunk => writeStream.write(chunk));
              }
            }
          }
        });
      });
    }
  });
}

async function deleteDirectory(dirPath) {
  await deleteInnerOfDirectory(dirPath);

  await fsPromises.rmdir(dirPath);
}

async function deleteInnerOfDirectory(dirPath) {
  const files = await fsPromises.readdir(dirPath);

  for (const file of files) {
    const filename = path.join(dirPath, file);
    const stats = await fsPromises.stat(filename);
    if (stats.isFile()) {
      await fsPromises.unlink(filename);
    }
    else { await deleteDirectory(filename); }
  }

}

async function copyStyles() {
  const newFilenameCSS = 'style.css';
  const newFilePathCSS = path.join(newDirectoryPath, newFilenameCSS);
  const writeStreamCSS = fs.createWriteStream(newFilePathCSS, { flags: 'w' });
  const files = await fsPromises.readdir(directoryPathCSS);
  for (const file of files) {
    const filePath = path.join(directoryPathCSS, file);
    const stats = await fsPromises.stat(filePath);
    if (stats.isFile()) {
      const fileExt = path.parse(filePath).ext;
      if (fileExt.toLocaleLowerCase() === '.css') {
        await addFile(filePath, writeStreamCSS);
      }
    }
  }
}

async function addFile(filePath, writeStreamCSS) {
  const readableStream = fs.createReadStream(filePath, 'utf-8');
  readableStream.on('data', chunk => writeStreamCSS.write(chunk));
}

async function copyDirectory(source, dest) {
  await fsPromises.mkdir(dest, { recursive: true });
  const files = await fsPromises.readdir(source);

  for (const filename of files) {
    const sourceFile = path.join(source, filename);
    const destFile = path.join(dest, filename);
    const stats = await fsPromises.stat(sourceFile);
    if (stats.isFile()) {
      await fsPromises.copyFile(sourceFile, destFile);
    }
    else {
      await fsPromises.mkdir(destFile, { recursive: true });
      await copyDirectory(sourceFile, destFile);
    }
  }

}
