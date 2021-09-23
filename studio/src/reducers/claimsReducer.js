import {
  ADD_CLAIMS,
  ADD_CLAIMS_REQUEST,
  SET_CLAIMS_LOADING,
  RESET_CLAIMS,
  GET_CLAIM,
  UPDATE_CLAIM,
} from '../constants/claims';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function claimsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_CLAIMS:
      return {
        ...state,
        req: [],
        loading: true,
      };
    case SET_CLAIMS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_CLAIMS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_CLAIMS:
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
    case GET_CLAIM:
    case UPDATE_CLAIM:
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
