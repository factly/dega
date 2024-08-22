import axios from 'axios';
import {
  ADD_MEDIA,
  ADD_MEDIA_REQUEST,
  SET_MEDIA_LOADING,
  RESET_MEDIA,
  MEDIA_API,
  GET_MEDIUM,
  UPDATE_MEDIUM,
} from '../constants/media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

// action to fetch media
export const getMedia = (query, profile) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .get(MEDIA_API, {
        params: query,
      })
      .then((response) => {
        if (response.data === "") return [];
        dispatch(addMedia(response?.data?.nodes));
        dispatch(
          addMediaRequest({
            data: response?.data?.nodes.map((item) => item.id),
            query: query,
            total: response?.data?.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

// action to fetch medium by id
export const getMedium = (id, profile) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .get(MEDIA_API + '/' + id)
      .then((response) => {
        dispatch({ type: GET_MEDIUM, payload: response.data });
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

// action to create medium
export const createMedium = (data, profile) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .post(MEDIA_API, profile ? data[0] : data)
      .then((response) => {
        dispatch(addSuccessNotification('Medium created'));
        return profile ? response.data : response.data.nodes[0];
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update medium
export const updateMedium = (data) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .put(MEDIA_API + '/' + data.id, data)
      .then((response) => {
        dispatch({ type: UPDATE_MEDIUM, payload: response.data });
        dispatch(addSuccessNotification('Medium updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

// action to delete medium by id
export const deleteMedium = (id) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .delete(MEDIA_API + '/' + id)
      .then(() => {
        dispatch(resetMedia());
        dispatch(addSuccessNotification('Medium deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingMedia = () => ({
  type: SET_MEDIA_LOADING,
  payload: true,
});

export const stopMediaLoading = () => ({
  type: SET_MEDIA_LOADING,
  payload: false,
});

export const addMedia = (data) => ({
  type: ADD_MEDIA,
  payload: data,
});

export const addMediaRequest = (data) => ({
  type: ADD_MEDIA_REQUEST,
  payload: data,
});

export const resetMedia = () => ({
  type: RESET_MEDIA,
});
