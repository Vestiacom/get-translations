const Promise = require('bluebird');
const fs = require('fs-promise');
const fsOriginal = require('fs');
const path = require('path');

module.exports = (content, config) => {
  console.log('Exporting....');

  let promises = [];

  config.languages.forEach(({columnName: lang, filename}) => {
    const outputPath = path.join(config.outputFolder, filename);

    if (!fsOriginal.existsSync(config.outputFolder)){
      const parts = path.join(config.outputFolder).split('/');
      let dirpath = '';

      parts.forEach((value, key) => {
        if(value === '') {
          return;
        }

        dirpath += value;
        fsOriginal.mkdirSync(dirpath);
        dirpath += '/';
      });
    }

    console.log(content[lang]);

    promises.push(fs.writeFile(outputPath,  JSON.stringify(content[lang], null, 2), {flag: 'w'}));
  });

  console.log('Exporting successful');

  return Promise.all(promises);
};