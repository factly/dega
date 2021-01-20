import axios from 'axios';
import {
  GOOGLE_FACT_CHECKS_API,
  ADD_GOOGLE_FACT_CHECKS_REQUEST,
  SET_GOOGLE_FACT_CHECKS_LOADING,
} from '../constants/googleFactChecks';
import { addErrorNotification } from './notifications';
import getError from '../utils/getError';

export const getGoogleFactChecks = (query) => {
  return (dispatch) => {
    dispatch(loadingGoogleFactChecks());
    return axios
      .get(GOOGLE_FACT_CHECKS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addRequest({
            data: response.data.nodes,
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const addRequest = (data) => ({
  type: ADD_GOOGLE_FACT_CHECKS_REQUEST,
  payload: data,
});

export const loadingGoogleFactChecks = () => ({
  type: SET_GOOGLE_FACT_CHECKS_LOADING,
  payload: true,
});

export const stopLoading = () => ({
  type: SET_GOOGLE_FACT_CHECKS_LOADING,
  payload: false,
});
