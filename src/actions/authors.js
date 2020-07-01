import axios from 'axios';
import {
  SET_AUTHORS_LOADING,
  ADD_AUTHORS,
  AUTHORS_API,
  ADD_AUTHORS_REQUEST,
} from '../constants/authors';
import { addErrors } from './notifications';

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
        dispatch(stopAuthorsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

const loadingAuthors = () => ({
  type: SET_AUTHORS_LOADING,
  payload: true,
});

const stopAuthorsLoading = () => ({
  type: SET_AUTHORS_LOADING,
  payload: false,
});

const addAuthorsList = (data) => ({
  type: ADD_AUTHORS,
  payload: data,
});

const addAuthorsRequest = (data) => ({
  type: ADD_AUTHORS_REQUEST,
  payload: {
    ...data,
  },
});
