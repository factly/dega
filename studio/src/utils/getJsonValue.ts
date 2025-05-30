function getJsonValue(val: string): any {
  const regex = /,(?!\s*?[{["'\w])/;
  const formattedJson = val.replace(regex, "");
  return JSON.parse(formattedJson);
}

export default getJsonValue;
