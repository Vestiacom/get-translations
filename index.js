#!/usr/bin/env node
const { GoogleSpreadsheet } = require('google-spreadsheet');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-promise');

const errorHandler = require('./error-handler');
const parser = require('./parser');
const exporter = require('./exporter');
const mandatoryFields = ['spreadsheet', 'outputFolder', 'keysColumnName'];

let doc, sheet, result;

const settings = {
  filename: argv['config-file'] || 'translations.json',
  arguments: argv,
  config: null,
  credentials: null
};

fs.readJson(settings.filename)

  .then((content) => {
    console.log('');
    settings.config = Object.assign({}, content);
    return settings.config.credentials ? fs.readJson(settings.config.credentials) : null;
  })

  .then((content) => {
    if(content) {
      settings.credentials = Object.assign({}, content);
    }
  })

  .then(async () => {
    let guard = null;

    mandatoryFields.forEach((field) => {
      if(!settings.config[field] && !guard) {
        guard = field;
      }
    });

    if(guard) {
      throw new Error({code: 'MISFIELD', Error: `Error in ${settings.filename} file. ${guard} field is mandatory`})
    }
  })

  .then(async () => {
    doc = new GoogleSpreadsheet(settings.config.spreadsheet);

    if(settings.credentials) {
      return await doc.useServiceAccountAuth(settings.credentials);
    }
  })

  .then(async () => {
    console.log('Got access in the Google Spreadsheets');

    return await doc.loadInfo();
  })

  .then(async () => {
    let index = 0;

    if(settings.config.sheetName) {
      let tempIndex = doc.sheetsByIndex.findIndex(item => item.title === settings.config.sheetName)
      console.log('index')
      console.log(doc.sheetsByIndex.findIndex(item => item.title === settings.config.sheetName))
      index = tempIndex || index
    }

    sheet = doc.sheetsByIndex[index];

    console.log(`Spreadsheet name: ${doc.title}`);
    console.log(`URL: ${doc.spreadsheetId}`);

    return await sheet.getRows();
  })

  .then((result) => {
    return parser(result, settings.config);
  })

  .then((result) => {
    return exporter(result, settings.config);
  })

  .then(() => {
    console.log('');
    console.log('🎉 Finished!');
  })

  .catch((errorObject) => {
    errorHandler({errorObject, settings})
  });
