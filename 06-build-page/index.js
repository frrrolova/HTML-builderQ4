const { readdir, mkdir, copyFile, rm } = require('node:fs/promises');
const { extname, parse, join } = require('path');
const fs = require('fs');

const newFolder = join(__dirname, 'project-dist');

mkdir(newFolder, { recursive: true })
  .then(() => createIndexHtml())
  .then(() => mergeStyles())
  .then(() => makeAssets(newFolder));

//recursively creating assets folder
function makeAssets(destinationFolder) {
  const assetsFolder = join(destinationFolder, 'assets');
  const currentAssetsFolder = join(__dirname, 'assets');
  return rm(assetsFolder, { recursive: true, force: true })
    .then(() => mkdir(assetsFolder, { recursive: true }))
    .then(() => copyDirectory(currentAssetsFolder, assetsFolder));
}

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

function createIndexHtml() {
  const componentsFolder = join(__dirname, 'components');
  const templateFile = join(__dirname, 'template.html');

  return readFile(templateFile)
    .then((templateContent) => {
      return readdir(componentsFolder, { withFileTypes: true })
        .then((files) => {
          return files.filter((file) => {
            const extention = extname(componentsFolder + file.name);
            return file.isFile() && extention === '.html';
          });
        })
        .then((componentFiles) => {
          const componentNames = componentFiles.map(
            (file) => parse(join(componentsFolder, file.name)).name,
          );

          const promisesArray = componentNames.map((name) =>
            readFile(join(componentsFolder, name + '.html')),
          );

          return Promise.all(promisesArray).then((componentsContents) => {
            for (let i = 0; i < componentNames.length; i++) {
              templateContent = templateContent.replaceAll(
                `{{${componentNames[i]}}}`,
                componentsContents[i],
              );
            }
            return templateContent;
          });
        });
    })
    .then((templateContent) => {
      const indexFile = join(__dirname, 'project-dist', 'index.html');
      const writeStream = fs.createWriteStream(indexFile);
      writeStream.write(templateContent);
    });
}

function mergeStyles() {
  const filesPath = join(__dirname, 'styles');

  return readdir(filesPath, { withFileTypes: true })
    .then((files) => {
      return files.filter((file) => {
        const extention = extname(join(filesPath, file.name));
        return file.isFile() && extention === '.css';
      });
    })
    .then((files) => {
      const filesPromises = files.map((file) =>
        readFile(join(filesPath, file.name)),
      );
      return Promise.all(filesPromises);
    })
    .then((filesContents) => {
      return filesContents.join('\n/*<--------------------------------->*/\n');
    })
    .then((allStyles) => {
      const stylesFile = join(__dirname, 'project-dist', 'style.css');
      const writeStream = fs.createWriteStream(stylesFile);
      writeStream.write(allStyles);
    });
}

function copyDirectory(path, destination) {
  return readdir(path, { withFileTypes: true }).then((files) => {
    files.forEach((file) => {
      const newPath = join(path, file.name);
      const newDestination = join(destination, file.name);

      if (file.isDirectory()) {
        mkdir(newDestination, { recursive: true }).then(() =>
          copyDirectory(newPath, newDestination),
        );
      } else {
        copyFile(newPath, newDestination);
      }
    });
  });
}
