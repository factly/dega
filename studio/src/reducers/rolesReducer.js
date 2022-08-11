import {
  ADD_ROLES,
  ADD_ROLES_REQUEST,
  SET_ROLES_LOADING,
  RESET_ROLES,
  GET_ROLE,
  UPDATE_ROLE,
} from '../constants/roles';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function rolesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_ROLES:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_ROLES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ROLES_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_ROLES:
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
    case GET_ROLE:
    case UPDATE_ROLE:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    default:
      return state;
  }
}
