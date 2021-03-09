import { ADD_NOTIFICATION } from '../constants/notifications';

export const addErrorNotification = (data) => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: 'error',
    title: 'Error',
    message: data,
    time: Date.now(),
  },
});

export const addSuccessNotification = (data) => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: 'success',
    title: 'Success',
    message: data,
    time: Date.now(),
  },
});
