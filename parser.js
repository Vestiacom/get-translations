module.exports = (content, config) => {
  console.log('Parsing....');
  let result = {};
  let productColumnName = 'Product'

  config.languages.forEach((lang) => {
    result[lang.columnName] = {};

    if(config.products) {
      productColumnName = config.products.productColumnName || productColumnName;
      for (let prop in config.products.valueMap) {
        result[lang.columnName][config.products.valueMap[prop]] = {};
      }
    }
  });

  content.forEach((row) => {
    config.languages.forEach((lang) => {
      if(row[lang.columnName] || (!row[lang.columnName] && (config.includeEmptyValues || config.fallbackToLanguage))) {
        let value = row[lang.columnName];
        if(config.fallbackToLanguage) {
          value = value || row[config.fallbackToLanguage]
        }
        if(config.includeEmptyValues) {
          value = value || ''
        }
        if(config.products) {
          result[lang.columnName][config.products.valueMap[row[productColumnName]]][row[config.keysColumnName]] = value;
        } else {
          result[lang.columnName][row[config.keysColumnName]] = value;
        }
      }
    });

  });

  if(config.products && config.products.fallbackToProduct) {
    config.languages.forEach(({columnName: lang}) => {
      const productsToFallback = Object.values(config.products.valueMap).filter(product => product !== config.products.fallbackToProduct)
      const fallbackProduct =  config.products.fallbackToProduct

      productsToFallback.forEach(product => {
        Object.keys(result[lang][fallbackProduct]).forEach(translationKey => {
          if(!result[lang][product][translationKey]) {
            result[lang][product][translationKey] = result[lang][fallbackProduct][translationKey]
          }
        })
      })
    })
  }

  console.log('Parsing successful');

  return result;
};
