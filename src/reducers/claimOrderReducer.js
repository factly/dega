import { SET_CLAIMORDER, GET_CLAIMORDER, RESET_CLAIMORDER } from '../constants/claimOrder';

const initialState = {
  order: [],
};

export default function claimOrderReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_CLAIMORDER:
      return {
        order: [],
      };
    case SET_CLAIMORDER:
      return {
        order: action.payload,
      };
     default:
       return state; 
  }
}
