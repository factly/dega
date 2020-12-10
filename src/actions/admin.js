import axios from 'axios';
import { ADD_SUPER_ORGANISATION, SET_SUPER_ORGANISATIONS_LOADING } from '../constants/admin';
import { ORGANISATION_PERMISSIONS_API } from '../constants/organisations';

import { addErrorNotification } from './notifications';

export const getSuperOrganisation = () => {
  return (dispatch) => {
    dispatch(loadingOrganisationPermissions());
    return axios
      .get(ORGANISATION_PERMISSIONS_API + '/my')
      .then((response) => {
        dispatch(getOrganisationPermissionByID(response.data));

        return response.data;
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

export const loadingOrganisationPermissions = () => ({
  type: SET_SUPER_ORGANISATIONS_LOADING,
  payload: true,
});

export const stopOrganisationPermissionsLoading = () => ({
  type: SET_SUPER_ORGANISATIONS_LOADING,
  payload: false,
});

export const getOrganisationPermissionByID = (data) => ({
  type: ADD_SUPER_ORGANISATION,
  payload: data,
});
