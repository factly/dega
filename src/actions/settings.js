import { TOGGLE_SIDER } from '../constants/settings';

export const toggleSider = () => {
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_SIDER,
    });
  };
};
