import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/posts';
import * as types from '../../constants/posts';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_MEDIA } from '../../constants/media';
import { ADD_FORMATS } from '../../constants/formats';
import { ADD_AUTHORS } from '../../constants/authors';
import { ADD_TAGS } from '../../constants/tags';
import { ADD_CATEGORIES } from '../../constants/categories';
import { ADD_RATINGS } from '../../constants/ratings';
import { ADD_CLAIMANTS } from '../../constants/claimants';
import { ADD_CLAIMS } from '../../constants/claims';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

const post_without_id = {
  name: 'Post 1',
  authors: [{ id: 11, name: 'Author 1' }],
  tags: [
    { id: 21, name: 'Tag 21' },
    { id: 22, name: 'Tag 22' },
  ],
  categories: [
    { id: 31, name: 'category 31', medium: { id: 311, name: 'Category-Medium-311' } },
    { id: 32, name: 'category 32' },
  ],
  format: { id: 41, name: 'Format 1' },
  medium: { id: 51, name: 'Medium 1' },
  claims: [
    {
      id: 61,
      name: 'Claim 1',
      claimant: { id: 601, name: 'Claimant 1', medium: { id: 621, name: 'Medium-Claimant 1' } },
      rating: { id: 602, name: 'Rating 1', medium: { id: 622, name: 'Medium-Rating 1' } },
    },
  ],
};

const post = {
  id: 1,
  ...post_without_id,
};

const post2 = {
  id: 2,
  name: 'Post 2',
  authors: [{ id: 12, name: 'Author 2' }],
  tags: [
    { id: 21, name: 'Tag 21' },
    { id: 23, name: 'Tag 23' },
    { id: 24, name: 'Tag 24' },
  ],
  categories: [
    { id: 33, name: 'category 33' },
    { id: 34, name: 'category 34' },
  ],
  format: { id: 42, name: 'Format 2' },
  medium: { id: 52, name: 'Medium 2' },
};

describe('posts actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_POSTS_LOADING,
      payload: true,
    };
    expect(actions.loadingPosts()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_POSTS_LOADING,
      payload: false,
    };
    expect(actions.stopPostsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add posts list', () => {
    const data = [post, post2];

    const addPostsAction = {
      type: types.ADD_POSTS,
      payload: data,
    };
    expect(actions.addPostsList(data)).toEqual(addPostsAction);
  });
  it('should create an action to add posts request', () => {
    const data = [{ query: 'query' }];
    const addPostsRequestAction = {
      type: types.ADD_POSTS_REQUEST,
      payload: data,
    };
    expect(actions.addPostsRequest(data)).toEqual(addPostsRequestAction);
  });
  it('should create an action to add post', () => {
    const data = post;
    const addPostsRequestAction = {
      type: types.ADD_POST,
      payload: data,
    };
    expect(actions.getPostByID(data)).toEqual(addPostsRequestAction);
  });
  it('should create an action to reset posts', () => {
    const resetPostsRequestAction = {
      type: types.RESET_POSTS,
    };
    expect(actions.resetPosts()).toEqual(resetPostsRequestAction);
  });
  it('should create actions to fetch posts success', () => {
    const query = { page: 1, limit: 5 };
    const posts = [post];
    const resp = { data: { nodes: posts, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_AUTHORS,
        payload: [{ id: 11, name: 'Author 1' }],
      },
      {
        type: ADD_TAGS,
        payload: [
          { id: 21, name: 'Tag 21' },
          { id: 22, name: 'Tag 22' },
        ],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 311, name: 'Category-Medium-311' }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [
          { id: 31, name: 'category 31', medium: 311 },
          { id: 32, name: 'category 32', medium: undefined },
        ],
      },
      {
        type: ADD_FORMATS,
        payload: [{ id: 41, name: 'Format 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 621, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 601, name: 'Claimant 1', medium: 621 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 622, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 602, name: 'Rating 1', medium: 622 }],
      },
      {
        type: ADD_CLAIMS,
        payload: [{ id: 61, name: 'Claim 1', claimant: 601, rating: 602 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.ADD_POSTS,
        payload: [
          {
            id: 1,
            name: 'Post 1',
            authors: [11],
            tags: [21, 22],
            categories: [31, 32],
            format: 41,
            medium: 51,
            claims: [61],
          },
        ],
      },
      {
        type: types.ADD_POSTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPosts(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch posts failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPosts(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API, {
      params: query,
    });
  });
  it('should create actions to get post by id without medium success', () => {
    const id = 1;
    const resp = { data: { ...post, medium: undefined } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [
          { id: 21, name: 'Tag 21' },
          { id: 22, name: 'Tag 22' },
        ],
      },
      {
        type: ADD_AUTHORS,
        payload: [{ id: 11, name: 'Author 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 311, name: 'Category-Medium-311' }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [
          { id: 31, name: 'category 31', medium: 311 },
          { id: 32, name: 'category 32', medium: undefined },
        ],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 621, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 601, name: 'Claimant 1', medium: 621 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 622, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 602, name: 'Rating 1', medium: 622 }],
      },
      {
        type: ADD_CLAIMS,
        payload: [{ id: 61, name: 'Claim 1', claimant: 601, rating: 602 }],
      },
      {
        type: ADD_FORMATS,
        payload: [{ id: 41, name: 'Format 1' }],
      },
      {
        type: types.ADD_POST,
        payload: {
          id: 1,
          name: 'Post 1',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: 41,
          medium: undefined,
          claims: [61],
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPost(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API + '/' + id);
  });
  it('should create actions to get post by id success', () => {
    const id = 1;
    const resp = { data: post };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [
          { id: 21, name: 'Tag 21' },
          { id: 22, name: 'Tag 22' },
        ],
      },
      {
        type: ADD_AUTHORS,
        payload: [{ id: 11, name: 'Author 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 311, name: 'Category-Medium-311' }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [
          { id: 31, name: 'category 31', medium: 311 },
          { id: 32, name: 'category 32', medium: undefined },
        ],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 621, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 601, name: 'Claimant 1', medium: 621 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 622, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 602, name: 'Rating 1', medium: 622 }],
      },
      {
        type: ADD_CLAIMS,
        payload: [{ id: 61, name: 'Claim 1', claimant: 601, rating: 602 }],
      },
      {
        type: ADD_FORMATS,
        payload: [{ id: 41, name: 'Format 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.ADD_POST,
        payload: {
          id: 1,
          name: 'Post 1',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: 41,
          medium: 51,
          claims: [61],
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPost(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API + '/' + id);
  });
  it('should create actions to get post by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPost(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API + '/' + id);
  });
  it('should create actions to create post without medium success', () => {
    const resp = { data: { ...post, medium: undefined } };
    const reqData = { ...post_without_id, medium: undefined };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [
          { id: 21, name: 'Tag 21' },
          { id: 22, name: 'Tag 22' },
        ],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 311, name: 'Category-Medium-311' }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [
          { id: 31, name: 'category 31', medium: 311 },
          { id: 32, name: 'category 32', medium: undefined },
        ],
      },
      {
        type: ADD_AUTHORS,
        payload: [{ id: 11, name: 'Author 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 621, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 601, name: 'Claimant 1', medium: 621 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 622, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 602, name: 'Rating 1', medium: 622 }],
      },
      {
        type: ADD_CLAIMS,
        payload: [{ id: 61, name: 'Claim 1', claimant: 601, rating: 602 }],
      },
      {
        type: ADD_FORMATS,
        payload: [{ id: 41, name: 'Format 1' }],
      },
      {
        type: types.RESET_POSTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post added',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPost(reqData))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API, reqData);
  });
  it('should create actions to create post success', () => {
    const resp = { data: post };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [
          { id: 21, name: 'Tag 21' },
          { id: 22, name: 'Tag 22' },
        ],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 311, name: 'Category-Medium-311' }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [
          { id: 31, name: 'category 31', medium: 311 },
          { id: 32, name: 'category 32', medium: undefined },
        ],
      },
      {
        type: ADD_AUTHORS,
        payload: [{ id: 11, name: 'Author 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 621, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 601, name: 'Claimant 1', medium: 621 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 622, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 602, name: 'Rating 1', medium: 622 }],
      },
      {
        type: ADD_CLAIMS,
        payload: [{ id: 61, name: 'Claim 1', claimant: 601, rating: 602 }],
      },
      {
        type: ADD_FORMATS,
        payload: [{ id: 41, name: 'Format 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.RESET_POSTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post added',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPost(post_without_id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API, post_without_id);
  });
  it('should create actions to create post failure', () => {
    const errorMessage = 'Failed to create post';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPost(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API, post);
  });
  it('should create actions to update post without medium success', () => {
    const data = { ...post };
    delete data.medium;
    axios.put.mockResolvedValue({ data });

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [
          { id: 21, name: 'Tag 21' },
          { id: 22, name: 'Tag 22' },
        ],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 311, name: 'Category-Medium-311' }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [
          { id: 31, name: 'category 31', medium: 311 },
          { id: 32, name: 'category 32', medium: undefined },
        ],
      },
      {
        type: ADD_AUTHORS,
        payload: [{ id: 11, name: 'Author 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 621, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 601, name: 'Claimant 1', medium: 621 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 622, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 602, name: 'Rating 1', medium: 622 }],
      },
      {
        type: ADD_CLAIMS,
        payload: [{ id: 61, name: 'Claim 1', claimant: 601, rating: 602 }],
      },
      {
        type: ADD_FORMATS,
        payload: [{ id: 41, name: 'Format 1' }],
      },
      {
        type: types.ADD_POST,
        payload: {
          id: 1,
          name: 'Post 1',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: 41,
          medium: undefined,
          claims: [61],
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post updated',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePost(data))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1', data);
  });
  it('should create actions to update post success', () => {
    const resp = { data: post };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [
          { id: 21, name: 'Tag 21' },
          { id: 22, name: 'Tag 22' },
        ],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 311, name: 'Category-Medium-311' }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [
          { id: 31, name: 'category 31', medium: 311 },
          { id: 32, name: 'category 32', medium: undefined },
        ],
      },
      {
        type: ADD_AUTHORS,
        payload: [{ id: 11, name: 'Author 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 621, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 601, name: 'Claimant 1', medium: 621 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 622, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 602, name: 'Rating 1', medium: 622 }],
      },
      {
        type: ADD_CLAIMS,
        payload: [{ id: 61, name: 'Claim 1', claimant: 601, rating: 602 }],
      },
      {
        type: ADD_FORMATS,
        payload: [{ id: 41, name: 'Format 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.ADD_POST,
        payload: {
          id: 1,
          name: 'Post 1',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: 41,
          medium: 51,
          claims: [61],
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post updated',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePost(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1', post);
  });
  it('should create actions to update post failure', () => {
    const errorMessage = 'Failed to update post';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePost(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1', post);
  });
  it('should create actions to delete post success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_POSTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post deleted',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deletePost(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.POSTS_API + '/1');
  });
  it('should create actions to delete post failure', () => {
    const errorMessage = 'Failed to delete post';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deletePost(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.POSTS_API + '/1');
  });
});
