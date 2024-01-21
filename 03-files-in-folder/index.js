const { readdir, stat } = require('node:fs/promises');
const { join } = require('path');

readdir(join(__dirname, 'secret-folder'), { withFileTypes: true })
  .then((files) => {
    return files.filter((file) => file.isFile());
  })
  .then((files) => {
    console.log(files);
    files.forEach((file) => {
      const fullName = file.name.split('.');
      const name = fullName[0];
      const ext = fullName[1];
      stat(join(__dirname, 'secret-folder', file.name)).then((fileStat) => {
        const size = fileStat.size;
        console.log(`${name} - ${ext} - ${size / 1024}kb`);
      });
    });
  });
