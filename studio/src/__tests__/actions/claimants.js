import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/claimants';
import * as types from '../../constants/claimants';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_MEDIA } from '../../constants/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('claimants actions', () => {

  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_CLAIMANTS_LOADING,
      payload: true,
    };
    expect(actions.loadingClaimants()).toEqual(startLoadingAction);
  });

  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_CLAIMANTS_LOADING,
      payload: false,
    };
    expect(actions.stopClaimantsLoading()).toEqual(stopLoadingAction);
  });

  it('should create an action to add claimants list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addClaimantsAction = {
      type: types.ADD_CLAIMANTS,
      payload: data,
    };
    expect(actions.addClaimantsList(data)).toEqual(addClaimantsAction);
  });

  it('should create an action to add claimants request', () => {
    const data = [{ query: 'query' }];
    const addClaimantsRequestAction = {
      type: types.ADD_CLAIMANTS_REQUEST,
      payload: data,
    };
    expect(actions.addClaimantsRequest(data)).toEqual(addClaimantsRequestAction);
  });

  it('should create an action to reset claimants', () => {
    const resetClaimantsRequestAction = {
      type: types.RESET_CLAIMANTS,
    };
    expect(actions.resetClaimants()).toEqual(resetClaimantsRequestAction);
  });
  it('should create actions to fetch claimants success without media and description', () => {
    const query = { page: 1, limit: 5 };
    const claimants = [{ id: 1, name: 'Claimant' }];
    const resp = { data: { nodes: claimants, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [{ id: 1, name: 'Claimant', medium: undefined, description: { "html": undefined, "json": undefined, } }],
      },
      {
        type: types.ADD_CLAIMANTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimants(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch claimants success not all with media and not all with description and html', () => {
    const query = { page: 1, limit: 5 };

    const claimants = [
      { id: 1, name: 'Claimant', medium: { id: 11, medium: 'Medium' } },
      { id: 2, name: 'Claimant 2', description: { "hello": "test" }, description_html: "<h1>Hello test</h1>" },
    ];
    const resp = { data: { nodes: claimants, total: 2 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 11, medium: 'Medium' }],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [
          { id: 1, name: 'Claimant', medium: 11, description: { html: undefined, json: undefined, } },
          { id: 2, name: 'Claimant 2', medium: undefined, description: { json: { "hello": "test" }, html: "<h1>Hello test</h1>" } },
        ],
      },
      {
        type: types.ADD_CLAIMANTS_REQUEST,
        payload: {
          data: [1, 2],
          query: query,
          total: 2,
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimants(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch claimants success all with media and all with description and html', () => {
    const query = { page: 1, limit: 5 };

    const description1 = { "hello": "test" }
    const description_html1 = "<h1>Hello test</h1>"

    const description2 = { "hello2": "test2" }
    const description_html2 = "<h1>Hello test 2</h1>"


    const claimants = [
      { id: 1, name: 'Claimant', medium: { id: 11, medium: 'Medium' }, description: description1, description_html: description_html1 },
      { id: 2, name: 'Claimant 2', medium: { id: 21, medium: 'Medium 2' }, description: description2, description_html: description_html2 },
    ];
    const resp = { data: { nodes: claimants, total: 2 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [
          { id: 11, medium: 'Medium' },
          { id: 21, medium: 'Medium 2' },
        ],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [
          { id: 1, name: 'Claimant', medium: 11, description: { json: description1, html: description_html1 } },
          { id: 2, name: 'Claimant 2', medium: 21, description: { json: description2, html: description_html2 } },
        ],
      },
      {
        type: types.ADD_CLAIMANTS_REQUEST,
        payload: {
          data: [1, 2],
          query: query,
          total: 2,
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimants(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch claimants failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimants(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API, {
      params: query,
    });
  });
  it('should create actions to get claimant by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimant(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API + '/' + id);
  });
  it('should create actions to get claimant by id success', () => {
    const id = 1;
    const claimant = { id, name: 'Claimant' };
    const resp = { data: claimant };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: types.GET_CLAIMANT,
        payload: {
          id, name: 'Claimant', medium: undefined, description: { html: undefined, json: undefined, },
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimant(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API + '/' + id);
  });
  // !needs to be modified remove description_html on line 191,192 object after making changes to /actions/claimants.js

  it('should create actions to get claimant by id where claimant has medium and has description and html', () => {
    const id = 1;
    const medium = { id: 1, medium: 'Medium' };
    const description = { "hello": "test" }
    const description_html = "<h1>hello test 1</h1>"
    const claimant = { id, name: 'Claimant', medium, description, description_html };
    const resp = { data: claimant };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.GET_CLAIMANT,
/*!here */         payload: { id, name: 'Claimant', medium: 1, description: { html: description_html, json: description, }, description_html },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimant(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API + '/' + id);
  });
  it('should create actions to create claimant success', () => {
    const claimant = { name: 'Claimant' };
    const resp = { data: claimant };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_CLAIMANTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claimant created',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.createClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.CLAIMANTS_API, claimant);
  });
  it('should create actions to create claimant failure', () => {
    const claimant = { name: 'Claimant' };
    const errorMessage = 'Failed to create claimant';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
      .dispatch(actions.createClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.CLAIMANTS_API, claimant);
  });
  it('should create actions to update claimant without medium success and without description and description html', () => {
    const claimant = { id: 1, name: 'Claimant' };
    const resp = { data: claimant };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: types.UPDATE_CLAIMANT,
        payload: { id: 1, name: 'Claimant', medium: undefined, description: { json: undefined, html: undefined } },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claimant updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1', claimant);
  });
  // !needs to be modified remove description_html on line  object after making changes to /actions/claimants.js
  it('should create actions to update claimant with medium and description success', () => {
    const medium = { id: 4, name: 'medium' };
    const description = { "hello": "test" }
    const description_html = "<h1>hello test 1</h1>"
    const claimant = { id: 1, name: 'Claimant', medium, description, description_html };
    const resp = { data: claimant };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.UPDATE_CLAIMANT,
        payload: { id: 1, name: 'Claimant', medium: 4, description: { json: description, html: description_html }},
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claimant updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1', claimant);
  });
  it('should create actions to update claimant failure', () => {
    const claimant = { id: 1, name: 'Claimant' };
    const errorMessage = 'Failed to update claimant';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1', claimant);
  });
  it('should create actions to delete claimant success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_CLAIMANTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claimant deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteClaimant(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1');
  });
  it('should create actions to delete claimant failure', () => {
    const errorMessage = 'Failed to delete claimant';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
      .dispatch(actions.deleteClaimant(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1');
  });
  // !this to be fully modified after making changes to /actions/claimants.js
  it('should create actions to add claimants list', () => {
    const medium = { id: 4, name: 'mediumm' };
    const description = { "hello": "test" }
    const description_html = "<h1>hello test</h1>"
    const claimants = [
      { id: 1, name: 'Claimant', description, description_html: description_html },
      { id: 2, name: 'Claimant', medium: medium },
    ];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [
          {
            id: 1, name: 'Claimant', medium: undefined,
            description: { json: description, html: description_html },
          },
          { id: 2, name: 'Claimant', medium: 4, description: { json: undefined, html: undefined } },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addClaimants(claimants));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add claimants list where no claimant has medium and no description', () => {
    const claimants = [
      { id: 1, name: 'Claimant' },
      { id: 2, name: 'Claimant' },
    ];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [
          {
            id: 1, name: 'Claimant', medium: undefined, description: {
              json: undefined,
              html: undefined,
            }
          },
          {
            id: 2, name: 'Claimant', medium: undefined, description: {
              json: undefined,
              html: undefined,
            }
          },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addClaimants(claimants));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add empty claimants list', () => {
    const claimants = [];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addClaimants(claimants));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
