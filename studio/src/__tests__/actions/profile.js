import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/profile';
import * as types from '../../constants/profile';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  details: {},
  loading: true,
};

describe('profile actions', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ initialState });
  });
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_PROFILE_LOADING,
      payload: true,
    };
    expect(actions.loadingProfile()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_PROFILE_LOADING,
      payload: false,
    };
    expect(actions.stopProfileLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to ADD_PROFILE', () => {
    const data = { id: 1, email: 'abc@gmail.com', first_name: 'abc' };
    const addProfileAction = {
      type: types.ADD_PROFILE,
      payload: data,
    };
    expect(actions.getProfile(data)).toEqual(addProfileAction);
  });
  it('should create actions to fetch user profile success', () => {
    const profile = { id: 1, email: 'abc@gmail.com', first_name: 'abc' };
    const resp = { data: profile };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      {
        type: types.ADD_PROFILE,
        payload: { id: 1, email: 'abc@gmail.com', first_name: 'abc' },
      },
      {
        type: types.SET_PROFILE_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getUserProfile())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PROFILE_API);
  });
  it('should create actions to fetch user profile failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
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
    store
      .dispatch(actions.getUserProfile())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PROFILE_API);
  });
  it('should create actions to update profile success', () => {
    const profile = { id: 1, email: 'abc@gmail.com', first_name: 'abc' };
    const resp = { data: profile };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      {
        type: types.ADD_PROFILE,
        payload: { id: 1, email: 'abc@gmail.com', first_name: 'abc' },
      },
      {
        type: types.SET_PROFILE_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Profile Updated',
          time: Date.now(),
        },
      },
    ];
    store
      .dispatch(actions.updateProfile(profile))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PROFILE_API, profile);
  });
  it('should create actions to update profile failure', () => {
    const profile = { id: 1, email: 'abc@gmail.com', first_name: 'abc' };
    const errorMessage = 'Unable to update profile';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
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
    store
      .dispatch(actions.updateProfile(profile))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PROFILE_API, profile);
  });
});
