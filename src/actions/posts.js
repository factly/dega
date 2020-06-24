import axios from 'axios';
import {
  GET_POSTS_SUCCESS,
  GET_POSTS_FAILURE,
  GET_POST_SUCCESS,
  GET_POST_FAILURE,
  ADD_POST_FAILURE,
  ADD_POST_SUCCESS,
  API_ADD_POST,
  API_GET_POSTS,
  UPDATE_POST_FAILURE,
  UPDATE_POST_SUCCESS,
  DELETE_POST_SUCCESS,
  DELETE_POST_FAILURE,
} from '../constants/posts';
import { LOADING_SPACES } from '../constants/spaces';
import { ADD_TAGS } from '../constants/tags';
import { ADD_CATEGORIES } from '../constants/categories';
import { ADD_FORMATS } from '../constants/formats';

export const getPosts = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .get(API_GET_POSTS, {
        params: query,
      })
      .then((response) => {
        let posts = response.data.nodes
          ? response.data.nodes.map((post) => {
              if (post.tags) dispatch(addTags(post.tags));
              if (post.categories) dispatch(addCategories(post.categories));
              if (post.format) {
                dispatch(addFormat(post.format));
              }

              return {
                ...post,
                categories: post.categories.map((category) => category.id),
                tags: post.tags.map((tag) => tag.id),
                format: post.format.id,
              };
            })
          : [];

        dispatch(getPostsSuccess({ ...response.data, nodes: posts }, query));
      })
      .catch((error) => {
        dispatch(getPostsFailure(error.message));
      });
  };
};
export const getPost = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .get(API_GET_POSTS + '/' + id)
      .then((response) => {
        let post = response.data;
        if (post.tags) dispatch(addTags(post.tags));
        if (post.categories) dispatch(addCategories(post.categories));
        if (post.format) {
          dispatch(addFormat(post.format));
        }
        post.categories = post.categories.map((category) => category.id);
        post.tags = post.tags.map((tag) => tag.id);
        post.format = post.format.id;
        dispatch(getPostSuccess(post));
      })
      .catch((error) => {
        dispatch(getPostFailure(error.message));
      });
  };
};

export const addPost = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .post(API_ADD_POST, data)
      .then((response) => {
        let post = response.data;
        if (post.tags) dispatch(addTags(post.tags));
        if (post.categories) dispatch(addCategories(post.categories));
        if (post.format) {
          dispatch(addFormat(post.format));
        }
        post.categories = post.categories.map((category) => category.id);
        post.tags = post.tags.map((tag) => tag.id);
        post.format = post.format.id;
        dispatch(addPostSuccess(response.data));
      })
      .catch((error) => {
        dispatch(addPostFailure(error.message));
      });
  };
};

export const updatePost = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .put(API_ADD_POST + '/' + data.id, data)
      .then((response) => {
        dispatch(updatePostSuccess(response.data));
      })
      .catch((error) => {
        dispatch(updatePostFailure(error.message));
      });
  };
};

export const deletePost = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .delete(API_ADD_POST + '/' + id)
      .then(() => {
        dispatch(deletePostSuccess(id));
      })
      .catch((error) => {
        dispatch(deletePostFailure(error.message));
      });
  };
};

const loadingPosts = () => ({
  type: LOADING_SPACES,
});

const getPostsSuccess = (data, query) => ({
  type: GET_POSTS_SUCCESS,
  payload: { data, query },
});

const getPostsFailure = (error) => ({
  type: GET_POSTS_FAILURE,
  payload: {
    error,
  },
});

const getPostSuccess = (data) => ({
  type: GET_POST_SUCCESS,
  payload: { ...data },
});

const getPostFailure = (error) => ({
  type: GET_POST_FAILURE,
  payload: {
    error,
  },
});

const addPostSuccess = (data) => ({
  type: ADD_POST_SUCCESS,
  payload: {
    ...data,
  },
});

const addPostFailure = (error) => ({
  type: ADD_POST_FAILURE,
  payload: {
    error,
  },
});

const updatePostSuccess = (data) => ({
  type: UPDATE_POST_SUCCESS,
  payload: {
    ...data,
  },
});

const updatePostFailure = (error) => ({
  type: UPDATE_POST_FAILURE,
  payload: {
    error,
  },
});

const deletePostSuccess = (id) => ({
  type: DELETE_POST_SUCCESS,
  payload: id,
});

const deletePostFailure = (error) => ({
  type: DELETE_POST_FAILURE,
  payload: {
    error,
  },
});

const addTags = (data) => ({
  type: ADD_TAGS,
  payload: { data },
});

const addCategories = (data) => ({
  type: ADD_CATEGORIES,
  payload: { data },
});

const addFormat = (data) => ({
  type: ADD_FORMATS,
  payload: { data },
});
