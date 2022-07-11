export const getTrimmedURL = (string) => {
  const maxLength = 70;
  var trimmedString =
    string?.length > maxLength ? string.substring(0, maxLength - 3) + '...' : string;
  return trimmedString;
};
