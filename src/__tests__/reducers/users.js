import reducer from '../../reducers/usersReducer';
import * as types from '../../constants/users';

const initialState = {
  details: [],
  loading: true,
};

const user = {
  id: 1,
  created_at: '2020-09-23T06:11:01.39323Z',
  updated_at: '2020-09-25T12:32:46.395603Z',
  deleted_at: null,
  email: 'ross@friends.in',
  first_name: 'Ross',
  last_name: 'Geller',
  birth_date: '2020-09-02T18:02:41+05:30',
  gender: 'male',
  policies: [
    {
      id: 'admin',
      name: 'admin',
      description: '',
    },
  ],
};

describe('user reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        details: [user],
        loading: false,
      }),
    ).toEqual({
      details: [user],
      loading: false,
    });
  });
  it('should handle SET_USERS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_USERS_LOADING,
        payload: true,
      }),
    ).toEqual({
      details: [],
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_USERS_LOADING,
        payload: false,
      }),
    ).toEqual({
      details: [],
      loading: false,
    });
  });
  it('should handle ADD_USERS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_USERS_REQUEST,
        payload: {
          data: [user],
        },
      }),
    ).toEqual({
      details: [user],
      loading: true,
    });
  });
});
