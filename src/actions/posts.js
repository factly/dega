import axios from 'axios';
import {
  ADD_POST,
  ADD_POSTS,
  ADD_POSTS_REQUEST,
  SET_POSTS_LOADING,
  RESET_POSTS,
  POSTS_API,
} from '../constants/posts';
import { addErrors } from './notifications';
import { addCategories } from './categories';
import { addTags } from './tags';
import { addFormats } from './formats';
import { addMediaList } from './media';

export const getPosts = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .get(POSTS_API, {
        params: query,
      })
      .then((response) => {
        let tags = [];
        let categories = [];
        let formats = [];
        let media = [];

        let posts = response.data.nodes.map((post) => {
          if (post.tags) tags.push(...post.tags);
          if (post.categories) categories.push(...post.categories);
          if (post.format) formats.push(post.format);
          if (post.medium) media.push(post.medium);
          return {
            ...post,
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
          };
        });

        dispatch(addTags(tags));
        dispatch(addCategories(categories));
        dispatch(addFormats(formats));
        dispatch(addMediaList(media));
        dispatch(addPostsList(posts));
        dispatch(
          addPostsRequest({
            data: posts.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopPostsLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrors(error.message));
      });
  };
};

export const getPost = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .get(POSTS_API + '/' + id)
      .then((response) => {
        let post = response.data;

        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMediaList([post.medium]));

        post.categories = post.categories.map((category) => category.id);
        post.tags = post.tags.map((tag) => tag.id);
        post.format = post.format.id;

        dispatch(getPostByID(post));
        dispatch(stopPostsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addPost = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .post(POSTS_API, data)
      .then((response) => {
        let post = response.data;
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMediaList([post.medium]));
        dispatch(resetPosts());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const updatePost = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .put(POSTS_API + '/' + data.id, data)
      .then((response) => {
        let post = response.data;
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addFormats([post.format]));
        post.categories = post.categories.map((category) => category.id);
        post.tags = post.tags.map((tag) => tag.id);
        post.format = post.format.id;
        if (post.medium) dispatch(addMediaList([post.medium]));
        dispatch(getPostByID(post));
        dispatch(stopPostsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const deletePost = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingPosts());
    return axios
      .delete(POSTS_API + '/' + id)
      .then(() => {
        dispatch(resetPosts());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

const loadingPosts = () => ({
  type: SET_POSTS_LOADING,
  payload: true,
});

const stopPostsLoading = () => ({
  type: SET_POSTS_LOADING,
  payload: false,
});

const getPostByID = (data) => ({
  type: ADD_POST,
  payload: {
    ...data,
  },
});

const addPostsList = (data) => ({
  type: ADD_POSTS,
  payload: { data },
});

const addPostsRequest = (data) => ({
  type: ADD_POSTS_REQUEST,
  payload: {
    ...data,
  },
});

const resetPosts = () => ({
  type: RESET_POSTS,
});
