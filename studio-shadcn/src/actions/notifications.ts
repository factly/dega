import { ADD_NOTIFICATION } from '../constants/notifications';

// Define the notification types
type NotificationType = 'error' | 'success';

// Interface for the notification payload
interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  time: number;
}

// Interface for the notification action
interface NotificationAction {
  type: typeof ADD_NOTIFICATION;
  payload: NotificationPayload;
}

export const addErrorNotification = (data: string): NotificationAction => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: 'error',
    title: 'Error',
    message: data,
    time: Date.now(),
  },
});

export const addSuccessNotification = (data: string): NotificationAction => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: 'success',
    title: 'Success',
    message: data,
    time: Date.now(),
  },
});