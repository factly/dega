import reducer from '../../reducers/profileReducer';
import * as types from '../../constants/profile';

const initialState = {
  details: {},
  loading: true,
};

describe('profile reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        details: { 1: { id: 1, email: 'abc@gmail.com', first_name: 'abc' } },
        loading: false,
      }),
    ).toEqual({
      details: { 1: { id: 1, email: 'abc@gmail.com', first_name: 'abc' } },
      loading: false,
    });
  });
  it('should handle SET_PROFILE_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      }),
    ).toEqual({
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_PROFILE_LOADING,
        payload: false,
      }),
    ).toEqual({
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_PROFILE', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PROFILE,
        payload: { id: 1, email: 'abc@gmail.com', first_name: 'abc' },
      }),
    ).toEqual({
      details: { id: 1, email: 'abc@gmail.com', first_name: 'abc' },
      loading: true,
    });
  });
  it('should handle ADD_PROFILE when already exists', () => {
    expect(
      reducer(
        {
          details: {
            id: 1,
            email: 'abc@gmail.com',
            first_name: 'abc',
          },
          loading: false,
        },
        {
          type: types.ADD_PROFILE,
          payload: { id: 1, email: 'querty@gmail.com', first_name: 'abc' },
        },
      ),
    ).toEqual({
      details: {
        id: 1,
        email: 'querty@gmail.com',
        first_name: 'abc',
      },
      loading: false,
    });
  });
});
