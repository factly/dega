import { SET_PROFILE_LOADING, ADD_PROFILE } from '../constants/profile';

const initialState = {
  details: {},
  loading: true,
};

export default function profileReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PROFILE_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_PROFILE:
      return {
        ...state,
        details: action.payload,
      };
    default:
      return state;
  }
}
