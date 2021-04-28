import { SET_CLAIMORDER, GET_CLAIMORDER, RESET_CLAIMORDER } from '../constants/claimOrder';

export const setClaimOrder = (claimOrder) => {
  return (dispatch) => {
    dispatch({
      type: SET_CLAIMORDER,
      payload: claimOrder,
    });
  };
};
export const resetClaimOrder = () => ({
  type: RESET_CLAIMORDER,
});
