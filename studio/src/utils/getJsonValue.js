function getJsonValue(val) {
  let regex = /,(?!\s*?[{["'\w])/;
  let formattedJson = val.replace(regex, '');
  return JSON.parse(formattedJson);
}
export default getJsonValue;