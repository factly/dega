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
export const getRoles = (query) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    dispatch(loadingRoles());
    return axios
      .get(ROLES_API(currentSpaceID))
      .then((response) => {
        dispatch(addRoles(response.data));
        dispatch(
          addRolesRequest({
            //! HERE EITHER WE HAVE TO USE MAP OVER data.nodes
            data: response.data.map((item) => item.id),
            query: query,
            //! or we have to change the response.data.total to response.data.length
            total: response.data.length,
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
    dispatch(loadingRoles());
    return axios
      .post(ROLES_API(currentSpaceID), data)
      .then(() => {
        dispatch(resetRoles());
        dispatch(addSuccessNotification('Role created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      //! HERE WE HAVE TO STOP LOADING AFTER CREATING ROLE
      .finally(() => dispatch(stopRolesLoading()));
  };
};

// action to update role by id
export const updateRole = (data) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    dispatch(loadingRoles());
    return axios
      .put(ROLES_API(currentSpaceID) + '/' + data.id, data)
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
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    dispatch(loadingRoles());
    return axios
      .delete(ROLES_API(currentSpaceID) + '/' + id)
      .then(() => {
        dispatch(resetRoles());
        dispatch(addSuccessNotification('Roles deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(stopRolesLoading());
      });
  };
};

export const addRoleUser = (roleID, data) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    dispatch(loadingRoles());
    return axios
      .post(`${ROLES_API(currentSpaceID)}/${roleID}/users`, data)
      .then(() => {
        dispatch(addSuccessNotification('User Added Succesfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(stopRolesLoading());
      });
  };
};

export const deleteRoleUser = (roleID, userID) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    dispatch(loadingRoles());
    return axios
      .delete(`${ROLES_API(currentSpaceID)}/${roleID}/users/${userID}`)
      .then(() => {
        dispatch(addSuccessNotification('User Deleted Succesfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(stopRolesLoading());
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
