const fsPromises = require('fs').promises;
const path = require('path');

let directoryPath = 'files';
directoryPath = path.join(__dirname, directoryPath);

let directoryPathDest = 'files-copy';
directoryPathDest = path.join(__dirname, directoryPathDest);

copyDir();

async function copyDir() {
  let dirExist = false;
  try {
    await fsPromises.access(directoryPathDest);
    dirExist = true;
  }
  catch {
    dirExist = false;
  }
  if (dirExist) {
    await deleteDirectory(directoryPathDest);
  }
  await copyDirectory(directoryPath, directoryPathDest);
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