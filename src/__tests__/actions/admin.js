import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/admin';
import * as types from '../../constants/admin';
import { ORGANISATION_PERMISSIONS_API } from '../../constants/organisations';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  organisation: {},
  loading: true,
};

describe('admin actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_SUPER_ORGANISATIONS_LOADING,
      payload: true,
    };
    expect(actions.loadingOrganisationPermissions()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_SUPER_ORGANISATIONS_LOADING,
      payload: false,
    };
    expect(actions.stopOrganisationPermissionsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to getSuperOrganisation permission success', () => {
    const orgPermission = { id: 2, is_admin: true, organisation_id: 9};
    const resp = { data: orgPermission };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_SUPER_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_SUPER_ORGANISATION,
        payload: orgPermission,
      },
      {
        type: types.SET_SUPER_ORGANISATIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getSuperOrganisation())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(ORGANISATION_PERMISSIONS_API + '/my');
  });
  it('should create actions to getSuperOrganisation permission failure', () => {
    const errorMessage = 'Error Occurred';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_SUPER_ORGANISATIONS_LOADING,
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
        type: types.SET_SUPER_ORGANISATIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getSuperOrganisation())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(ORGANISATION_PERMISSIONS_API+'/my');  
  });
})