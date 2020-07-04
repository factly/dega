import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/categories';
import * as types from '../../constants/categories';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_MEDIA } from '../../constants/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

describe('categories actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_CATEGORIES_LOADING,
      payload: true,
    };
    expect(actions.loadingCategories()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_CATEGORIES_LOADING,
      payload: false,
    };
    expect(actions.stopCategoriesLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add categories list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addCategoriesAction = {
      type: types.ADD_CATEGORIES,
      payload: data,
    };
    expect(actions.addCategoriesList(data)).toEqual(addCategoriesAction);
  });
  it('should create an action to add categories request', () => {
    const data = [{ query: 'query' }];
    const addCategoriesRequestAction = {
      type: types.ADD_CATEGORIES_REQUEST,
      payload: data,
    };
    expect(actions.addCategoriesRequest(data)).toEqual(addCategoriesRequestAction);
  });
  it('should create an action to add category', () => {
    const data = { id: 1, name: 'new category' };
    const addCategoriesRequestAction = {
      type: types.ADD_CATEGORY,
      payload: data,
    };
    expect(actions.getCategoryByID(data)).toEqual(addCategoriesRequestAction);
  });
  it('should create an action to reset categories', () => {
    const resetCategoriesRequestAction = {
      type: types.RESET_CATEGORIES,
    };
    expect(actions.resetCategories()).toEqual(resetCategoriesRequestAction);
  });
  it('should create actions to fetch categories success', () => {
    const query = { page: 1, limit: 5 };
    const categories = [{ id: 1, name: 'Category' }];
    const resp = { data: { nodes: categories, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_CATEGORIES,
        payload: [{ id: 1, name: 'Category', medium: undefined }],
      },
      {
        type: types.ADD_CATEGORIES_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getCategories(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CATEGORIES_API, {
      params: query,
    });
  });
  it('should create actions to fetch categories success with media', () => {
    const query = { page: 1, limit: 5 };
    const medium = { id: 3, medium: 'Medium' };
    const categories = [{ id: 1, name: 'Category', medium }];
    const resp = { data: { nodes: categories, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_CATEGORIES,
        payload: [{ id: 1, name: 'Category', medium: 3 }],
      },
      {
        type: types.ADD_CATEGORIES_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getCategories(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CATEGORIES_API, {
      params: query,
    });
  });
  it('should create actions to fetch categories failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
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
      .dispatch(actions.getCategories(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CATEGORIES_API, {
      params: query,
    });
  });
  it('should create actions to get category by id', () => {
    const id = 1;
    const category = { id, name: 'Category' };
    const resp = { data: category };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      },
      {
        type: types.ADD_CATEGORY,
        payload: { id, name: 'Category', medium: undefined },
      },
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getCategory(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CATEGORIES_API + '/' + id);
  });
  it('should create actions to get category by id where category has medium', () => {
    const id = 1;
    const medium = { id: 1, medium: 'Medium' };
    const category = { id, name: 'Category', medium };
    const resp = { data: category };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_CATEGORY,
        payload: { id, name: 'Category', medium: 1 },
      },
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getCategory(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CATEGORIES_API + '/' + id);
  });
  it('should create actions to create category success', () => {
    const category = { name: 'Category' };
    const resp = { data: category };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      },
      {
        type: types.RESET_CATEGORIES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Category added',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addCategory(category))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.CATEGORIES_API, category);
  });
  it('should create actions to create category failure', () => {
    const category = { name: 'Category' };
    const errorMessage = 'Failed to create category';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
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
      .dispatch(actions.addCategory(category))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.CATEGORIES_API, category);
  });
  it('should create actions to update category without medium success', () => {
    const category = { id: 1, name: 'Category' };
    const resp = { data: category };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      },
      {
        type: types.ADD_CATEGORY,
        payload: { id: 1, name: 'Category', medium: undefined },
      },
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Category updated',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateCategory(category))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CATEGORIES_API + '/1', category);
  });
  it('should create actions to update category with medium success', () => {
    const medium = { id: 4, name: 'mediumm' };
    const category = { id: 1, name: 'Category', medium: medium };
    const resp = { data: category };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_CATEGORY,
        payload: { id: 1, name: 'Category', medium: 4 },
      },
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Category updated',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateCategory(category))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CATEGORIES_API + '/1', category);
  });
  it('should create actions to update category failure', () => {
    const category = { id: 1, name: 'Category' };
    const errorMessage = 'Failed to update category';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
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
      .dispatch(actions.updateCategory(category))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CATEGORIES_API + '/1', category);
  });
  it('should create actions to delete category success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      },
      {
        type: types.RESET_CATEGORIES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Category deleted',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteCategory(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.CATEGORIES_API + '/1');
  });
  it('should create actions to delete category failure', () => {
    const errorMessage = 'Failed to delete category';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CATEGORIES_LOADING,
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
      .dispatch(actions.deleteCategory(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.CATEGORIES_API + '/1');
  });
  it('should create actions to add categories list', () => {
    const medium = { id: 4, name: 'mediumm' };
    const categories = [
      { id: 1, name: 'Category' },
      { id: 2, name: 'Category', medium: medium },
    ];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_CATEGORIES,
        payload: [
          { id: 1, name: 'Category', medium: undefined },
          { id: 2, name: 'Category', medium: 4 },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addCategories(categories));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add empty categories list', () => {
    const categories = [];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_CATEGORIES,
        payload: [],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addCategories(categories));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
