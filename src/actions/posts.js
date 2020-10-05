import axios from 'axios';
import {
  ADD_POST,
  ADD_POSTS,
  ADD_POSTS_REQUEST,
  SET_POSTS_LOADING,
  RESET_POSTS,
  POSTS_API,
} from '../constants/posts';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addCategories } from './categories';
import { addTags } from './tags';
import { addFormats } from './formats';
import { addMediaList } from './media';
import { addAuthors } from './authors';
import { addClaims } from './claims';

export const getPosts = (query) => {
  return (dispatch) => {
    dispatch(loadingPosts());

    const params = new URLSearchParams();
    if (query.category && query.category.length > 0) {
      query.category.map((each) => params.append('category', each));
    }
    if (query.tag && query.tag.length > 0) {
      query.tag.map((each) => params.append('tag', each));
    }
    if (query.format && query.format.length > 0) {
      query.format.map((each) => params.append('format', each));
    }
    if (query.page) {
      params.append('page', query.page);
    }
    if (query.limit) {
      params.append('limit', query.limit);
    }
    if (query.sort) {
      params.append('sort', query.sort);
    }
    if (query.q) {
      params.append('q', query.q);
    }
    if (query.status) {
      params.append('status', query.status);
    }
    return axios
      .get(POSTS_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addAuthors(
            response.data.nodes
              .filter((post) => post.authors.length > 0)
              .map((post) => {
                return post.authors;
              })
              .flat(1),
          ),
        );
        dispatch(
          addTags(
            response.data.nodes
              .filter((post) => post.tags.length > 0)
              .map((post) => {
                return post.tags;
              })
              .flat(1),
          ),
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter((post) => post.categories.length > 0)
              .map((post) => {
                return post.categories;
              })
              .flat(1),
          ),
        );
        dispatch(
          addFormats(
            response.data.nodes
              .filter((post) => post.format)
              .map((post) => {
                return post.format;
              })
              .flat(1),
          ),
        );
        dispatch(
          addClaims(
            response.data.nodes
              .filter((post) => post.claims.length > 0)
              .map((post) => {
                return post.claims;
              })
              .flat(1),
          ),
        );
        dispatch(
          addMediaList(
            response.data.nodes
              .filter((post) => post.medium)
              .map((post) => {
                return post.medium;
              }),
          ),
        );
        dispatch(
          addPostsList(
            response.data.nodes.map((post) => {
              return {
                ...post,
                categories: post.categories.map((category) => category.id),
                tags: post.tags.map((tag) => tag.id),
                authors: post.authors.map((author) => author.id),
                format: post.format.id,
                claims: post.claims.map((claim) => claim.id),
                medium: post.medium?.id,
              };
            }),
          ),
        );
        dispatch(
          addPostsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopPostsLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getPost = (id) => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .get(POSTS_API + '/' + id)
      .then((response) => {
        let post = response.data;

        dispatch(addTags(post.tags));
        dispatch(addAuthors(post.authors));
        dispatch(addCategories(post.categories));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMediaList([post.medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            claims: post.claims.map((claim) => claim.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            medium: post.medium?.id,
          }),
        );
        dispatch(stopPostsLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addPost = (data) => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .post(POSTS_API, data)
      .then((response) => {
        let post = response.data;
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMediaList([post.medium]));

        dispatch(resetPosts());
        dispatch(addSuccessNotification('Post added'));
        return post;
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const publish = (data) => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .post(POSTS_API + '/publish', data)
      .then((response) => {
        let post = response.data;
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMediaList([post.medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            claims: post.claims.map((claim) => claim.id),
            medium: post.medium?.id,
          }),
        );
        dispatch(stopPostsLoading());
        dispatch(addSuccessNotification('Post published'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addTemplate = (data) => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .post(POSTS_API + '/templates', data)
      .then((response) => {
        let post = response.data;
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMediaList([post.medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            claims: post.claims.map((claim) => claim.id),
            medium: post.medium?.id,
          }),
        );
        dispatch(stopPostsLoading());
        dispatch(addSuccessNotification('Template created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const publishPost = (data) => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .put(POSTS_API + '/' + data.id + '/publish', data)
      .then((response) => {
        let post = response.data;
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMediaList([post.medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            claims: post.claims.map((claim) => claim.id),
            medium: post.medium?.id,
          }),
        );
        dispatch(stopPostsLoading());
        dispatch(addSuccessNotification('Post published'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updatePost = (data) => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .put(POSTS_API + '/' + data.id, data)
      .then((response) => {
        let post = response.data;
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMediaList([post.medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            claims: post.claims.map((claim) => claim.id),
            medium: post.medium?.id,
          }),
        );
        dispatch(stopPostsLoading());
        dispatch(addSuccessNotification('Post updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deletePost = (id) => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .delete(POSTS_API + '/' + id)
      .then(() => {
        dispatch(resetPosts());
        dispatch(addSuccessNotification('Post deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const loadingPosts = () => ({
  type: SET_POSTS_LOADING,
  payload: true,
});

export const stopPostsLoading = () => ({
  type: SET_POSTS_LOADING,
  payload: false,
});

export const getPostByID = (data) => ({
  type: ADD_POST,
  payload: data,
});

export const addPostsList = (data) => ({
  type: ADD_POSTS,
  payload: data,
});

export const addPostsRequest = (data) => ({
  type: ADD_POSTS_REQUEST,
  payload: data,
});

export const resetPosts = () => ({
  type: RESET_POSTS,
});
