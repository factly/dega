import { ADD_USERS_REQUEST, SET_USERS_LOADING } from '../constants/users';

const initialState = {
  details: [],
  loading: true,
};

export default function usersReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_USERS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_USERS_REQUEST:
      return {
        ...state,
        details: action.payload.data,
      };
    default:
      return state;
  }
}
