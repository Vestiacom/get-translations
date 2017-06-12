module.exports = (content, config) => {
  console.log('Parsing....');
  let result = {};

  config.languages.forEach((lang) => {
    result[lang.columnName] = {};


    if(config.products) {
      for (let prop in config.products.valueMap) {
        result[lang.columnName][config.products.valueMap[prop]] = {};
      }
    }
  });

  content.forEach((row) => {
    config.languages.forEach((lang) => {
      if(row[lang.columnName] || (row[lang.columnName] === '' && config.includeEmptyValues)) {
        if(config.products) {
          result[lang.columnName][config.products.valueMap[row.product]][row[config.keysColumnName]] = row[lang.columnName];
        } else {
          result[lang.columnName][row[config.keysColumnName]] = row[lang.columnName];
        }
      }
    });

  });

  console.log('Parsing successful');

  return result;
};