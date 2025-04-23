export const getTrimmedURL = (string?: string): string => {
  if (!string) return "";

  const maxLength: number = 70;
  const trimmedString: string =
    string.length > maxLength
      ? string.substring(0, maxLength - 3) + "..."
      : string;
  return trimmedString;
};
