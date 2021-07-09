import reducer from '../../reducers/redirectReducer';
import * as types from '../../constants/settings';

const initialState = {
  code: 200,
};

describe('redirect reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        code: 200,
      }),
    ).toEqual({
      code: 200,
    });
  });
  it('should set SET_REDIRECT', () => {
    expect(
      reducer(initialState, {
        type: types.SET_REDIRECT,
        payload: 300,
      }),
    ).toEqual({
      code: 300,
    });
  });
});
