import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../actions/search';
import * as types from '../../constants/search';
import { ADD_NOTIFICATION } from '../../constants/notifications';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);
const initialState = {
  req: [],
  details: {
    articles: [],
    'fact-checks': [],
    pages: [],
    claims: [],
    tags: [],
    categories: [],
    media: [],
    ratings: [],
    total: 0,
  },
  loading: true,
};

describe('search actions', () => {
  it('should create actions to fetch search details success', () => {
    const query = { page: 1, limit: 5 };
    const resp = {
      data: [
        { name: 'new claim', kind: 'claim' },
        { name: 'new media', kind: 'medium' },
      ],
    };
    axios.post.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_SEARCH_DETAILS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_SEARCH_DETAIL,
        payload: {
          data: [
            { name: 'new claim', kind: 'claim' },
            { name: 'new media', kind: 'medium' },
          ],
          formats: { 0: { slug: 'article' } },
        },
      },
      {
        type: types.SET_SEARCH_DETAILS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ ...initialState, formats: { details: { 0: { slug: 'article' } } } });
    store
      .dispatch(actions.getSearchDetails(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.SEARCH_DETAILS_API, query);
  });

  it('should create actions to fetch search details failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'search failed';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_SEARCH_DETAILS_LOADING,
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
        type: types.SET_SEARCH_DETAILS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ ...initialState, formats: { details: { 0: { slug: 'article' } } } });
    store
      .dispatch(actions.getSearchDetails(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.SEARCH_DETAILS_API, query);
  });
});
