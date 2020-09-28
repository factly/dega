import axios from 'axios';
import {
  PERMISSIONS_API,
  ADD_PERMISSIONS_REQUEST,
  SET_PERMISSIONS_LOADING,
  ADD_PERMISSIONS,
} from '../constants/permissions';
import { addErrorNotification } from './notifications';

export const getPermissions = (id) => {
  return (dispatch) => {
    dispatch(loadingPermissionss());
    return axios
      .get(PERMISSIONS_API + id + '/permissions')
      .then((response) => {
        dispatch(addPermissionList([{ data: response.data, user_id: parseInt(id) }]));
        dispatch(addRequest([parseInt(id)]));
        dispatch(stopLoading());

        return { data: response.data, user_id: parseInt(id) };
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addPermissionList = (data) => ({
  type: ADD_PERMISSIONS,
  payload: data,
});

export const addRequest = (data) => ({
  type: ADD_PERMISSIONS_REQUEST,
  payload: data,
});

export const loadingPermissionss = () => ({
  type: SET_PERMISSIONS_LOADING,
  payload: true,
});

export const stopLoading = () => ({
  type: SET_PERMISSIONS_LOADING,
  payload: false,
});
