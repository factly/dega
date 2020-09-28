import axios from 'axios';
import { USERS_API, ADD_USERS_REQUEST, SET_USERS_LOADING } from '../constants/users';
import { addErrorNotification } from './notifications';

export const getUsers = (query) => {
  return (dispatch) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addRequest({
            data: response.data.nodes,
          }),
        );
        dispatch(stopLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
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
