const fs = require('fs');
const { join } = require('path');
const { createInterface } = require('readline');

const writeStream = fs.createWriteStream(join(__dirname, 'destination.txt'));

const readLineInterface = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Hi! Please, type some text...\n',
});

readLineInterface.prompt();

readLineInterface.on('line', (text) => {
  if (text.trim() === 'exit') {
    sayBye();
  } else {
    writeStream.write(`${text}`);
  }
});

readLineInterface.on('SIGINT', () => {
  sayBye();
});

function sayBye() {
  readLineInterface.write('Bye!');
  readLineInterface.close();
}
