import axios from 'axios';
import {
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
  API_ADD_SPACE,
  API_GET_SPACES,
  API_DELETE_SPACE,
  API_UPDATE_SPACE,
  SET_SELECTED_SPACE,
  DELETE_SPACE_SUCCESS,
  UPDATE_SPACE_SUCCESS,
  ADD_SPACE_USERS,
} from '../constants/spaces';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

export const getSpaces = () => {
  return (dispatch) => {
    dispatch(loadingSpaces());
    return axios
      .get(API_GET_SPACES)
      .then((response) => {
        dispatch(getSpacesSuccess(response.data.filter((org)=> org.applications!==null && org.spaces!==null)));
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const setSelectedSpace = (space) => {
  return (dispatch) => {
    dispatch({
      type: SET_SELECTED_SPACE,
      payload: space,
    });
    dispatch(addSuccessNotification('Space changed'));
  };
};

export const addSpace = (data) => {
  return (dispatch) => {
    dispatch(loadingSpaces());
    return axios
      .post(API_ADD_SPACE, data)
      .then((response) => {
        dispatch(addSpaceSuccess(response.data));
        dispatch(addSuccessNotification('Space added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const deleteSpace = (id) => {
  return (dispatch) => {
    dispatch(loadingSpaces());
    return axios
      .delete(API_DELETE_SPACE + '/' + id)
      .then(() => {
        dispatch(deleteSpaceSuccess(id));
        dispatch(addSuccessNotification('Space deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updateSpace = (data) => {
  return (dispatch) => {
    dispatch(loadingSpaces());
    return axios
      .put(API_UPDATE_SPACE + '/' + data.id, data)
      .then((response) => {
        dispatch(updateSpaceSuccess(response.data));
        dispatch(addSuccessNotification('Space updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const getSpaceUsers = () => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    dispatch(loadingSpaces());
    return axios
      .get(`/core/spaces/${currentSpaceID}/users`)
      .then((response) => {
        dispatch(addSpaceUsers(currentSpaceID, response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};
export const loadingSpaces = () => ({
  type: LOADING_SPACES,
});

export const getSpacesSuccess = (spaces) => ({
  type: GET_SPACES_SUCCESS,
  payload: spaces,
});

export const addSpaceSuccess = (space) => ({
  type: ADD_SPACE_SUCCESS,
  payload: space,
});

export const updateSpaceSuccess = (data) => ({
  type: UPDATE_SPACE_SUCCESS,
  payload: data,
});

export const deleteSpaceSuccess = (id) => ({
  type: DELETE_SPACE_SUCCESS,
  payload: id,
});

export const addSpaceUsers = (id, data) => ({
  type: ADD_SPACE_USERS,
  payload: {
    id,
    data,
  },
});
