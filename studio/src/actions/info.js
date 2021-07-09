import axios from 'axios';
import { ADD_INFO, INFO_API } from '../constants/info';
import getError from '../utils/getError';
import { addErrorNotification } from './notifications';

export const getInfo = () => {
  return (dispatch) => {
    return axios
      .get(INFO_API)
      .then((response) => {
        dispatch(addInfo(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addInfo = (data) => ({
  type: ADD_INFO,
  payload: data,
});
