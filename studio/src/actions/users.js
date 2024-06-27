import axios from 'axios';
import { USERS_API, ADD_USERS_REQUEST, SET_USERS_LOADING, ADD_USERS } from '../constants/users';
import { addErrorNotification } from './notifications';
import getError from '../utils/getError';

export const getUsers = (query) => {
  return (dispatch) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addUsers(response.data.nodes));

        dispatch(
          addRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const addUsers = (data) => ({
  type: ADD_USERS,
  payload: data,
});

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
