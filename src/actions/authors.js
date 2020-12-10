import axios from 'axios';
import {
  SET_AUTHORS_LOADING,
  ADD_AUTHORS,
  AUTHORS_API,
  ADD_AUTHORS_REQUEST,
} from '../constants/authors';
import { addErrorNotification } from './notifications';

export const getAuthors = (query) => {
  return (dispatch) => {
    dispatch(loadingAuthors());
    return axios
      .get(AUTHORS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addAuthorsList(response.data.nodes));
        dispatch(
          addAuthorsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      })
      .finally(() => dispatch(stopAuthorsLoading()));
  };
};

export const addAuthors = (authors) => {
  return (dispatch) => {
    dispatch(addAuthorsList(authors));
  };
};

export const loadingAuthors = () => ({
  type: SET_AUTHORS_LOADING,
  payload: true,
});

export const stopAuthorsLoading = () => ({
  type: SET_AUTHORS_LOADING,
  payload: false,
});

export const addAuthorsList = (data) => ({
  type: ADD_AUTHORS,
  payload: data,
});

export const addAuthorsRequest = (data) => ({
  type: ADD_AUTHORS_REQUEST,
  payload: data,
});
