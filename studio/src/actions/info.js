import axios from 'axios';
import { ADD_INFO, INFO_API, SET_INFO_LOADING } from '../constants/info';
import getError from '../utils/getError';
import { addErrorNotification } from './notifications';

export const getInfo = () => {
  return (dispatch) => {
    dispatch(loadingInfo(true));

    return axios
      .get(INFO_API)
      .then((response) => {
        dispatch(addInfo(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(loadingInfo(false));
      });
  };
};

export const addInfo = (data) => ({
  type: ADD_INFO,
  payload: data,
});

export const loadingInfo = (payload) => ({
  type: SET_INFO_LOADING,
  payload,
});
