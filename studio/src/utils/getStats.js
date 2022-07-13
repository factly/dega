export function getResultStringFromStats(stats, total) {
  var languageCount = 0;
  if (stats?.humanlanguage) {
    languageCount = Object.keys(stats.humanlanguage).length;
  }
  var publisherCount = 0;
  if (stats?.['publisher.site']) {
    publisherCount = Object.keys(stats['publisher.site']).length;
  }

  var countryCount = 0;
  if (stats?.publishercountry) {
    countryCount = Object.keys(stats.publishercountry).length;
  }

  var resultString = `${total} Results in `;
  if (languageCount) {
    if (languageCount === 1) resultString += `${languageCount} Language, `;
    else resultString += `${languageCount} Languages, `;
  }

  if (publisherCount) {
    if (publisherCount === 1) resultString += `${publisherCount} Publisher `;
    else resultString += `${publisherCount} Publishers `;
  }

  if (countryCount) {
    if (countryCount === 1) {
      if (publisherCount || countryCount) {
        resultString += `and ${countryCount} Country`;
      } else {
        resultString += `${countryCount} Country`;
      }
    } else {
      if (publisherCount || countryCount) {
        resultString += `and ${countryCount} Countries`;
      } else {
        resultString += `${countryCount} Countries`;
      }
    }
  }

  return resultString;
}
