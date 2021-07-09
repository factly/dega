import axios from 'axios';
import { USERS_API, ADD_USERS_REQUEST, SET_USERS_LOADING } from '../constants/users';
import { addErrorNotification } from './notifications';
import getError from '../utils/getError';

export const getUsers = () => {
  return (dispatch) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API)
      .then((response) => {
        dispatch(
          addRequest({
            data: response.data.nodes,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const addRequest = (data) => ({
  type: ADD_USERS_REQUEST,
  payload: data,
});

export const loadingUsers = () => ({
  type: SET_USERS_LOADING,
  payload: true,
});

export const stopLoading = () => ({
  type: SET_USERS_LOADING,
  payload: false,
});
