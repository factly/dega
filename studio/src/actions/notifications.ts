import { ADD_NOTIFICATION } from "../constants/notifications";
import { Dispatch, AnyAction } from "redux";

// Notification types
export type NotificationType = "error" | "success";

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  time: number;
}

export interface NotificationAction extends AnyAction {
  type: typeof ADD_NOTIFICATION;
  payload: NotificationPayload;
}

export interface ErrorNotificationData {
  message: string;
}

export const addErrorNotification = (
  data: string | ErrorNotificationData
): NotificationAction => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: "error",
    title: "Error",
    message: typeof data === "string" ? data : data.message,
    time: Date.now(),
  },
});

export interface SuccessNotificationData {
  message: string;
}

export const addSuccessNotification = (
  data: string | SuccessNotificationData
): NotificationAction => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: "success",
    title: "Success",
    message: typeof data === "string" ? data : data.message,
    time: Date.now(),
  },
});

// Helper thunk to allow for timed notifications
export const showNotification = (type: NotificationType, message: string) => {
  return (dispatch: Dispatch<AnyAction>) => {
    if (type === "error") {
      dispatch(addErrorNotification(message));
    } else {
      dispatch(addSuccessNotification(message));
    }
  };
};
