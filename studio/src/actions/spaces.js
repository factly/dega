import axios from 'axios';
import {
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
  API_SPACES,
  SET_SELECTED_SPACE,
  DELETE_SPACE_SUCCESS,
  UPDATE_SPACE_SUCCESS,
} from '../constants/spaces';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

export const getSpaces = () => {
  return (dispatch) => {
    dispatch(loadingSpaces(true));
    return axios
      .get(API_SPACES + '/my')
      .then((response) => {
        dispatch(getSpacesSuccess(response.data));
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(loadingSpaces(false));
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
    dispatch(loadingSpaces(true));
    return axios
      .post(API_SPACES, data)
      .then((response) => {
        dispatch(addSpaceSuccess(response.data));
        dispatch(addSuccessNotification('Space added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(loadingSpaces(false));
      });
  };
};

export const deleteSpace = (id) => {
  return (dispatch) => {
    dispatch(loadingSpaces(true));
    return axios
      .delete(API_SPACES)
      .then(() => {
        dispatch(deleteSpaceSuccess(id));
        dispatch(addSuccessNotification('Space deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(loadingSpaces(false));
      });
  };
};

export const updateSpace = (data) => {
  return (dispatch) => {
    dispatch(loadingSpaces(true));
    return axios
      .put(API_SPACES, data)
      .then((response) => {
        dispatch(updateSpaceSuccess(response.data));
        dispatch(addSuccessNotification('Space updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(loadingSpaces(false));
      });
  };
};

export const loadingSpaces = (payload) => ({
  type: LOADING_SPACES,
  payload,
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
