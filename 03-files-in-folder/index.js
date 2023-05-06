const fs = require('fs');
const path = require('path');
let directoryPath = 'secret-folder';
directoryPath = path.join(__dirname, directoryPath);

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.log(`Ошибка при чтении директории: ${err}`);
  } else {
    console.log(`Файлы в директории ${directoryPath}:`);
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.log(`Ошибка при чтении файла ${filePath}: ${err}`);
        } else {
          if (stats.isFile()) {
            const fileName = path.parse(filePath).name;
            const fileExt = path.parse(filePath).ext;
            const fileSize = stats.size;
            console.log(`${fileName} - ${fileExt.replace(/^\./, '')} - ${fileSize/1000}kb`);
          }
        }
      });
    });
  }
});