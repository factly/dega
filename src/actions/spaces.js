import axios from '../utils/axios';
import {
  GET_SPACES_SUCCESS,
  GET_SPACES_FAILURE,
  ADD_SPACE_FAILURE,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
  API_ADD_SPACE,
  API_GET_SPACES,
  API_DELETE_SPACE,
  SET_SELECTED_SPACE,
  DELETE_SPACE_SUCCESS,
  DELETE_SPACE_FAILURE,
} from '../constants/spaces';

export const getSpaces = () => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_GET_SPACES,
      method: 'get',
    }).catch((error) => {
      dispatch(getSpacesFailure(error.message));
    });
    if (response) {
      dispatch(getSpacesSuccess(response.data));
    }
  };
};

export const setSelectedSpace = (space) => ({
  type: SET_SELECTED_SPACE,
  payload: space,
});

export const addSpace = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_ADD_SPACE,
      method: 'post',
      data: data,
    }).catch((error) => {
      dispatch(addSpaceFailure(error.message));
    });
    if (response) {
      dispatch(addSpaceSuccess(response.data));
    }
  };
};

export const deleteSpace = (id) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_DELETE_SPACE + '/' + id,
      method: 'delete',
    }).catch((error) => {
      dispatch(deleteSpaceFailure(error.message));
    });
    if (response) {
      dispatch(deleteSpaceSuccess(id));
    }
  };
};

const loadingSpaces = () => ({
  type: LOADING_SPACES,
});

const getSpacesSuccess = (spaces) => ({
  type: GET_SPACES_SUCCESS,
  payload: spaces,
});

const getSpacesFailure = (error) => ({
  type: GET_SPACES_FAILURE,
  payload: {
    error,
  },
});

const addSpaceSuccess = (space) => ({
  type: ADD_SPACE_SUCCESS,
  payload: space,
});

const addSpaceFailure = (error) => ({
  type: ADD_SPACE_FAILURE,
  payload: {
    error,
  },
});

const deleteSpaceSuccess = (id) => ({
  type: DELETE_SPACE_SUCCESS,
  payload: id,
});

const deleteSpaceFailure = (error) => ({
  type: DELETE_SPACE_FAILURE,
  payload: {
    error,
  },
});
