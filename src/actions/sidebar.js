import { SET_COLLAPSE } from '../constants/sidebar';
export const setCollapse = (collapsed) => {
  return (dispatch) => {
    dispatch({
      type: SET_COLLAPSE,
      payload: collapsed,
    });
  };
};
