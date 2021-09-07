import axios from 'axios';
import {
  ADD_FORMATS,
  ADD_FORMATS_REQUEST,
  SET_FORMATS_LOADING,
  RESET_FORMATS,
  FORMATS_API,
  GET_FORMAT,
  UPDATE_FORMAT,
} from '../constants/formats';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';
import { SET_REDIRECT } from '../constants/settings';

// action to fetch default formats
export const addDefaultFormats = (query) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .post(FORMATS_API + '/default')
      .then((response) => {
        dispatch(addFormats(response.data.nodes));
        dispatch(
          addFormatsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopFormatsLoading()));
  };
};

// action to fetch all formats
export const getFormats = (query) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .get(FORMATS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addFormats(response.data.nodes));
        dispatch(
          addFormatsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        if (error && error.response && error.response.status === 307) dispatch(setRedirect(307));
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopFormatsLoading()));
  };
};

// action to fetch format by id
export const getFormat = (id) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .get(FORMATS_API + '/' + id)
      .then((response) => {
        dispatch(addFormat(GET_FORMAT, response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopFormatsLoading()));
  };
};

// action to create format
export const createFormat = (data) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .post(FORMATS_API, data)
      .then(() => {
        dispatch(resetFormats());
        dispatch(addSuccessNotification('Format created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update format by id
export const updateFormat = (data) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .put(FORMATS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(addFormat(UPDATE_FORMAT, response.data));
        dispatch(addSuccessNotification('Format updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopFormatsLoading()));
  };
};

// action to delete format by id
export const deleteFormat = (id) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .delete(FORMATS_API + '/' + id)
      .then(() => {
        dispatch(resetFormats());
        dispatch(addSuccessNotification('Format deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const setRedirect = (code) => ({
  type: SET_REDIRECT,
  payload: code,
});

export const loadingFormats = () => ({
  type: SET_FORMATS_LOADING,
  payload: true,
});

export const stopFormatsLoading = () => ({
  type: SET_FORMATS_LOADING,
  payload: false,
});

export const addFormat = (type, payload) => ({
  type,
  payload,
});

export const addFormats = (payload) => ({
  type: ADD_FORMATS,
  payload,
});

export const addFormatsRequest = (payload) => ({
  type: ADD_FORMATS_REQUEST,
  payload,
});

export const resetFormats = () => ({
  type: RESET_FORMATS,
});
