const Promise = require('bluebird');
const fs = require('fs-promise');
const fsOriginal = require('fs');
const path = require('path');

const createDirs = outputPath => {
  if (!fsOriginal.existsSync(outputPath)){
    const parts = path.join(outputPath).split('/');
    let dirpath = '';

    parts.forEach((value, key) => {
      if(value === '' || value.includes('.json')) {
        return;
      }

      dirpath += value;
      if(!fsOriginal.existsSync(dirpath)) {
        fsOriginal.mkdirSync(dirpath);
      }
      dirpath += '/';
    });
  }
}

module.exports = (content, config) => {
  console.log('Exporting....');

  let promises = [];

  config.languages.forEach(({columnName: lang, filename}) => {
    const outputPath = path.join(config.outputFolder, filename);

    createDirs(outputPath)
    if(config.products && config.products.separatedOutputDirs) {
      Object.values(config.products.separatedOutputDirs).forEach(value => {
        createDirs(path.join(outputPath, value))
      })
    }

    // console.log(content);

    if(config.products && config.products.separatedOutputDirs) {
      Object.keys(config.products.separatedOutputDirs).forEach(key => {
        promises.push(fs.writeFile(path.join(config.outputFolder, config.products.separatedOutputDirs[key], filename),  JSON.stringify(content[lang][key], null, 2), {flag: 'w'}));
      })
    } else {
      promises.push(fs.writeFile(outputPath,  JSON.stringify(content[lang], null, 2), {flag: 'w'}));
    }
  });

  console.log('Exporting successful');

  return Promise.all(promises);
};
