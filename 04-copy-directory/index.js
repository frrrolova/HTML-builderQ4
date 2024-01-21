const { readdir, mkdir, copyFile, rm } = require('node:fs/promises');
const { join } = require('path');
const folderCopy = join(__dirname, 'files-copy');

rm(folderCopy, { recursive: true, force: true })
  .then(() => mkdir(folderCopy, { recursive: true }))
  .then(() => readdir(join(__dirname, 'files')))
  .then((files) => {
    files.forEach((file) => {
      copyFile(join(__dirname, 'files', file), join(folderCopy, file));
    });
  });
