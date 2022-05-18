import axios from 'axios';
import {
  ADD_TAGS,
  ADD_TAGS_REQUEST,
  SET_TAGS_LOADING,
  RESET_TAGS,
  TAGS_API,
  GET_TAG,
  UPDATE_TAG,
} from '../constants/tags';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

// action to fetch tags
export const getTags = (query) => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected
    if(currentSpaceID===0){
      return 
    }
    dispatch(loadingTags());
    return axios
      .get(TAGS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addTags(response.data.nodes));
        dispatch(
          addTagsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopTagsLoading()));
  };
};

// action to fetch tag by id
export const getTag = (id) => {
  return (dispatch) => {
    dispatch(loadingTags());
    return axios
      .get(TAGS_API + '/' + id)
      .then((response) => {
        dispatch(addTag(GET_TAG, response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopTagsLoading()));
  };
};

// action to create tag
export const createTag = (data) => {
  return (dispatch) => {
    dispatch(loadingTags());
    return axios
      .post(TAGS_API, data)
      .then(() => {
        dispatch(resetTags());
        dispatch(addSuccessNotification('Tag created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update tag by id
export const updateTag = (data) => {
  return (dispatch) => {
    dispatch(loadingTags());
    return axios
      .put(TAGS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(addTag(UPDATE_TAG, response.data));
        dispatch(addSuccessNotification('Tag updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopTagsLoading()));
  };
};

// action to delete tag by id
export const deleteTag = (id) => {
  return (dispatch) => {
    dispatch(loadingTags());
    return axios
      .delete(TAGS_API + '/' + id)
      .then(() => {
        dispatch(resetTags());
        dispatch(addSuccessNotification('Tag deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingTags = () => ({
  type: SET_TAGS_LOADING,
  payload: true,
});

export const stopTagsLoading = () => ({
  type: SET_TAGS_LOADING,
  payload: false,
});

export const addTag = (type, payload) => ({
  type,
  payload,
});

export const addTags = (data) => ({
  type: ADD_TAGS,
  payload: data,
});

export const addTagsRequest = (data) => ({
  type: ADD_TAGS_REQUEST,
  payload: data,
});

export const resetTags = () => ({
  type: RESET_TAGS,
});
