import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/webhooks';
import * as types from '../../constants/webhooks';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_EVENTS } from '../../constants/events';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('webhooks actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_WEBHOOKS_LOADING,
      payload: true,
    };
    expect(actions.loadingWebhooks()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_WEBHOOKS_LOADING,
      payload: false,
    };
    expect(actions.stopWebhooksLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add webhooks list', () => {
    const data = [
      { id: 1, name: 'webhook 1' },
      { id: 2, name: 'webhook 2' },
    ];

    const addWebhooksAction = {
      type: types.ADD_WEBHOOKS,
      payload: data,
    };
    expect(actions.addWebhookList(data)).toEqual(addWebhooksAction);
  });
  it('should create an action to add webhook request', () => {
    const data = [{ query: 'query' }];
    const addWebhooksRequestAction = {
      type: types.ADD_WEBHOOKS_REQUEST,
      payload: data,
    };
    expect(actions.addWebhookRequest(data)).toEqual(addWebhooksRequestAction);
  });
  it('should create an action to add webhook', () => {
    const data = { id: 1, name: 'new webhook' };
    const addWebhookAction = {
      type: types.ADD_WEBHOOK,
      payload: data,
    };
    expect(actions.getWebhookByID(data)).toEqual(addWebhookAction);
  });
  it('should create an action to reset webhook', () => {
    const resetWebhooksAction = {
      type: types.RESET_WEBHOOKS,
    };
    expect(actions.resetWebhooks()).toEqual(resetWebhooksAction);
  });
  it('should create actions to fetch webhooks success', () => {
    const query = { page: 1, limit: 5 };
    const webhooks = [
      {
        id: 1,
        name: 'Webhook',
        events: [
          {
            id: 1,
          },
        ],
      },
    ];
    const resp = { data: { nodes: webhooks, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
        payload: true,
      },
      {
        type: ADD_EVENTS,
        payload: [{ id: 1 }],
      },
      {
        type: types.ADD_WEBHOOKS,
        payload: [{ id: 1, name: 'Webhook', events: [1] }],
      },
      {
        type: types.ADD_WEBHOOKS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_WEBHOOKS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getWebhooks(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.WEBHOOKS_API, {
      params: query,
    });
  });
  it('should create actions to fetch webhooks failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
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
        type: types.SET_WEBHOOKS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getWebhooks(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.WEBHOOKS_API, {
      params: query,
    });
  });
  it('should create actions to get webhook by id success', () => {
    const id = 1;
    const events = { id: 1 };
    const webhook = { id, name: 'Webhook', events: [events] };
    const resp = { data: webhook };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
        payload: true,
      },
      {
        type: ADD_EVENTS,
        payload: [events],
      },
      {
        type: types.ADD_WEBHOOK,
        payload: { id, name: 'Webhook', events: [1] },
      },
      {
        type: types.SET_WEBHOOKS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getWebhook(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.WEBHOOKS_API + '/' + id);
  });
  it('should create actions to get webhook by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
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
        type: types.SET_WEBHOOKS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getWebhook(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.WEBHOOKS_API + '/' + id);
  });
  it('should create actions to create webhook success', () => {
    const webhook = { name: 'Webhook', events: [{ id: 1 }] };
    const resp = { data: webhook };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
        payload: true,
      },
      {
        type: ADD_EVENTS,
        payload: [{ id: 1 }],
      },
      {
        type: types.RESET_WEBHOOKS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Webhook added',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addWebhook(webhook))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.WEBHOOKS_API, webhook);
  });
  it('should create actions to create webhook failure', () => {
    const webhook = { name: 'Webhook' };
    const errorMessage = 'Failed to create webhook';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
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
      .dispatch(actions.addWebhook(webhook))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.WEBHOOKS_API, webhook);
  });
  it('should create actions to update webhook success', () => {
    const event = { id: 1 };
    const webhook = { id: 1, name: 'Webhook', events: [event] };
    const resp = { data: webhook };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
        payload: true,
      },
      {
        type: ADD_EVENTS,
        payload: [event],
      },
      {
        type: types.ADD_WEBHOOK,
        payload: { id: 1, name: 'Webhook', events: [1] },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Webhook updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_WEBHOOKS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateWebhook(webhook))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.WEBHOOKS_API + '/1', webhook);
  });
  it('should create actions to update webhook failure', () => {
    const event = { id: 1 };
    const webhook = { id: 1, name: 'Webhook', events: [event] };
    const errorMessage = 'Failed to update webhook';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
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
        type: types.SET_WEBHOOKS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateWebhook(webhook))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.WEBHOOKS_API + '/1', webhook);
  });
  it('should create actions to delete webhook success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_WEBHOOKS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Webhook deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteWebhook(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.WEBHOOKS_API + '/1');
  });
  it('should create actions to delete webhook failure', () => {
    const errorMessage = 'Failed to delete Webhook';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_WEBHOOKS_LOADING,
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
      .dispatch(actions.deleteWebhook(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.WEBHOOKS_API + '/1');
  });
});
