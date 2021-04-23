import reducer from '../../reducers/sidebarReducer';
import * as types from '../../constants/sidebar';

const initialState = {
  collapsed: false,
};

describe('Sidebar reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        collapsed: false,
      }),
    ).toEqual({
      collapsed: false,
    });
  });
  it('should handle SET_COLLAPSE', () => {
    expect(
      reducer(initialState, {
        type: types.SET_COLLAPSE,
        payload: true,
      }),
    ).toEqual({
      collapsed: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_COLLAPSE,
        payload: false,
      }),
    ).toEqual({
      collapsed: false,
    });
  });
});
