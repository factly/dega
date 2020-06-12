import axios from '../utils/axios';
import {
  API_ADD_MEDIA,
  LOADING_MEDIA,
  API_GET_MEDIA,
  GET_MEDIA_FAILURE,
  GET_MEDIA_SUCCESS,
} from '../constants/media';

export const addMedium = (data) => {
  return async (dispatch, getState) => {
    const response = await axios({
      url: API_ADD_MEDIA,
      method: 'post',
      data: data,
    }).catch((error) => {
      console.log(error.message);
    });
    if (response) {
      console.log(response);
    }
  };
};

export const getMedia = (query) => {
  return async (dispatch, getState) => {
    dispatch(loadingMedia());
    const response = await axios({
      url: API_GET_MEDIA,
      method: 'get',
    }).catch((error) => {
      dispatch(getMediaFailure(error.message));
    });
    if (response) {
      dispatch(getMediaSuccess(query, response.data));
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
