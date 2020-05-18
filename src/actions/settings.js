import { TOGGLE_SIDER } from './types';

export const toggleSider = () => {
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_SIDER,
    });
  };
};
