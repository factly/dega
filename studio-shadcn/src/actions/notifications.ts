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

export interface NotificationAction {
  type: typeof ADD_NOTIFICATION;
  payload: NotificationPayload;
}

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
