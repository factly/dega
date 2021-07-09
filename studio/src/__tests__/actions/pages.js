import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/pages';
import * as types from '../../constants/pages';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_MEDIA } from '../../constants/media';
import { ADD_FORMATS } from '../../constants/formats';
import { ADD_AUTHORS } from '../../constants/authors';
import { ADD_TAGS } from '../../constants/tags';
import { ADD_CATEGORIES } from '../../constants/categories';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  req: [],
  details: {},
  loading: true,
};

const page1 = {
  id: 1,
  name: 'Page 1',
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
};

const page2 = {
  id: 2,
  name: 'Page 2',
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
const page_without_media = {
  id: 123,
  name: 'Page 1',
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
};

describe('pages actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_PAGES_LOADING,
      payload: true,
    };
    expect(actions.loadingPages()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_PAGES_LOADING,
      payload: false,
    };
    expect(actions.stopPagesLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add pages list', () => {
    const data = [page1, page2];

    const addPagesAction = {
      type: types.ADD_PAGES,
      payload: data,
    };
    expect(actions.addPagesList(data)).toEqual(addPagesAction);
  });
  it('should create an action to add pages request', () => {
    const data = [{ query: 'query' }];
    const addPagesRequestAction = {
      type: types.ADD_PAGES_REQUEST,
      payload: data,
    };
    expect(actions.addPagesRequest(data)).toEqual(addPagesRequestAction);
  });
  it('should create an action to add page', () => {
    const data = page1;
    const addPageAction = {
      type: types.ADD_PAGE,
      payload: data,
    };
    expect(actions.getPageByID(data)).toEqual(addPageAction);
  });
  it('should create an action to reset pages', () => {
    const resetPagesRequestAction = {
      type: types.RESET_PAGES,
    };
    expect(actions.resetPages()).toEqual(resetPagesRequestAction);
  });
  it('should create actions to fetch pages success', () => {
    const query = {
      page: 1,
      limit: 5,
      q: 'page',
      sort: 'asc',
      tag: [21],
      category: [33],
      format: [42],
      status: 'draft',
      author: [11],
    };
    const pages = [{ ...page1, status: 'draft' }];
    const resp = { data: { nodes: pages, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.ADD_PAGES,
        payload: [
          {
            id: 1,
            name: 'Page 1',
            status: 'draft',
            authors: [11],
            tags: [21, 22],
            categories: [31, 32],
            format: 41,
            medium: 51,
          },
        ],
      },
      {
        type: types.ADD_PAGES_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const params = new URLSearchParams(
      'category=33&tag=21&format=42&page=1&limit=5&sort=asc&q=page&status=draft&author=11',
    );

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPages(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PAGES_API, {
      params: params,
    });
  });
  it('should create actions to fetch pages failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];
    const params = new URLSearchParams('page=1&limit=5');

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPages(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PAGES_API, {
      params: params,
    });
  });
  it('should create actions to fetch pages success without page and limit ', () => {
    const query = {
      q: 'post',
      sort: 'asc',
      tag: [21],
      category: [33],
      format: [42],
      status: 'publish',
    };
    const pages = [{ ...page1, status: 'publish' }];
    const resp = { data: { nodes: pages, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.ADD_PAGES,
        payload: [
          {
            id: 1,
            name: 'Page 1',
            status: 'publish',
            authors: [11],
            tags: [21, 22],
            categories: [31, 32],
            format: 41,
            medium: 51,
          },
        ],
      },
      {
        type: types.ADD_PAGES_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const params = new URLSearchParams(
      'category=33&tag=21&format=42&sort=asc&q=post&status=publish',
    );

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPages(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PAGES_API, {
      params: params,
    });
  });
  it('should create actions to fetch pages success without any optional fields', () => {
    const query = { page: 1, limit: 5 };
    const page = { ...page1, status: 'ready' };
    page.categories = [];
    page.authors = [];
    page.tags = [];
    page.medium = undefined;

    const resp = { data: { nodes: [page], total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        type: types.ADD_PAGES,
        payload: [
          {
            id: 1,
            name: 'Page 1',
            status: 'ready',
            authors: [],
            tags: [],
            categories: [],
            format: 41,
            medium: undefined,
          },
        ],
      },
      {
        type: types.ADD_PAGES_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const params = new URLSearchParams('page=1&limit=5');

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPages(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PAGES_API, {
      params: params,
    });
  });
  it('should create actions to get page by id success', () => {
    const id = 1;
    const resp = { data: page1 };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.ADD_PAGE,
        payload: {
          id: 1,
          name: 'Page 1',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: { id: 41, name: 'Format 1' },
          medium: 51,
        },
      },
      {
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPage(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PAGES_API + '/' + id);
  });
  it('should create actions to get page by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPage(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PAGES_API + '/' + id);
  });
  it('should create actions to get page by id success without any optional fields', () => {
    const page = { ...page1 };
    page.categories = [];
    page.authors = [];
    page.tags = [];
    page.medium = undefined;

    const id = 1;
    const resp = { data: page };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        type: types.ADD_PAGE,
        payload: {
          id: 1,
          name: 'Page 1',
          authors: [],
          tags: [],
          categories: [],
          format: { id: 41, name: 'Format 1' },
          medium: undefined,
        },
      },
      {
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPage(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PAGES_API + '/' + id);
  });
  it('should create actions to create page success', () => {
    const resp = { data: page1 };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.RESET_PAGES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Page added & Ready to Publish',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPage(page1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.PAGES_API, page1);
  });
  it('should create actions to create page failure', () => {
    const errorMessage = 'Failed to create page';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
      .dispatch(actions.addPage(page1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.PAGES_API, page1);
  });
  it('should create actions to create page success without any optional fields', () => {
    const page = { ...page1 };
    page.categories = [];
    page.authors = [];
    page.tags = [];
    page.medium = undefined;

    const resp = { data: page };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        type: types.RESET_PAGES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Page added & Ready to Publish',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPage(page))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.PAGES_API, page);
  });
  it('should create actions to update page success', () => {
    const resp = { data: { ...page1, status: 'draft' } };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        payload: [{ id: 51, name: 'Medium 1' }],
      },
      {
        type: types.ADD_PAGE,
        payload: {
          id: 1,
          name: 'Page 1',
          status: 'draft',
          authors: [11],
          tags: [21, 22],
          categories: [31, 32],
          format: { id: 41, name: 'Format 1' },
          medium: 51,
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
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePage(page1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PAGES_API + '/1', page1);
  });
  it('should create actions to update page failure', () => {
    const errorMessage = 'Failed to update page';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePage(page1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PAGES_API + '/1', page1);
  });
  it('should create actions to update success without any optional fields', () => {
    const page = { ...page1 };
    page.categories = [];
    page.authors = [];
    page.tags = [];
    page.medium = undefined;
    page.status = 'publish';

    const resp = { data: page };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
        type: types.ADD_PAGE,
        payload: {
          id: 1,
          name: 'Page 1',
          authors: [],
          tags: [],
          categories: [],
          format: { id: 41, name: 'Format 1' },
          medium: undefined,
          status: 'publish',
        },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Page Published',
          time: Date.now(),
        },
      },
      {
        type: types.SET_PAGES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePage(page))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PAGES_API + '/1', page);
  });
  it('should create actions to delete page success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
        payload: true,
      },
      {
        type: types.RESET_PAGES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Page deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deletePage(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.PAGES_API + '/1');
  });
  it('should create actions to delete page failure', () => {
    const errorMessage = 'Failed to delete page';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PAGES_LOADING,
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
      .dispatch(actions.deletePage(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.PAGES_API + '/1');
  });
});
