import axios from 'axios';
import {
  API_ADD_MEDIA,
  LOADING_MEDIA,
  API_GET_MEDIA,
  GET_MEDIA_FAILURE,
  GET_MEDIA_SUCCESS,
  GET_MEDIUM_FAILURE,
  GET_MEDIUM_SUCCESS,
  UPDATE_MEDIUM_FAILURE,
  UPDATE_MEDIUM_SUCCESS,
  DELETE_MEDIUM_FAILURE,
  DELETE_MEDIUM_SUCCESS,
  ADD_MEDIUM_SUCCESS,
  ADD_MEDIUM_FAILURE,
} from '../constants/media';

export const addMedium = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingMedia());
    return axios
      .post(API_ADD_MEDIA, data)
      .then((response) => {
        dispatch(addMediumSuccess(response.data));
      })
      .catch((error) => {
        dispatch(addMediumFailure(error.message));
      });
  };
};

export const getMedia = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingMedia());
    return axios
      .get(API_GET_MEDIA, {
        params: query,
      })
      .then((response) => {
        dispatch(getMediaSuccess(query, response.data));
      })
      .catch((error) => {
        dispatch(getMediaFailure(error.message));
      });
  };
};

export const getMedium = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingMedia());
    return axios
      .get(API_GET_MEDIA + '/' + id)
      .then((response) => {
        dispatch(getMediumSuccess(response.data));
      })
      .catch((error) => {
        dispatch(getMediumFailure(error.message));
      });
  };
};

export const updateMedium = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingMedia());
    return axios
      .put(API_GET_MEDIA + '/' + data.id, data)
      .then((response) => {
        dispatch(updateMediumSuccess(response.data));
      })
      .catch((error) => {
        dispatch(updateMediumFailure(error.message));
      });
  };
};

export const deleteMedium = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingMedia());
    return axios
      .delete(API_GET_MEDIA + '/' + id)
      .then(() => {
        dispatch(deleteMediumSuccess(id));
      })
      .catch((error) => {
        dispatch(deleteMediumFailure(error.message));
      });
  };
};

const loadingMedia = () => ({
  type: LOADING_MEDIA,
});

const getMediaSuccess = (query, data) => ({
  type: GET_MEDIA_SUCCESS,
  payload: { query, data },
});

const getMediaFailure = (error) => ({
  type: GET_MEDIA_FAILURE,
  payload: {
    error,
  },
});

const getMediumSuccess = (data) => ({
  type: GET_MEDIUM_SUCCESS,
  payload: data,
});

const getMediumFailure = (error) => ({
  type: GET_MEDIUM_FAILURE,
  payload: {
    error,
  },
});

const updateMediumFailure = (error) => ({
  type: UPDATE_MEDIUM_FAILURE,
  payload: {
    error,
  },
});

const updateMediumSuccess = (data) => ({
  type: UPDATE_MEDIUM_SUCCESS,
  payload: data,
});

const deleteMediumFailure = (error) => ({
  type: DELETE_MEDIUM_FAILURE,
  payload: {
    error,
  },
});

const deleteMediumSuccess = (data) => ({
  type: DELETE_MEDIUM_SUCCESS,
  payload: data,
});

const addMediumFailure = (error) => ({
  type: ADD_MEDIUM_FAILURE,
  payload: {
    error,
  },
});

const addMediumSuccess = (data) => ({
  type: ADD_MEDIUM_SUCCESS,
  payload: data,
});
