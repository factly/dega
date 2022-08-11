import axios from 'axios';
import {
  ADD_ROLES,
  ADD_ROLES_REQUEST,
  SET_ROLES_LOADING,
  RESET_ROLES,
  ROLES_API,
  UPDATE_ROLE,
  GET_ROLE,
} from '../constants/roles';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

// action to fetch all roles
// export const addDefaultRoles = (query) => {
//   return (dispatch) => {
//     dispatch(loadingRoles());
//     return axios
//       .post(ROLES_API + '/default')
//       .then((response) => {
//         dispatch(addRoles(response.data.nodes));
//         dispatch(
//           addRolesRequest({
//             data: response.data.nodes.map((item) => item.id),
//             query: query,
//             total: response.data.total,
//           }),
//         );
//       })
//       .catch((error) => {
//         dispatch(addErrorNotification(getError(error)));
//       })
//       .finally(() => dispatch(stopRolesLoading()));
//   };
// };

// action to fetch all roles
export const getRoles = (query) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    const currentOrgID = getState().spaces?.details[currentSpaceID].organisation_id;
    const params = new URLSearchParams();
    params.append('organisation_id', currentOrgID);
    dispatch(loadingRoles());
    return axios
      .get(ROLES_API(currentSpaceID), {
        params: params,
      })
      .then((response) => {
        dispatch(addRoles(response.data.nodes));
        dispatch(
          addRolesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRolesLoading()));
  };
};

// action to fetch role by id
export const getRole = (id) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    dispatch(loadingRoles());
    return axios
      .get(ROLES_API(currentSpaceID) + '/' + id)
      .then((response) => {
        dispatch(addRole(GET_ROLE, response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRolesLoading()));
  };
};

// action to create role
export const createRole = (data) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    const currentOrgID = getState().spaces?.details[currentSpaceID].organisation_id;
    dispatch(loadingRoles());
    return axios
      .post(ROLES_API(currentSpaceID), { role: data, organisation_id: currentOrgID })
      .then(() => {
        dispatch(resetRoles());
        dispatch(addSuccessNotification('Roles created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update role by id
export const updateRole = (data) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    const currentOrgID = getState().spaces?.details[currentSpaceID].organisation_id;
    dispatch(loadingRoles());
    return axios
      .put(ROLES_API(currentSpaceID) + '/' + data.id, { role: data, organisation_id: currentOrgID })
      .then((response) => {
        dispatch(addRole(UPDATE_ROLE, response.data));
        dispatch(addSuccessNotification('Roles updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRolesLoading()));
  };
};

// action to delete role by id
export const deleteRole = (id) => {
  return (dispatch) => {
    dispatch(loadingRoles());
    return axios
      .delete(ROLES_API + '/' + id)
      .then(() => {
        dispatch(resetRoles());
        dispatch(addSuccessNotification('Roles deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingRoles = () => ({
  type: SET_ROLES_LOADING,
  payload: true,
});

export const stopRolesLoading = () => ({
  type: SET_ROLES_LOADING,
  payload: false,
});

export const addRole = (type, payload) => ({
  type,
  payload,
});

export const addRoles = (payload) => ({
  type: ADD_ROLES,
  payload,
});

export const addRolesRequest = (payload) => ({
  type: ADD_ROLES_REQUEST,
  payload,
});

export const resetRoles = () => ({
  type: RESET_ROLES,
});
