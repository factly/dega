import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/googleFactChecks';
import * as types from '../../constants/googleFactChecks';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  loading: true,
};

const factCheck = {
  text: 'Video shows Russian doctors celebrating the new COVID-19 vaccine.',
  claimant: 'Facebook posts',
  claimDate: '2020-09-08T02:48:10Z',
  claimReview: [
    {
      publisher: {
        name: 'BOOM',
        site: 'boomlive.in',
      },
      url:
        'https://www.boomlive.in/world/video-from-saudi-arabia-shared-as-russian-doctors-celebrating-covid-19-vaccine-9654',
      title: 'Video From Saudi Arabia Shared As Russian Doctors Celebrating COVID-19 Vaccine',
      reviewDate: '2020-09-08T02:48:10Z',
      textualRating: 'False',
      languageCode: 'en',
    },
  ],
};

describe('google fact checks actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_GOOGLE_FACT_CHECKS_LOADING,
      payload: true,
    };
    expect(actions.loadingGoogleFactChecks()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_GOOGLE_FACT_CHECKS_LOADING,
      payload: false,
    };
    expect(actions.stopLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add google fact checks request', () => {
    const data = [{ data: [factCheck], query: { page: 1, limit: 1 }, total: 1 }];
    const addRequestAction = {
      type: types.ADD_GOOGLE_FACT_CHECKS_REQUEST,
      payload: data,
    };
    expect(actions.addRequest(data)).toEqual(addRequestAction);
  });

  it('should create actions to fetch google fact checks success', () => {
    const query = { page: 1, limit: 1, query: 'fact' };

    const resp = { data: { nodes: [factCheck], total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_GOOGLE_FACT_CHECKS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_GOOGLE_FACT_CHECKS_REQUEST,
        payload: {
          data: [factCheck],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_GOOGLE_FACT_CHECKS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getGoogleFactChecks(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.GOOGLE_FACT_CHECKS_API, {
      params: query,
    });
  });
  it('should create actions to fetch google fact checks failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_GOOGLE_FACT_CHECKS_LOADING,
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
      {
        type: types.SET_GOOGLE_FACT_CHECKS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getGoogleFactChecks(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.GOOGLE_FACT_CHECKS_API, {
      params: query,
    });
  });
});
