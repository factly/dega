import { ADD_NOTIFICATION } from '../constants/notifications';

export const addErrors = (data) => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: 'error',
    title: 'Error',
    message: data,
  },
});

export const addSuccess = (data) => ({
  type: ADD_NOTIFICATION,
  payload: {
    type: 'success',
    title: 'Success',
    message: data,
  },
});
