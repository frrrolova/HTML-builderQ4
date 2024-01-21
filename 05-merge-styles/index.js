const { readdir } = require('node:fs/promises');
const path = require('path');
const fs = require('fs');

const filesPath = path.join(__dirname, 'styles');

readdir(filesPath, { withFileTypes: true })
  .then((files) => {
    return files.filter((file) => {
      const extention = path.extname(path.join(filesPath, file.name));
      return file.isFile() && extention === '.css';
    });
  })
  .then((files) => {
    const filesPromises = files.map((file) =>
      readFile(path.join(filesPath, file.name)),
    );
    return Promise.all(filesPromises);
  })
  .then((filesContents) => {
    return filesContents.join('\n/*<--------------------------------->*/\n');
  })
  .then((allStyles) => {
    const writeStream = fs.createWriteStream(
      path.join(__dirname, 'project-dist', 'bundle.css'),
    );
    writeStream.write(allStyles);
  });

function readFile(path) {
  return new Promise((resolve) => {
    const readableStream = fs.createReadStream(path, 'utf-8');

    let data = '';
    readableStream.on('data', (chunk) => {
      data += chunk;
    });
    readableStream.on('end', () => {
      resolve(data);
    });
  });
}
