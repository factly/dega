import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/events';
import * as types from '../../constants/events';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);
const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Events actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_EVENTS_LOADING,
      payload: true,
    };
    expect(actions.loadingEvents()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_EVENTS_LOADING,
      payload: false,
    };
    expect(actions.stopEventsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add events list', () => {
    const data = [
      { id: 1, name: 'event 1' },
      { id: 2, name: 'event 2' },
    ];

    const addEventsAction = {
      type: types.ADD_EVENTS,
      payload: data,
    };
    expect(actions.addEvents(data)).toEqual(addEventsAction);
  });
  it('should create an action to add event request', () => {
    const data = [{ query: 'query' }];
    const addEventsRequestAction = {
      type: types.ADD_EVENTS_REQUEST,
      payload: data,
    };
    expect(actions.addEventsRequest(data)).toEqual(addEventsRequestAction);
  });
  it('should create an action to add event', () => {
    const data = { id: 1, name: 'new event' };
    const addEventAction = {
      type: types.ADD_EVENT,
      payload: data,
    };
    expect(actions.getEventByID(data)).toEqual(addEventAction);
  });
  it('should create an action to reset event', () => {
    const resetEventsAction = {
      type: types.RESET_EVENTS,
    };
    expect(actions.resetEvents()).toEqual(resetEventsAction);
  });
  it('should create actions to add default events', () => {
    const events = [{ id: 1, name: 'Event' }];
    const resp = { data: { nodes: events, total: 1 } };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_EVENTS,
        payload: [{ id: 1, name: 'Event' }],
      },
      {
        type: types.ADD_EVENTS_REQUEST,
        payload: {
          data: [1],
          total: 1,
        },
      },
      {
        type: types.SET_EVENTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addDefaultEvents())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.EVENTS_API + '/default');
  });
  it('should create actions to add default events failure', () => {
    const errorMessage = 'Failed to add default events';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
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
        type: types.SET_EVENTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addDefaultEvents())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.EVENTS_API + '/default');
  });
  it('should create actions to fetch events success', () => {
    const query = { page: 1, limit: 5 };
    const events = [{ id: 1, name: 'Event' }];
    const resp = { data: { nodes: events, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_EVENTS,
        payload: [{ id: 1, name: 'Event' }],
      },
      {
        type: types.ADD_EVENTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_EVENTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEvents(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.EVENTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch events failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch events';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
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
        type: types.SET_EVENTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEvents(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.EVENTS_API, {
      params: query,
    });
  });
  it('should create actions to get event by id success', () => {
    const id = 1;
    const event = { id, name: 'Event' };
    const resp = { data: event };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_EVENT,
        payload: { id, name: 'Event' },
      },
      {
        type: types.SET_EVENTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEvent(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.EVENTS_API + '/' + id);
  });
  it('should create actions to get event by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch event';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
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
        type: types.SET_EVENTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEvent(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.EVENTS_API + '/' + id);
  });
  it('should create actions to create event success', () => {
    const event = { name: 'Event' };
    const resp = { data: event };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_EVENTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Event added',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addEvent(event))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.EVENTS_API, event);
  });
  it('should create actions to create event failure', () => {
    const event = { name: 'Event' };
    const errorMessage = 'Failed to create event';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
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
      .dispatch(actions.addEvent(event))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.EVENTS_API, event);
  });
  it('should create actions to update event success', () => {
    const event = { id: 1, name: 'Event' };
    const resp = { data: event };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_EVENT,
        payload: { id: 1, name: 'Event' },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Event updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_EVENTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateEvent(event))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.EVENTS_API + '/1', event);
  });
  it('should create actions to update event failure', () => {
    const event = { id: 1, name: 'Event' };
    const errorMessage = 'Failed to update event';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
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
        type: types.SET_EVENTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateEvent(event))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.EVENTS_API + '/1', event);
  });
  it('should create actions to delete event success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_EVENTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Event deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteEvent(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.EVENTS_API + '/1');
  });
  it('should create actions to delete event failure', () => {
    const errorMessage = 'Failed to delete event';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EVENTS_LOADING,
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
      .dispatch(actions.deleteEvent(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.EVENTS_API + '/1');
  });
});
