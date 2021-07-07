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
Date.now = jest.fn(() => 1487076708000);

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
const post_without_media = {
  id: 123,
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
  claims: [
    {
      id: 61,
      name: 'Claim 1',
      claimant: { id: 601, name: 'Claimant 1', medium: { id: 621, name: 'Medium-Claimant 1' } },
      rating: { id: 602, name: 'Rating 1', medium: { id: 622, name: 'Medium-Rating 1' } },
    },
  ],
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
    const query = {
      page: 1,
      limit: 5,
      q: 'post',
      sort: 'asc',
      tag: [21],
      category: [33],
      format: [42],
      status: 'draft',
      author: [11],
    };
    const posts = [{ ...post, status: 'draft' }];
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
            status: 'draft',
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

    const params = new URLSearchParams(
      'category=33&tag=21&format=42&page=1&limit=5&sort=asc&q=post&status=draft&author=11',
    );

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPosts(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API, {
      params: params,
    });
  });
  it('should create actions to fetch posts success without page and limit ', () => {
    const query = {
      q: 'post',
      sort: 'asc',
      tag: [21],
      category: [33],
      format: [42],
      status: 'publish',
    };
    const posts = [{ ...post, status: 'publish' }];
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
            status: 'publish',
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

    const params = new URLSearchParams(
      'category=33&tag=21&format=42&sort=asc&q=post&status=publish',
    );

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPosts(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API, {
      params: params,
    });
  });
  it('should create actions to fetch posts success without any optional fields', () => {
    const query = { page: 1, limit: 5 };
    const post_without_fields = { ...post, status: 'ready' };
    post_without_fields.categories = [];
    post_without_fields.authors = [];
    post_without_fields.tags = [];
    post_without_fields.claims = [];
    post_without_fields.medium = undefined;

    const resp = { data: { nodes: [post_without_fields], total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_AUTHORS,
        payload: [],
      },
      {
        type: ADD_TAGS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CATEGORIES,
        payload: [],
      },
      {
        type: ADD_FORMATS,
        payload: [{ id: 41, name: 'Format 1' }],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_RATINGS,
        payload: [],
      },
      {
        type: ADD_CLAIMS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_POSTS,
        payload: [
          {
            id: 1,
            name: 'Post 1',
            status: 'ready',
            authors: [],
            tags: [],
            categories: [],
            format: 41,
            medium: undefined,
            claims: [],
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

    const params = new URLSearchParams('page=1&limit=5');

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPosts(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API, {
      params: params,
    });
  });
  it('should throw error on fetch posts without required field format', () => {
    const { format, ...post_without_author } = post;
    const posts = [post_without_author];
    const resp = { data: { nodes: posts, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const query = { page: 1, limit: 5 };
    const store = mockStore({ initialState });
    const params = new URLSearchParams('page=1&limit=5');

    store.dispatch(actions.getPosts(query)).catch((err) => expect(err).toBeInstanceOf(TypeError));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API, {
      params: params,
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
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];
    const params = new URLSearchParams('page=1&limit=5');

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPosts(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POSTS_API, {
      params: params,
    });
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
  it('should create actions to get post by id success without any optional fields', () => {
    const post_without_fields = { ...post };
    post_without_fields.categories = [];
    post_without_fields.authors = [];
    post_without_fields.tags = [];
    post_without_fields.claims = [];
    post_without_fields.medium = undefined;

    const id = 1;
    const resp = { data: post_without_fields };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [],
      },
      {
        type: ADD_AUTHORS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CATEGORIES,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_RATINGS,
        payload: [],
      },
      {
        type: ADD_CLAIMS,
        payload: [],
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
          authors: [],
          tags: [],
          categories: [],
          format: 41,
          medium: undefined,
          claims: [],
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
  it('should throw error on get post by id without required field format', () => {
    const { format, ...post_without_format } = post;

    const id = 1;
    const resp = { data: post_without_format };
    axios.get.mockResolvedValue(resp);

    const store = mockStore({ initialState });
    store.dispatch(actions.getPost(id)).catch((err) => expect(err).toBeInstanceOf(TypeError));

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
          time: Date.now(),
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
          message: 'Post added & Ready to Publish',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPost(post_without_id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API, post_without_id);
  });
  it('should create actions to create post success without any optional fields', () => {
    const post_without_fields = { ...post };
    post_without_fields.categories = [];
    post_without_fields.authors = [];
    post_without_fields.tags = [];
    post_without_fields.claims = [];
    post_without_fields.medium = undefined;

    const resp = { data: post_without_fields };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CATEGORIES,
        payload: [],
      },
      {
        type: ADD_AUTHORS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_RATINGS,
        payload: [],
      },
      {
        type: ADD_CLAIMS,
        payload: [],
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
          message: 'Post added & Ready to Publish',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPost(post_without_fields))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API, post_without_fields);
  });
  it('should throw error on create post without required field format', () => {
    const { format, ...post_without_format } = post;

    const resp = { data: post_without_format };
    axios.post.mockResolvedValue(resp);

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPost(post_without_id))
      .catch((err) => expect(err).toBeInstanceOf(TypeError));

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
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPost(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API, post);
  });
  it('should create actions to update post success', () => {
    const resp = { data: { ...post, status: 'draft' } };
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
          status: 'draft',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: 41,
          medium: 51,
          claims: [61],
        },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Draft saved & Ready to Publish',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePost(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1', post);
  });
  it('should create actions to publish post success', () => {
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
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post published',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.publishPost(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1' + '/publish', post);
  });
  it('should create actions to publish post success without medium', () => {
    const resp = { data: post_without_media };
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
        type: types.ADD_POST,
        payload: {
          id: 123,
          name: 'Post 1',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: 41,
          claims: [61],
        },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post published',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.publishPost(post_without_media))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(
      types.POSTS_API + '/123' + '/publish',
      post_without_media,
    );
  });
  it('should create actions to publish success', () => {
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
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post published',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.publish(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API + '/publish', post);
  });
  it('should create actions to publish success without medium', () => {
    const resp = { data: post_without_media };
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
        type: types.ADD_POST,
        payload: {
          id: 123,
          name: 'Post 1',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: 41,
          claims: [61],
        },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Post published',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.publish(post_without_media))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API + '/publish', post_without_media);
  });

  it('should create actions to publish failure', () => {
    const errorMessage = 'Failed to publish post';
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
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.publish(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API + '/publish', post);
  });

  it('should create actions to template success', () => {
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
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Template created',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addTemplate(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API + '/templates', post);
  });

  it('should create actions to template success without medium', () => {
    const resp = { data: post_without_media };
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
        type: types.ADD_POST,
        payload: {
          id: 123,
          name: 'Post 1',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: 41,
          claims: [61],
        },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Template created',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addTemplate(post_without_media))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API + '/templates', post_without_media);
  });

  it('should create actions to template failure', () => {
    const errorMessage = 'Failed to publish post';
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
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addTemplate(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POSTS_API + '/templates', post);
  });

  it('should create actions to update success without any optional fields', () => {
    const post_without_fields = { ...post };
    post_without_fields.categories = [];
    post_without_fields.authors = [];
    post_without_fields.tags = [];
    post_without_fields.claims = [];
    post_without_fields.medium = undefined;
    post_without_fields.status = 'publish';

    const resp = { data: post_without_fields };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POSTS_LOADING,
        payload: true,
      },
      {
        type: ADD_TAGS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CATEGORIES,
        payload: [],
      },
      {
        type: ADD_AUTHORS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_RATINGS,
        payload: [],
      },
      {
        type: ADD_CLAIMS,
        payload: [],
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
          authors: [],
          tags: [],
          categories: [],
          format: 41,
          medium: undefined,
          claims: [],
          status: 'publish',
        },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Format 1 Published',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePost(post_without_fields))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1', post_without_fields);
  });
  it('should throw error on update post without required field format', () => {
    const { format, ...post_without_format } = post;

    const resp = { data: post_without_format };
    axios.put.mockResolvedValue(resp);

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePost(post_without_format))
      .catch((err) => expect(err).toBeInstanceOf(TypeError));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1', post_without_format);
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
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePost(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1', post);
  });
  it('should create actions to publish post failure', () => {
    const errorMessage = 'Failed to publish post';
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
          time: Date.now(),
        },
      },
      {
        type: types.SET_POSTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.publishPost(post))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POSTS_API + '/1' + '/publish', post);
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
          time: Date.now(),
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
          time: Date.now(),
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
