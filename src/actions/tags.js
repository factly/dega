import axios from '../utils/axios';
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
  LOADING_TAGS,
} from '../constants/tags';

export const getTags = (query) => {
  return async (dispatch, getState) => {
    let found = false;
    const {
      tags: { req },
    } = getState();

    // map data based on query
    req.forEach((each) => {
      const { limit, page } = each.query;
      if (page === query.page && limit === query.limit) {
        found = true;
        return;
      }
    });

    if (!found) {
      dispatch(loadingSpaces());
      const response = await axios({
        url: API_GET_TAGS,
        method: 'get',
        params: query,
      }).catch((error) => {
        dispatch(getTagsFailure(error.message));
      });
      if (response) {
        dispatch(getTagsSuccess(response.data, query));
      }
    }
  };
};

export const addTag = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_ADD_TAG,
      method: 'post',
      data: { ...data },
    }).catch((error) => {
      dispatch(addTagFailure(error.message));
    });
    if (response) {
      dispatch(addTagSuccess(data));
    }
  };
};

export const updateTag = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());

    const response = await axios({
      url: API_ADD_TAG + `/${data.id}`,
      method: 'put',
      data: { ...data },
    }).catch((error) => {
      dispatch(updateTagFailure(error.message));
    });
    if (response) {
      dispatch(updateTagSuccess(data));
    }
  };
};

export const deleteTag = (id) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());

    const response = await axios({
      url: API_ADD_TAG + `/${id}`,
      method: 'delete',
    }).catch((error) => {
      dispatch(deleteTagFailure(error.message));
    });
    if (response) {
      dispatch(deleteTagSuccess(id));
    }
  };
};

const loadingSpaces = () => ({
  type: LOADING_TAGS,
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
