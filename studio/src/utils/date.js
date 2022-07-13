import { listOfMonths } from "../constants/date";


export const getDatefromString = (dateString) => {
  const dateObj = new Date(Date.parse(dateString));
  return dateObj.toDateString();
};


export const getDatefromStringWithoutDay = (dateString) => {
  const dateObj = new Date(Date.parse(dateString));
  return `${listOfMonths[dateObj.getMonth()]} ${dateObj.getDate()} ${dateObj.getFullYear()}`
};

