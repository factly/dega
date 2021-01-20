import axios from 'axios';
import { ADD_SUPER_ORGANISATION, SET_SUPER_ORGANISATIONS_LOADING } from '../constants/admin';
import { ORGANISATION_PERMISSIONS_API } from '../constants/organisations';

import { addErrorNotification } from './notifications';
import getError from '../utils/getError';

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
        dispatch(addErrorNotification(getError(error)));
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
