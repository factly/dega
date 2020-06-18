import axios from 'axios';
import {
  GET_TAGS_SUCCESS,
  GET_TAGS_FAILURE,
  ADD_TAG_FAILURE,
  ADD_TAG_SUCCESS,
  API_ADD_TAG,
  API_GET_TAGS,
  UPDATE_TAG_FAILURE,
  UPDATE_TAG_SUCCESS,
  DELETE_TAG_SUCCESS,
  DELETE_TAG_FAILURE,
} from '../constants/tags';
import { LOADING_SPACES } from '../constants/spaces';

export const getTags = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingTags());
    return axios
      .get(API_GET_TAGS, {
        params: query,
      })
      .then((response) => {
        dispatch(getTagsSuccess(response.data, query));
      })
      .catch((error) => {
        dispatch(getTagsFailure(error.message));
      });
  };
};

export const addTag = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingTags());
    return axios
      .post(API_ADD_TAG, data)
      .then((response) => {
        dispatch(addTagSuccess(response.data));
      })
      .catch((error) => {
        dispatch(addTagFailure(error.message));
      });
  };
};

export const updateTag = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingTags());
    return axios
      .put(API_ADD_TAG + '/' + data.id, data)
      .then((response) => {
        dispatch(updateTagSuccess(response.data));
      })
      .catch((error) => {
        dispatch(updateTagFailure(error.message));
      });
  };
};

export const deleteTag = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingTags());
    return axios
      .delete(API_ADD_TAG + '/' + id)
      .then(() => {
        dispatch(deleteTagSuccess(id));
      })
      .catch((error) => {
        dispatch(deleteTagFailure(error.message));
      });
  };
};

const loadingTags = () => ({
  type: LOADING_SPACES,
});

const getTagsSuccess = (data, query) => ({
  type: GET_TAGS_SUCCESS,
  payload: { data, query },
});

const getTagsFailure = (error) => ({
  type: GET_TAGS_FAILURE,
  payload: {
    error,
  },
});

const addTagSuccess = (data) => ({
  type: ADD_TAG_SUCCESS,
  payload: {
    ...data,
  },
});

const addTagFailure = (error) => ({
  type: ADD_TAG_FAILURE,
  payload: {
    error,
  },
});

const updateTagSuccess = (data) => ({
  type: UPDATE_TAG_SUCCESS,
  payload: {
    ...data,
  },
});

const updateTagFailure = (error) => ({
  type: UPDATE_TAG_FAILURE,
  payload: {
    error,
  },
});

const deleteTagSuccess = (id) => ({
  type: DELETE_TAG_SUCCESS,
  payload: id,
});

const deleteTagFailure = (error) => ({
  type: DELETE_TAG_FAILURE,
  payload: {
    error,
  },
});
