import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/permissions';
import * as types from '../../constants/permissions';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('permissions actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_PERMISSIONS_LOADING,
      payload: true,
    };
    expect(actions.loadingPermissions()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_PERMISSIONS_LOADING,
      payload: false,
    };
    expect(actions.stopLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add permissions request', () => {
    const data = [1, 2];
    const addPermissionsRequestAction = {
      type: types.ADD_PERMISSIONS_REQUEST,
      payload: data,
    };
    expect(actions.addRequest(data)).toEqual(addPermissionsRequestAction);
  });

  it('should create actions to get permission by id success', () => {
    const id = 1;
    const permission = [{ resource: 'posts', actions: ['create'] }];
    const resp = { data: permission };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_PERMISSIONS,
        payload: { data: permission, user_id: 1 },
      },
      {
        type: types.ADD_PERMISSIONS_REQUEST,
        payload: [1],
      },
      {
        type: types.SET_PERMISSIONS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPermissions(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PERMISSIONS_API + id + '/permissions');
  });
  it('should create actions to get permission by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PERMISSIONS_LOADING,
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
      .dispatch(actions.getPermissions(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PERMISSIONS_API + id + '/permissions');
  });
});
