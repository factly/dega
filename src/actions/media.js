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
  return async (dispatch, getState) => {
    const response = await axios.post(API_ADD_MEDIA, data).catch((error) => {
      dispatch(addMediumFailure(error.message));
    });
    if (response) {
      dispatch(addMediumSuccess(response.data));
    }
  };
};

export const getMedia = (query) => {
  return async (dispatch, getState) => {
    dispatch(loadingMedia());
    const response = await axios
      .get(API_GET_MEDIA, {
        params: query,
      })
      .catch((error) => {
        dispatch(getMediaFailure(error.message));
      });
    if (response) {
      dispatch(getMediaSuccess(query, response.data));
    }
  };
};

export const getMedium = (id) => {
  return async (dispatch, getState) => {
    dispatch(loadingMedia());
    const response = await axios.get(API_GET_MEDIA + '/' + id).catch((error) => {
      dispatch(getMediumFailure(error.message));
    });
    if (response) {
      dispatch(getMediumSuccess(response.data));
    }
  };
};

export const updateMedium = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingMedia());
    const response = await axios.put(API_GET_MEDIA + '/' + data.id, data).catch((error) => {
      dispatch(updateMediumFailure(error.message));
    });
    if (response) {
      dispatch(updateMediumSuccess(response.data));
    }
  };
};

export const deleteMedium = (id) => {
  return async (dispatch, getState) => {
    dispatch(loadingMedia());
    const response = await axios.delete(API_GET_MEDIA + '/' + id).catch((error) => {
      dispatch(deleteMediumFailure(error.message));
    });
    if (response) {
      dispatch(deleteMediumSuccess(id));
    }
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
