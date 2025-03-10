import { ADD_NOTIFICATION } from "../constants/notifications";
import { NotificationAction } from "./types";

export const addErrorNotification = (data: string): NotificationAction => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: "error",
    title: "Error",
    message: data,
    time: Date.now(),
  },
});

export const addSuccessNotification = (data: string): NotificationAction => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: "success",
    title: "Success",
    message: data,
    time: Date.now(),
  },
});
