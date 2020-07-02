import { TOGGLE_SIDER } from '../constants/settings';

export const toggleSider = () => {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_SIDER,
    });
  };
};
