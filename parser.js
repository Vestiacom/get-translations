module.exports = (content, config) => {
  console.log('Parsing....');
  let result = {};

  config.languages.forEach((lang) => {
    result[lang.columnName] = {};

    for (let prop in config.products.valueMap) {
      result[lang.columnName][config.products.valueMap[prop]] = {};
    }
  });

  content.forEach((row) => {
    config.languages.forEach((lang) => {
      if(row[lang.columnName] && row[lang.columnName] !== '') {
        result[lang.columnName][config.products.valueMap[row.product]][row[config.keysColumnName]] = row[lang.columnName];
      }
    });

  });

  console.log('Parsing successful');

  return result;
};