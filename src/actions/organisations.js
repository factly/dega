import axios from 'axios';
import {
  ADD_ORGANISATION_PERMISSION,
  ADD_ORGANISATION_PERMISSIONS,
  ADD_ORGANISATION_PERMISSIONS_REQUEST,
  SET_ORGANISATION_PERMISSIONS_LOADING,
  RESET_ORGANISATION_PERMISSIONS,
  ORGANISATION_PERMISSIONS_API,
} from '../constants/organisations';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const getOrganisations = (query) => {
  return (dispatch) => {
    dispatch(loadingOrganisationPermissions());
    return axios
      .get(ORGANISATION_PERMISSIONS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addOrganisationPermissionsList(
            response.data.nodes.map((organisation_permission) => organisation_permission),
          ),
        );
        dispatch(
          addOrganisationPermissionsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors &&
          error.response.data.errors.length > 0
        ) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      })
      .finally(() => dispatch(stopOrganisationPermissionsLoading()));
  };
};

export const addOrganisationPermission = (data) => {
  return (dispatch) => {
    dispatch(loadingOrganisationPermissions());
    return axios
      .post(ORGANISATION_PERMISSIONS_API, data)
      .then(() => {
        dispatch(resetOrganisationPermissions());
        dispatch(addSuccessNotification('Organisation Permission added'));
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

export const updateOrganisationPermission = (data) => {
  return (dispatch) => {
    dispatch(loadingOrganisationPermissions());
    return axios
      .put(ORGANISATION_PERMISSIONS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getOrganisationPermissionByID(response.data));
        dispatch(addSuccessNotification('Organisation Permission updated'));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      })
      .finally(() => dispatch(stopOrganisationPermissionsLoading()));
  };
};

export const deleteOrganisationPermission = (id) => {
  return (dispatch) => {
    dispatch(loadingOrganisationPermissions());
    return axios
      .delete(ORGANISATION_PERMISSIONS_API + '/' + id)
      .then(() => {
        dispatch(resetOrganisationPermissions());
        dispatch(addSuccessNotification('Organisation Permission deleted'));
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

export const addOrganisationPermissions = (organisation_permissions) => {
  return (dispatch) => {
    dispatch(
      addOrganisationPermissionsList(
        organisation_permissions.map((organisation_permission) => organisation_permission),
      ),
    );
  };
};

export const loadingOrganisationPermissions = () => ({
  type: SET_ORGANISATION_PERMISSIONS_LOADING,
  payload: true,
});

export const stopOrganisationPermissionsLoading = () => ({
  type: SET_ORGANISATION_PERMISSIONS_LOADING,
  payload: false,
});

export const getOrganisationPermissionByID = (data) => ({
  type: ADD_ORGANISATION_PERMISSION,
  payload: data,
});

export const addOrganisationPermissionsList = (data) => ({
  type: ADD_ORGANISATION_PERMISSIONS,
  payload: data,
});

export const addOrganisationPermissionsRequest = (data) => ({
  type: ADD_ORGANISATION_PERMISSIONS_REQUEST,
  payload: data,
});

export const resetOrganisationPermissions = () => ({
  type: RESET_ORGANISATION_PERMISSIONS,
});
