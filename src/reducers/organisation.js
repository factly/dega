import { GET_ORGANISATIONS, GET_ORGANISATIONS_SUCCESS } from '../actions/types';

const initialState = {};

export default function organisationReducer(state = initialState, action = {}) {
  switch (action.type) {
    case GET_ORGANISATIONS_SUCCESS:
      return {
        ...state,
      };
    default:
      return state;
  }
}
