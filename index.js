#!/usr/bin/env node
const GoogleSpreadsheet = require('google-spreadsheet');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-promise');
const Promise = require('bluebird');

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

  .then(() => {
    let guard = null;

    mandatoryFields.forEach((field) => {
      if(!settings.config[field] && !guard) {
        guard = field;
      }
    });

    if(guard) {
      return Promise.reject({code: 'MISFIELD', Error: `Error in ${settings.filename} file. ${guard} field is mandatory`})
    } else {
      Promise.resolve();
    }
  })

  .then(() => {
    doc = Promise.promisifyAll(new GoogleSpreadsheet(settings.config.spreadsheet));

    if(settings.credentials) {
      return Promise.promisify(doc.useServiceAccountAuth)(settings.credentials);
    } else {
      return Promise.resolve();
    }

  })

  .then(() => {
    console.log('Got access in the Google Spreadsheets');

    return Promise.promisify(doc.getInfo)();
  })

  .then((result) => {
    sheet = result.worksheets[0];

    console.log(`Spreadsheet name: ${result.title}`);
    console.log(`URL: ${result.id}`);
    console.log(`Last modified: ${result.updated}`);

    return Promise.promisify(sheet.getRows)(1);
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