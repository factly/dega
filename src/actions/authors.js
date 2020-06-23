import axios from 'axios';
import {
  GET_AUTHORS_SUCCESS,
  GET_AUTHORS_FAILURE,
  API_GET_AUTHORS,
  LOADING_AUTHORS,
} from '../constants/authors';

export const getAuthors = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingAuthors());
    return axios
      .get(API_GET_AUTHORS, {
        params: query,
      })
      .then((response) => {
        dispatch(getAuthorsSuccess(response.data, query));
      })
      .catch((error) => {
        dispatch(getAuthorsFailure(error.message));
      });
  };
};

const loadingAuthors = () => ({
  type: LOADING_AUTHORS,
});

const getAuthorsSuccess = (data, query) => ({
  type: GET_AUTHORS_SUCCESS,
  payload: { data, query },
});

const getAuthorsFailure = (error) => ({
  type: GET_AUTHORS_FAILURE,
  payload: {
    error,
  },
});
