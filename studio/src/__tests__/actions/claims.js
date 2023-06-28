import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/claims';
import * as types from '../../constants/claims';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_MEDIA } from '../../constants/media';
import { ADD_RATINGS } from '../../constants/ratings';
import { ADD_CLAIMANTS } from '../../constants/claimants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  req: [],
  details: {},
  loading: true,
};

const claim_without_id = {
  name: 'Claim 1',
  claimant: { id: 11, name: 'Claimant 1', medium: { id: 21, name: 'Medium-Claimant 1' } },
  rating: { id: 100, name: 'Rating 1', medium: { id: 110, name: 'Medium-Rating 1' } },
};
const claim = {
  id: 1,
  ...claim_without_id,
};
const { claimant, rating, ...claim_without_claimant_and_rating } = claim;

const claim2 = {
  id: 2,
  name: 'Claim 2',
  claimant: { id: 12, name: 'Claimant 2', medium: { id: 22, name: 'Medium-Claimant 2' } },
  rating: { id: 200, name: 'Rating 2', medium: { id: 220, name: 'Medium-Rating 2' } },
};
const { claimant: claimant2, rating: rating2, ...claim_without_claimant_and_rating2 } = claim2;

const claim3 = {
  id: 3,
  name: 'New Claim',
  claimant: {
    id: 13, name: 'Claimant 3', medium: {
      id: 23, name: 'Medium-Claimant 3'
    }, description: { "hello": "test" },
    description_html: "<h1>hello test</h1>"
  },
  rating: { id: 300, name: 'Rating 3', medium: { id: 320, name: 'Medium-Rating 3' }, description: { "hello": "test" }, description_html: "<h1>hello test</h1>" },
  description: { "hello": "test" },
  description_html: "<h1>hello test</h1>"
};

describe('claims actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_CLAIMS_LOADING,
      payload: true,
    };
    expect(actions.loadingClaims()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_CLAIMS_LOADING,
      payload: false,
    };
    expect(actions.stopClaimsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add claims list', () => {
    const data = [claim, claim2];

    const addClaimsAction = {
      type: types.ADD_CLAIMS,
      payload: data,
    };
    expect(actions.addClaimsList(data)).toEqual(addClaimsAction);
  });
  it('should create an action to add claims request', () => {
    const data = [{ query: 'query' }];
    const addClaimsRequestAction = {
      type: types.ADD_CLAIMS_REQUEST,
      payload: data,
    };
    expect(actions.addClaimsRequest(data)).toEqual(addClaimsRequestAction);
  });
  it('should create an action to reset claims', () => {
    const resetClaimsRequestAction = {
      type: types.RESET_CLAIMS,
    };
    expect(actions.resetClaims()).toEqual(resetClaimsRequestAction);
  });
  it('should create actions to fetch claims success', () => {
    const query = {
      page: 1,
      limit: 5,
      rating: [100],
      claimant: [11],
      q: 'claimant',
      sort: 'asc',
    };
    const claims = [{ ...claim }]
    const resp = { data: { nodes: claims, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 21, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 11, name: 'Claimant 1', medium: 21, description: { json: undefined, html: undefined } }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 110, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 100, name: 'Rating 1', medium: 110, description: { json: undefined, html: undefined } }],
      },
      {
        type: types.ADD_CLAIMS,
        payload: [{ id: 1, name: 'Claim 1', claimant: 11, description: { json: undefined, html: undefined }, rating: 100 }],
      },
      {
        type: types.ADD_CLAIMS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      },
    ];

    const params = new URLSearchParams('claimant=11&rating=100&page=1&limit=5&sort=asc&q=claimant');
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaims(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API, {
      params: params,
    });
  });
  it('should create actions to fetch claims list without page and limit', () => {
    const query = { q: 'New' };
    const claims = [claim3];
    const resp = { data: { nodes: claims, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 23, name: 'Medium-Claimant 3' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 13, name: 'Claimant 3', medium: 23, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" } }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 320, name: 'Medium-Rating 3' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 300, name: 'Rating 3', medium: 320, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" } }],
      },
      {
        type: types.ADD_CLAIMS,
        payload: [{ id: 3, name: 'New Claim', claimant: 13, rating: 300, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" } }],
      },
      {
        type: types.ADD_CLAIMS_REQUEST,
        payload: {
          data: [3],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      },
    ];
    const params = new URLSearchParams('q=New');
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaims(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API, {
      params: params,
    });
  });
  it('should create actions to fetch claims list without claimants and ratings', () => {
    const query = { page: 1, limit: 5 };
    const claims = [claim_without_claimant_and_rating, claim_without_claimant_and_rating2];
    const resp = { data: { nodes: claims, total: 2 } };
    axios.get.mockResolvedValue(resp);

    const store = mockStore({ initialState });
    const params = new URLSearchParams('page=1&limit=5');

    store.dispatch(actions.getClaims(query)).catch((err) => expect(err).toBeInstanceOf(TypeError));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API, {
      params: params,
    });
  });
  it('should create actions to fetch claims list with claimants but not ratings', () => {
    const query = { page: 1, limit: 5 };
    const claims = [
      { ...claim_without_claimant_and_rating, claimant },
      { ...claim_without_claimant_and_rating2, claimant2 },
    ];
    const resp = { data: { nodes: claims, total: 2 } };
    axios.get.mockResolvedValue(resp);

    const store = mockStore({ initialState });
    const params = new URLSearchParams('page=1&limit=5');

    store.dispatch(actions.getClaims(query)).catch((err) => expect(err).toBeInstanceOf(TypeError));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API, {
      params: params,
    });
  });
  it('should create actions to fetch claims list with ratings but not claimants', () => {
    const query = { page: 1, limit: 5 };
    const claims = [
      { ...claim_without_claimant_and_rating, rating },
      { ...claim_without_claimant_and_rating2, rating2 },
    ];
    const resp = { data: { nodes: claims, total: 2 } };
    axios.get.mockResolvedValue(resp);

    const store = mockStore({ initialState });
    const params = new URLSearchParams('page=1&limit=5');

    store.dispatch(actions.getClaims(query)).catch((err) => expect(err).toBeInstanceOf(TypeError));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API, {
      params: params,
    });
  });
  it('should create actions to fetch claims failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
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
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    const params = new URLSearchParams('page=1&limit=5');
    store
      .dispatch(actions.getClaims(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API, {
      params: params,
    });
  });
  it('should create actions to get claim by id success', () => {
    const id = 1;
    const claim = {
      id: 1,
      name: 'Claim 1',
      claimant: { id: 11, name: 'Claimant 1', medium: { id: 21, name: 'Medium-Claimant 1' }, description: { "hello": "test" }, description_html: "<h1>hello test</h1>" },
      rating: { id: 300, name: 'Rating 3', medium: { id: 320, name: 'Medium-Rating 3' }, description: { "hello": "test" }, description_html: "<h1>hello test</h1>" },
      description: { "hello": "test" },
      description_html: "<h1>hello test</h1>",
    };
    const resp = { data: claim };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 21, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 11, name: 'Claimant 1', medium: 21, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" } }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 320, name: 'Medium-Rating 3' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 300, name: 'Rating 3', medium: 320, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" } }],
      },
      {
        type: types.GET_CLAIM,
        payload: { id: 1, name: 'Claim 1', claimant: 11, rating: 300, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" } },
      },
      {
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaim(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API + '/' + id);
  });
  it('should create actions to get claim by id without claimant and rating', () => {
    const id = 1;
    const resp = { data: claim };
    axios.get.mockResolvedValue(resp);

    const store = mockStore({ initialState });

    store.dispatch(actions.getClaim(id)).catch((err) => expect(err).toBeInstanceOf(TypeError));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API + '/' + id);
  });
  it('should create actions to get claim by id with claimant but not rating', () => {
    const claim = { ...claim_without_claimant_and_rating, claimant };
    const id = 1;
    const resp = { data: claim };
    axios.get.mockResolvedValue(resp);

    const store = mockStore({ initialState });

    store.dispatch(actions.getClaim(id)).catch((err) => expect(err).toBeInstanceOf(TypeError));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API + '/' + id);
  });
  it('should create actions to get claim by id with rating but not claimant', () => {
    const claim = { ...claim_without_claimant_and_rating, rating };
    const id = 1;
    const resp = { data: claim };
    axios.get.mockResolvedValue(resp);

    const store = mockStore({ initialState });

    store.dispatch(actions.getClaim(id)).catch((err) => expect(err).toBeInstanceOf(TypeError));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API + '/' + id);
  });
  it('should create actions to get claim by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
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
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaim(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMS_API + '/' + id);
  });
  it('should create actions to create claim success', () => {
    const claim = {
      id: 1,
      name: 'Claim 1',
      claimant: { id: 11, name: 'Claimant 1', medium: { id: 21, name: 'Medium-Claimant 1' }, description: { "hello": "test" }, description_html: "<h1>hello test</h1>" },
      rating: { id: 300, name: 'Rating 3', medium: { id: 320, name: 'Medium-Rating 3' }, description: { "hello": "test" }, description_html: "<h1>hello test</h1>" },
      description: { "hello": "test" },
      description_html: "<h1>hello test</h1>",
    };

    const resp = { data: claim };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 21, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 11, name: 'Claimant 1', medium: 21, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" } }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 320, name: 'Medium-Rating 3' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 300, name: 'Rating 3', medium: 320, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" } }],
      },
      {
        type: types.RESET_CLAIMS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claim created',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.createClaim(claim_without_id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.CLAIMS_API, claim_without_id);
  });
  it('should create actions to create claim failure', () => {
    const errorMessage = 'Failed to create claim';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
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
      .dispatch(actions.createClaim(claim))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.CLAIMS_API, claim);
  });
  it('should create actions to update claim success with claim and rating', () => {
    let claim = {
      id: 1,
      description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" },
      name: 'Claim 1',
      claimant: { id: 11, name: 'Claimant 1', medium: { id: 21, name: 'Medium-Claimant 1' } },
      rating: { id: 100, name: 'Rating 1', medium: { id: 110, name: 'Medium-Rating 1' } },
    };
    const resp = { data: claim };
    axios.put.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 21, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 11, name: 'Claimant 1', medium: 21, description: { json: undefined, html: undefined } }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 110, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 100, name: 'Rating 1', medium: 110, description: { json: undefined, html: undefined } }],
      },
      {
        type: types.UPDATE_CLAIM,
        payload: { id: 1, name: 'Claim 1', claimant: 11, rating: 100, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" }, },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claim updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaim(claim))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMS_API + '/1', claim);
  });

  it('should create actions to update claim success with claim and rating', () => {
    let claim = {
      id: 1,
      description: { "hello": "test" },
      description_html: "<h1>hello test</h1>",
      name: 'Claim 1',
      claimant: { id: 11, name: 'Claimant 1', medium: { id: 21, name: 'Medium-Claimant 1' } },
      rating: { id: 100, name: 'Rating 1', medium: { id: 110, name: 'Medium-Rating 1' } },
    };
    const resp = { data: claim };
    axios.put.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 21, name: 'Medium-Claimant 1' }],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [{ id: 11, name: 'Claimant 1', medium: 21, description: { json: undefined, html: undefined } }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 110, name: 'Medium-Rating 1' }],
      },
      {
        type: ADD_RATINGS,
        payload: [{ id: 100, name: 'Rating 1', medium: 110, description: { json: undefined, html: undefined } }],
      },
      {
        type: types.UPDATE_CLAIM,
        payload: { id: 1, name: 'Claim 1', claimant: 11, rating: 100, description: { json: { "hello": "test" }, html: "<h1>hello test</h1>" }, },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claim updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaim(claim))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMS_API + '/1', claim);
  });

  it('should create actions to update claim without claimant and rating', () => {
    const store = mockStore({ initialState });

    try {
      store.dispatch(actions.updateClaim(claim_without_claimant_and_rating));
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });
  it('should create actions to update claim with claimant but not rating', () => {
    const claim = { ...claim_without_claimant_and_rating, claimant };

    const store = mockStore({ initialState });

    try {
      store.dispatch(actions.updateClaim(claim));
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });
  it('should create actions to update claim with rating but not claimant', () => {
    const claim = { ...claim_without_claimant_and_rating, rating };

    const store = mockStore({ initialState });

    try {
      store.dispatch(actions.updateClaim(claim));
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });
  it('should create actions to update claim failure', () => {
    const errorMessage = 'Failed to update claim';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
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
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaim(claim))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMS_API + '/1', claim);
  });
  it('should create actions to delete claim success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_CLAIMS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claim deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteClaim(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.CLAIMS_API + '/1');
  });
  it('should create actions to delete claim failure', () => {
    const errorMessage = 'Failed to delete claim';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMS_LOADING,
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
      .dispatch(actions.deleteClaim(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.CLAIMS_API + '/1');
  });
  it('should create actions to add claims list without claimants and ratings', () => {
    const claims = [claim_without_claimant_and_rating, claim_without_claimant_and_rating2];

    const store = mockStore({ initialState });

    try {
      store.dispatch(actions.addClaims(claims));
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });
  it('should create actions to add claims list with claimants but not ratings', () => {
    const claims = [
      { ...claim_without_claimant_and_rating, claimant },
      { ...claim_without_claimant_and_rating2, claimant2 },
    ];

    const store = mockStore({ initialState });

    try {
      store.dispatch(actions.addClaims(claims));
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });
  it('should create actions to add claims list with ratings but not claimants', () => {
    const claims = [
      { ...claim_without_claimant_and_rating, rating },
      { ...claim_without_claimant_and_rating2, rating2 },
    ];

    const store = mockStore({ initialState });

    try {
      store.dispatch(actions.addClaims(claims));
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });
  it('should create actions to add claims list with claimants and ratings', () => {
    const local_claim1 = {
      id: 1,
      name: 'Claim 1',
      claimant: { id: 11, name: 'Claimant 1', medium: { id: 21, name: 'Medium-Claimant 1' }, description: { "hello": "test" }, description_html: "<p>hello</p>" },
      rating: { id: 100, name: 'Rating 1', medium: { id: 110, name: 'Medium-Rating 1' } },
    };

    const local_claim2 = {
      id: 2,
      name: 'Claim 2',
      claimant: { id: 12, name: 'Claimant 2', medium: { id: 22, name: 'Medium-Claimant 2' } },
      rating: { id: 200, name: 'Rating 2', medium: { id: 220, name: 'Medium-Rating 2' }, description: { "hello": "test" }, description_html: "<p>hello</p>" },
    };

    const claims = [local_claim1, local_claim2]

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [
          { id: 21, name: 'Medium-Claimant 1' },
          { id: 22, name: 'Medium-Claimant 2' },
        ],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [
          {
            id: 11, name: 'Claimant 1', medium: 21,
            description: {
              json: { "hello": "test" }, html: "<p>hello</p>"
            }
          },
          {
            id: 12, name: 'Claimant 2', medium: 22,
            description: {
              json: undefined, html: undefined
            }
          },
        ],
      },
      {
        type: ADD_MEDIA,
        payload: [
          { id: 110, name: 'Medium-Rating 1' },
          { id: 220, name: 'Medium-Rating 2' },
        ],
      },
      {
        type: ADD_RATINGS,
        payload: [
          {
            id: 100, name: 'Rating 1', medium: 110,
            description: { json: undefined, html: undefined }
          },
          {
            id: 200, name: 'Rating 2', medium: 220,
            description: { json: { "hello": "test" }, html: "<p>hello</p>" }
          },
        ],
      },
      {
        type: types.ADD_CLAIMS,
        payload: [
          { id: 1, name: 'Claim 1', claimant: 11, rating: 100 },
          { id: 2, name: 'Claim 2', claimant: 12, rating: 200 },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addClaims(claims));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add empty claims list', () => {
    const claims = [];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_CLAIMANTS,
        payload: [],
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: ADD_RATINGS,
        payload: [],
      },
      {
        type: types.ADD_CLAIMS,
        payload: [],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addClaims(claims));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
