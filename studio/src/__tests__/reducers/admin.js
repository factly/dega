import reducer from '../../reducers/adminReducer';
import * as types from '../../constants/admin';

const initialState = {
  organisation: {},
  loading: true,
};

describe('admin reducer', () => {
  it('should return the intial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        organisation: { id: 1, organisation_id: 9, spaces: 2 },
        loading: false,
      }),
    ).toEqual({
      organisation: { id: 1, organisation_id: 9, spaces: 2 },
      loading: false,
    });
  });
  it('should handle SET_SUPER_ORGANISATIONS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_SUPER_ORGANISATIONS_LOADING,
        payload: true,
      }),
    ).toEqual({
      organisation: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_SUPER_ORGANISATIONS_LOADING,
        payload: false,
      }),
    ).toEqual({
      organisation: {},
      loading: false,
    });
  });
  it('should handle ADD_SUPER_ORGANISATION', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SUPER_ORGANISATION,
        payload: { id: 1, organisation_id: 9, spaces: 2 },
      }),
    ).toEqual({
      organisation: { id: 1, organisation_id: 9, spaces: 2 },
      loading: true,
    });
  });
});
