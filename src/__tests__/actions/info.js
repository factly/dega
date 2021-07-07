import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/info';
import * as types from '../../constants/info';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  categories: 0,
  tag: 0,
  article: {
    draft: 0,
    template: 0,
    publish: 0,
  },
  factCheck: {
    draft: 0,
    template: 0,
    publish: 0,
  },
  podcasts: 0,
};

describe('info actions', () => {
  it('should create an action to addInfo', () => {
    const info = {
      categories: 4,
      tag: 2,
      article: {
        draft: 1,
        template: 2,
        publish: 3,
      },
      factCheck: {
        draft: 1,
        template: 2,
        publish: 3,
      },
      podcasts: 4,
    };
    const addInfoActions = {
      type: types.ADD_INFO,
      payload: info,
    };
    expect(actions.addInfo(info)).toEqual(addInfoActions);
  });
  it('should create actions to fetch info success', () => {
    const info = {
      categories: 4,
      tag: 2,
      article: {
        draft: 1,
        template: 2,
        publish: 3,
      },
      factCheck: {
        draft: 1,
        template: 2,
        publish: 3,
      },
      podcasts: 4,
    };
    const resp = { data: info };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.ADD_INFO,
        payload: info,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getInfo())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.INFO_API);
  });
  it('should create actions to fetch info failure', () => {
    const errorMessage = 'Error Occurred';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
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
      .dispatch(actions.getInfo())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.INFO_API);
  });
});
