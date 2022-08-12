import axios from 'axios';
import {
  ADD_ROLES,
  ADD_ROLES_REQUEST,
  SET_ROLES_LOADING,
  RESET_ROLES,
  ROLES_API,
  UPDATE_ROLE,
  GET_ROLE,
  ADD_SELECTED_ROLE_USERS,
  SET_SPACES_LOADING,
  ADD_SPACE_USERS,
  SPACE_USERS_API,
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
        console.log(response.data);
        dispatch(addRoles(response.data));
        dispatch(
          addRolesRequest({
            data: response.data.map((item) => item.id),
            query: query,
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

export const getSpaceUsers = () => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    const currentOrgID = getState().spaces?.details[currentSpaceID].organisation_id;
    const params = new URLSearchParams();
    params.append('organisation_id', currentOrgID);
    dispatch(loadingSpaces());
    return axios
      .get(SPACE_USERS_API(currentSpaceID), {
        params: params,
      })
      .then((response) => {
        dispatch(addSpaceUsers(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stoploadingSpaces()));
  };
};
export const addSpaceRoleUserByID = (data, roleId) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    const currentOrgID = getState().spaces?.details[currentSpaceID].organisation_id;
    dispatch(loadingRoles());
    return axios
      .post(ROLES_API(currentSpaceID) + '/' + roleId + '/users', {
        user: data,
        organisation_id: currentOrgID,
      })
      .then(() => {
        dispatch(resetRoles());
        dispatch(addSuccessNotification('Added user to role'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
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

// export const getSelectedRoleUsers = () => {
//     return (dispatch)=>{
//        return axios
//          .get()
//     }
// }

export const loadingRoles = () => ({
  type: SET_ROLES_LOADING,
  payload: true,
});
export const loadingSpaces = () => ({
  type: SET_SPACES_LOADING,
  payload: true,
});
export const stoploadingSpaces = () => ({
  type: SET_SPACES_LOADING,
  payload: false,
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
export const addSpaceUsers = (payload) => ({
  type: ADD_SPACE_USERS,
  payload,
});

export const addSelectedRoleUsers = (payload) => ({
  type: ADD_SELECTED_ROLE_USERS,
  payload,
});

export const addRolesRequest = (payload) => ({
  type: ADD_ROLES_REQUEST,
  payload,
});

export const resetRoles = () => ({
  type: RESET_ROLES,
});
