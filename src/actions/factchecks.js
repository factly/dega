import axios from 'axios';
import {
  FACTCHECKS_API,
  ADD_FACTCHECKS,
  ADD_FACTCHECKS_REQUEST,
  SET_FACTCHECKS_LOADING,
} from '../constants/factchecks';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const getFactChecks = (query) => {
  return (dispatch) => {
    dispatch(loadingFactchecks());
    return axios
      .get(FACTCHECKS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addFactchecksList(response.data.nodes));
        dispatch(
          addFactchecksRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopFactchecksLoading());
        dispatch(addSuccessNotification('Fact-Checks fetched successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addFactchecksList = (data) => ({
  type: ADD_FACTCHECKS,
  payload: data,
});

export const addFactchecksRequest = (data) => ({
  type: ADD_FACTCHECKS_REQUEST,
  payload: data,
});

export const loadingFactchecks = () => ({
  type: SET_FACTCHECKS_LOADING,
  payload: true,
});

export const stopFactchecksLoading = () => ({
  type: SET_FACTCHECKS_LOADING,
  payload: false,
});
