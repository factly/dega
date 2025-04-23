import { listOfMonths } from "../constants/date";
import dayjs from "dayjs";

export const getDatefromString = (dateString: string): string => {
  const dateObj = new Date(Date.parse(dateString));
  return dateObj.toDateString();
};

export const getDateAndTimeFromString = (dateString: string): string =>
  new Date(dateString).toLocaleString().replace(/,/g, "").replace(/\//g, "-");

export const getDatefromStringWithoutDay = (dateString: string): string => {
  const dateObj = new Date(Date.parse(dateString));
  return `${
    listOfMonths[dateObj.getMonth()]
  } ${dateObj.getDate()} ${dateObj.getFullYear()}`;
};

export const formatDate = (dateString: string, format?: string): string => {
  if (format) {
    return dayjs(dateString).format(format);
  }
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  let formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  formattedDate = formattedDate.replace(/,/g, "").replace(/\//g, "-");
  const [month, year, time, period] = formattedDate.split(" ");
  let [day] = formattedDate.split(" ");
  const formattedTime = time
    .split(":")
    .map((str) => str.padStart(2, "0"))
    .join(":");

  day = day.padStart(2, "0");
  const formattedDateString = `${month} ${day}, ${year} ${formattedTime} ${period}`;

  return formattedDateString;
};

export const getDifferenceInModifiedTime = (updated_at: string): string => {
  const date = new Date(updated_at);
  const now = new Date();
  const diff = Math.abs(now.getTime() - date.getTime());
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  let lastModified = "";
  if (days > 0) {
    lastModified = `Last modified: ${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    lastModified = `Last modified: ${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    lastModified = `Last modified: ${minutes} minute${
      minutes > 1 ? "s" : ""
    } ago`;
  } else {
    lastModified = `Last modified: a few seconds ago`;
  }

  return lastModified;
};
