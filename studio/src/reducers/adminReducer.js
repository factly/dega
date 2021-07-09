import { ADD_SUPER_ORGANISATION, SET_SUPER_ORGANISATIONS_LOADING } from '../constants/admin';

const initialState = {
  organisation: {},
  loading: true,
};

export default function adminReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_SUPER_ORGANISATIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ADD_SUPER_ORGANISATION:
      return {
        ...state,
        organisation: action.payload,
      };
    default:
      return state;
  }
}
