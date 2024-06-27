import deepEqual from 'deep-equal';
import { ADD_USERS, ADD_USERS_REQUEST, SET_USERS_LOADING } from '../constants/users';

const initialState = {
  req: [],
  details: {},
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
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_USERS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
        },
      };
    default:
      return state;
  }
}
