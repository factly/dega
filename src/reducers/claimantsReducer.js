import {
  ADD_CLAIMANT,
  ADD_CLAIMANTS,
  ADD_CLAIMANTS_REQUEST,
  SET_CLAIMANTS_LOADING,
  RESET_CLAIMANTS,
} from '../constants/claimants';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function claimantsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_CLAIMANTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_CLAIMANTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_CLAIMANTS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_CLAIMANTS:
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
    case ADD_CLAIMANT:
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
