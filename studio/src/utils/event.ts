/**
 * Converts a dot-notation event label into a properly capitalized event name
 * @param eventLabel - The event label in dot notation (e.g. "user.login.success")
 * @returns The formatted event name with spaces and proper capitalization (e.g. "User Login Success")
 */
export const getEventName = (eventLabel: string): string => {
  const labelArr: string[] = eventLabel.split(".");

  for (let i = 0; i < labelArr.length; i++) {
    // Capitalize the first letter of each segment
    labelArr[i] = labelArr[i][0].toUpperCase() + labelArr[i].slice(1);
  }

  return labelArr.join(" ");
};
