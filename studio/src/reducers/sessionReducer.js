import { SET_SESSIONS_LOADING, ADD_SESSION } from '../constants/session';

const initialState = {
  details: {},
  loading: true,
};

export default function sessionReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_SESSIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SESSION:
      return {
        ...state,
        details: {
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
