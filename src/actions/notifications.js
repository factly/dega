import { ADD_ERRORS } from '../constants/notifications';

export const addErrors = (data) => ({
  type: ADD_ERRORS,
  payload: data,
});
