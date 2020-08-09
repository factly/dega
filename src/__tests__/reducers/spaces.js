import reducer from '../../reducers/spaces';
import * as types from '../../constants/spaces';

const initialState = {
  orgs: [],
  details: {},
  loading: true,
  selected: 0,
};

const space = { id: 1, organazation: 'Organization 1', spaces: [{ id: 11, name: 'Space 11' }] };
const space2 = {
  id: 2,
  organazation: 'Organization 2',
  spaces: [
    { id: 21, name: 'Space 21' },
    { id: 22, name: 'Space 22' },
  ],
};

describe('spaces reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(reducer(initialState, { type: 'NON_EXISTING', payload: {} })).toEqual(initialState);
  });
  it('should return the state when payload is empty', () => {
    expect(reducer(initialState, { type: types.SET_SELECTED_SPACE })).toEqual(initialState);
  });
  it('should return the state when action is empty', () => {
    expect(reducer(initialState)).toEqual(initialState);
  });
  it('should handle LOADING_SPACES', () => {
    expect(
      reducer(initialState, {
        type: types.LOADING_SPACES,
      }),
    ).toEqual({
      orgs: [],
      details: {},
      loading: true,
      selected: 0,
    });
  });
  it('should handle GET_SPACES_SUCCESS', () => {
    expect(
      reducer(initialState, {
        type: types.GET_SPACES_SUCCESS,
        payload: [space, space2],
      }),
    ).toEqual({
      orgs: [
        { id: 1, organazation: 'Organization 1', spaces: [11] },
        { id: 2, organazation: 'Organization 2', spaces: [21, 22] },
      ],
      details: {
        11: { id: 11, name: 'Space 11' },
        21: { id: 21, name: 'Space 21' },
        22: { id: 22, name: 'Space 22' },
      },
      loading: false,
      selected: 11,
    });
  });
  it('should handle empty payload GET_SPACES_SUCCESS', () => {
    expect(
      reducer(initialState, {
        type: types.GET_SPACES_SUCCESS,
        payload: [],
      }),
    ).toEqual({
      orgs: [],
      details: {},
      loading: false,
      selected: 0,
    });
  });
  it('should handle GET_SPACES_SUCCESS when spaces in payload does not exists in state', () => {
    expect(
      reducer(
        {
          orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
        {
          type: types.GET_SPACES_SUCCESS,
          payload: [space2],
        },
      ),
    ).toEqual({
      orgs: [{ id: 2, organazation: 'Organization 2', spaces: [21, 22] }],
      details: {
        21: { id: 21, name: 'Space 21' },
        22: { id: 22, name: 'Space 22' },
      },
      loading: false,
      selected: 21,
    });
  });
  it('should handle GET_SPACES_SUCCESS when some spaces in payload already exists in state', () => {
    expect(
      reducer(
        {
          orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
        {
          type: types.GET_SPACES_SUCCESS,
          payload: [space, space2],
        },
      ),
    ).toEqual({
      orgs: [
        { id: 1, organazation: 'Organization 1', spaces: [11] },
        { id: 2, organazation: 'Organization 2', spaces: [21, 22] },
      ],
      details: {
        11: { id: 11, name: 'Space 11' },
        21: { id: 21, name: 'Space 21' },
        22: { id: 22, name: 'Space 22' },
      },
      loading: false,
      selected: 11,
    });
  });
  it('should handle ADD_SPACE_SUCCESS', () => {
    expect(
      reducer(
        {
          orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
        {
          type: types.ADD_SPACE_SUCCESS,
          payload: {
            id: 12,
            name: 'Space 12',
            organisation_id: 1,
          },
        },
      ),
    ).toEqual({
      orgs: [{ id: 1, organazation: 'Organization 1', spaces: [12, 11] }],
      details: {
        11: { id: 11, name: 'Space 11' },
        12: { id: 12, name: 'Space 12', organisation_id: 1 },
      },
      loading: false,
      selected: 12,
    });
  });
  it('should handle SET_SELECTED_SPACE', () => {
    expect(
      reducer(initialState, {
        type: types.SET_SELECTED_SPACE,
        payload: 1,
      }),
    ).toEqual({
      orgs: [],
      details: {},
      loading: true,
      selected: 1,
    });
  });
  it('should handle UPDATE_SPACE_SUCCESS', () => {
    expect(
      reducer(
        {
          orgs: [],
          details: { 1: { id: 1, name: 'existing space' } },
          loading: false,
          selected: 1,
        },
        {
          type: types.UPDATE_SPACE_SUCCESS,
          payload: { id: 1, name: 'updated space' },
        },
      ),
    ).toEqual({
      orgs: [],
      details: {
        1: { id: 1, name: 'updated space' },
      },
      loading: false,
      selected: 1,
    });
  });
  it('should handle DELETE_SPACE_SUCCESS', () => {
    expect(
      reducer(
        {
          orgs: [],
          details: {
            1: { id: 1, name: 'existing space' },
          },
          loading: false,
          selected: 1,
        },
        {
          type: types.DELETE_SPACE_SUCCESS,
          payload: 1,
        },
      ),
    ).toEqual({
      orgs: [],
      details: {},
      loading: true,
      selected: 0,
    });
  });
});
