import axios from 'axios';
import {
  ADD_SEARCH_DETAIL,
  SET_SEARCH_DETAILS_LOADING,
  SEARCH_DETAILS_API,
} from '../constants/search';
import { addErrorNotification } from './notifications';
import getError from '../utils/getError';

export const getSearchDetails = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingSearchDetails());

    return axios
      .post(SEARCH_DETAILS_API, query)
      .then((response) => {
        const state = getState();
        dispatch(
          addSearchDetails({
            data: response.data,
            formats: state.formats.details,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const addSearchDetails = (data) => ({
  type: ADD_SEARCH_DETAIL,
  payload: data,
});

export const loadingSearchDetails = () => ({
  type: SET_SEARCH_DETAILS_LOADING,
  payload: true,
});

export const stopLoading = () => ({
  type: SET_SEARCH_DETAILS_LOADING,
  payload: false,
});
