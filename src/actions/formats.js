import axios from 'axios';
import {
  GET_FORMATS_SUCCESS,
  GET_FORMATS_FAILURE,
  ADD_FORMAT_FAILURE,
  ADD_FORMAT_SUCCESS,
  API_ADD_FORMAT,
  API_GET_FORMATS,
  UPDATE_FORMAT_FAILURE,
  UPDATE_FORMAT_SUCCESS,
  DELETE_FORMAT_SUCCESS,
  DELETE_FORMAT_FAILURE,
  LOADING_FORMATS,
  GET_FORMAT_SUCCESS,
  GET_FORMAT_FAILURE,
} from '../constants/formats';

export const getFormats = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingFormats());
    return axios
      .get(API_GET_FORMATS, {
        params: query,
      })
      .then((response) => {
        dispatch(getFormatsSuccess(response.data, query));
      })
      .catch((error) => {
        dispatch(getFormatsFailure(error.message));
      });
  };
};

export const getFormat = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingFormats());
    return axios
      .get(API_GET_FORMATS + '/' + id)
      .then((response) => {
        dispatch(getFormatSuccess(response.data));
      })
      .catch((error) => {
        dispatch(getFormatFailure(error.message));
      });
  };
};

export const addFormat = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingFormats());
    return axios
      .post(API_ADD_FORMAT, data)
      .then((response) => {
        dispatch(addFormatSuccess(response.data));
      })
      .catch((error) => {
        dispatch(addFormatFailure(error.message));
      });
  };
};

export const updateFormat = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingFormats());
    return axios
      .put(API_ADD_FORMAT + '/' + data.id, data)
      .then((response) => {
        dispatch(updateFormatSuccess(response.data));
      })
      .catch((error) => {
        dispatch(updateFormatFailure(error.message));
      });
  };
};

export const deleteFormat = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingFormats());
    return axios
      .delete(API_ADD_FORMAT + '/' + id)
      .then(() => {
        dispatch(deleteFormatSuccess(id));
      })
      .catch((error) => {
        dispatch(deleteFormatFailure(error.message));
      });
  };
};

const loadingFormats = () => ({
  type: LOADING_FORMATS,
});

const getFormatsSuccess = (data, query) => ({
  type: GET_FORMATS_SUCCESS,
  payload: { data, query },
});

const getFormatsFailure = (error) => ({
  type: GET_FORMATS_FAILURE,
  payload: {
    error,
  },
});

const getFormatSuccess = (data) => ({
  type: GET_FORMAT_SUCCESS,
  payload: data,
});

const getFormatFailure = (error) => ({
  type: GET_FORMAT_FAILURE,
  payload: {
    error,
  },
});

const addFormatSuccess = (data) => ({
  type: ADD_FORMAT_SUCCESS,
  payload: {
    ...data,
  },
});

const addFormatFailure = (error) => ({
  type: ADD_FORMAT_FAILURE,
  payload: {
    error,
  },
});

const updateFormatSuccess = (data) => ({
  type: UPDATE_FORMAT_SUCCESS,
  payload: {
    ...data,
  },
});

const updateFormatFailure = (error) => ({
  type: UPDATE_FORMAT_FAILURE,
  payload: {
    error,
  },
});

const deleteFormatSuccess = (id) => ({
  type: DELETE_FORMAT_SUCCESS,
  payload: id,
});

const deleteFormatFailure = (error) => ({
  type: DELETE_FORMAT_FAILURE,
  payload: {
    error,
  },
});
