import axios from 'axios';
import {
  FACTCHECKS_API,
  ADD_GOOGLE_FACT_CHECKS_REQUEST,
  SET_GOOGLE_FACT_CHECKS_LOADING,
} from '../constants/googleFactChecks';
import { addErrorNotification } from './notifications';

export const getGoogleFactChecks = (query) => {
  return (dispatch) => {
    dispatch(loadingFactchecks());
    return axios
      .get(FACTCHECKS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addFactchecksRequest({
            data: response.data.nodes,
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopFactchecksLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addFactchecksRequest = (data) => ({
  type: ADD_GOOGLE_FACT_CHECKS_REQUEST,
  payload: data,
});

export const loadingFactchecks = () => ({
  type: SET_GOOGLE_FACT_CHECKS_LOADING,
  payload: true,
});

export const stopFactchecksLoading = () => ({
  type: SET_GOOGLE_FACT_CHECKS_LOADING,
  payload: false,
});
