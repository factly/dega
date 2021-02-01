import { COLLAPSE, EXPAND } from './../constants/sidebar';

export const setCollapse = () => {
  return (dispatch) => {
    dispatch({
      type: COLLAPSE,
    });
  };
};

export const setExpand = () => {
  return (dispatch) => {
    dispatch({
      type: EXPAND,
    });
  };
};
