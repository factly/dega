import axios from 'axios';
import {
  ADD_SPACE_PERMISSION,
  ADD_SPACE_PERMISSIONS,
  ADD_SPACE_PERMISSIONS_REQUEST,
  SET_SPACE_PERMISSIONS_LOADING,
  RESET_SPACE_PERMISSIONS,
  SPACE_PERMISSIONS_API,
} from '../constants/spacePermissions';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const getSpaces = (query) => {
  return (dispatch) => {
    dispatch(loadingSpacePermissions());
    return axios
      .get(SPACE_PERMISSIONS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addSpacePermissionsList(response.data.nodes.map((space_permission) => space_permission)),
        );
        dispatch(
          addSpacePermissionsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
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
      .finally(() => dispatch(stopSpacePermissionsLoading()));
  };
};

export const addSpacePermission = (data) => {
  return (dispatch) => {
    dispatch(loadingSpacePermissions());
    return axios
      .post(SPACE_PERMISSIONS_API, data)
      .then(() => {
        dispatch(resetSpacePermissions());
        dispatch(addSuccessNotification('Space Permission added'));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      });
  };
};

export const updateSpacePermission = (data) => {
  return (dispatch) => {
    dispatch(loadingSpacePermissions());
    return axios
      .put(SPACE_PERMISSIONS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getSpacePermissionByID(response.data));
        dispatch(addSuccessNotification('Space Permission updated'));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      })
      .finally(() => dispatch(stopSpacePermissionsLoading()));
  };
};

export const deleteSpacePermission = (id) => {
  return (dispatch) => {
    dispatch(loadingSpacePermissions());
    return axios
      .delete(SPACE_PERMISSIONS_API + '/' + id)
      .then(() => {
        dispatch(resetSpacePermissions());
        dispatch(addSuccessNotification('Space Permission deleted'));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      });
  };
};

export const addSpacePermissions = (space_permissions) => {
  return (dispatch) => {
    dispatch(
      addSpacePermissionsList(space_permissions.map((space_permission) => space_permission)),
    );
  };
};

export const loadingSpacePermissions = () => ({
  type: SET_SPACE_PERMISSIONS_LOADING,
  payload: true,
});

export const stopSpacePermissionsLoading = () => ({
  type: SET_SPACE_PERMISSIONS_LOADING,
  payload: false,
});

export const getSpacePermissionByID = (data) => ({
  type: ADD_SPACE_PERMISSION,
  payload: data,
});

export const addSpacePermissionsList = (data) => ({
  type: ADD_SPACE_PERMISSIONS,
  payload: data,
});

export const addSpacePermissionsRequest = (data) => ({
  type: ADD_SPACE_PERMISSIONS_REQUEST,
  payload: data,
});

export const resetSpacePermissions = () => ({
  type: RESET_SPACE_PERMISSIONS,
});
