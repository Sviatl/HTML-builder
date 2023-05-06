const fs = require('fs');
const readline = require('readline');
const path = require('path');
let fileFullPath = 'output.txt';
fileFullPath = path.join(__dirname, fileFullPath);

const writeStream = fs.createWriteStream(fileFullPath, { flags: 'w' });

console.log('Введите текст для записи в файл. Для завершения введите "exit" или нажмите "Ctrl+C"');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function handleInput(input) {
  if (input.toLowerCase() === 'exit') {
    console.log('Программа завершена');
    rl.close();
    process.exit();
  }

  writeStream.write(`${input}\n`);

  rl.question('', handleInput);
}

rl.question('', handleInput);

process.on('SIGINT', () => {
  console.log('Программа завершена');
  rl.close();
  process.exit();
});