import axios from '../utils/axios';
import {
  GET_SPACES_SUCCESS,
  GET_SPACES_FAILURE,
  ADD_SPACE_FAILURE,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
  API_ADD_SPACES,
  API_GET_SPACES,
  SET_SELECTED_SPACE,
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

export const addSpaces = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_ADD_SPACES,
      method: 'post',
      data: { ...data },
    }).catch((error) => {
      dispatch(addSpacesFailure(error.message));
    });
    if (response) {
      dispatch(addSpacesSuccess(data));
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

const addSpacesSuccess = (space) => ({
  type: ADD_SPACE_SUCCESS,
  payload: {
    ...space,
  },
});

const addSpacesFailure = (error) => ({
  type: ADD_SPACE_FAILURE,
  payload: {
    error,
  },
});
