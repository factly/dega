import axios from 'axios';
import { USERS_API, ADD_USERS_REQUEST, SET_USERS_LOADING } from '../constants/users';
import { addErrorNotification } from './notifications';

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
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
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
