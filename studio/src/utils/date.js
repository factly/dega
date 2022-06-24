export const getDatefromString = (dateString) => {
  const dateObj = new Date(Date.parse(dateString));
  return dateObj.toDateString();
};
