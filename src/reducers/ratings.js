import {
  ADD_RATING,
  ADD_RATINGS,
  ADD_RATINGS_REQUEST,
  SET_RATINGS_LOADING,
  RESET_RATINGS,
} from '../constants/ratings';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function ratingsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_RATINGS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_RATINGS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_RATINGS_REQUEST:
      return {
        ...state,
        req: state.req.filter((value) => !deepEqual(value, action.payload)).concat(action.payload),
      };
    case ADD_RATINGS:
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
    case ADD_RATING:
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
