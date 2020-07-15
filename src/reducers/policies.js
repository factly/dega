import {
  ADD_POLICY,
  ADD_POLICIES,
  ADD_POLICIES_REQUEST,
  SET_POLICIES_LOADING,
  RESET_POLICIES,
} from '../constants/policies';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function policiesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_POLICIES:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_POLICIES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_POLICIES_REQUEST:
      return {
        ...state,
        req: state.req.filter((value) => !deepEqual(value, action.payload)).concat(action.payload),
      };
    case ADD_POLICIES:
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
    case ADD_POLICY:
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
