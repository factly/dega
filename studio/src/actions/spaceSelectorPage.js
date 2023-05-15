import { SET_VISIBLE } from './../constants/spaceSelectorPage';

export const setSpaceSelectorPage = (visible) => {
  return (dispatch) => {
    dispatch({
      type: SET_VISIBLE,
      payload: visible,
    });
  };
};
