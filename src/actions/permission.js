import axios from 'axios';
import {
  PERMISSIONS_API,
  ADD_PERMISSIONS_REQUEST,
  SET_PERMISSIONS_LOADING,
  ADD_PERMISSIONS,
} from '../constants/permissions';
import { ADD_USER_PERMISSION } from '../constants/spaces';
import { addErrorNotification } from './notifications';

export const getPermissions = (query) => {
  return (dispatch) => {
    dispatch(loadingPermissionss());
    return axios
      .get(PERMISSIONS_API + query.user_id + '/permissions')
      .then((response) => {
        dispatch(addPermissionList([{ data: response.data, user_id: parseInt(query.user_id) }]));
        dispatch(addRequest([parseInt(query.user_id)]));
        dispatch(stopLoading());

        if (query.space_id > 0)
          dispatch(addUserPermission({ permissions: response.data, id: query.space_id }));

        return { data: response.data, user_id: parseInt(query.user_id) };
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addUserPermission = (data) => ({
  type: ADD_USER_PERMISSION,
  payload: data,
});

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
