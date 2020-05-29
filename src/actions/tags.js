import axios from '../utils/axios';
import {
  GET_TAGS_SUCCESS,
  GET_TAGS_FAILURE,
  ADD_TAG_FAILURE,
  ADD_TAG_SUCCESS,
  API_ADD_TAG,
  API_GET_TAGS,
} from '../constants/tags';

import { LOADING_PAGE } from '../constants';

export const getTags = () => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_GET_TAGS,
      method: 'get',
    }).catch((error) => {
      dispatch(getTagsFailure(error.message));
    });
    if (response) {
      console.log(response.data);
      dispatch(getTagsSuccess(response.data));
    }
  };
};

export const addTag = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const spaceId = getState().spaces.selectedSpace.id;
    const response = await axios({
      url: API_ADD_TAG,
      method: 'post',
      data: { ...data, space_id: spaceId },
    }).catch((error) => {
      dispatch(addTagFailure(error.message));
    });
    if (response) {
      console.log(response);
      dispatch(addTagSuccess(data));
    }
  };
};

const loadingSpaces = () => ({
  type: LOADING_PAGE,
});

const getTagsSuccess = (TAGS) => ({
  type: GET_TAGS_SUCCESS,
  payload: TAGS,
});

const getTagsFailure = (error) => ({
  type: GET_TAGS_FAILURE,
  payload: {
    error,
  },
});

const addTagSuccess = (TAG) => ({
  type: ADD_TAG_SUCCESS,
  payload: {
    ...TAG,
  },
});

const addTagFailure = (error) => ({
  type: ADD_TAG_FAILURE,
  payload: {
    error,
  },
});
