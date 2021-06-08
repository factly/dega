import {
  ADD_PAGE,
  ADD_PAGES,
  ADD_PAGES_REQUEST,
  RESET_PAGES,
  SET_PAGES_LOADING,
  RECENT_PAGE,
} from '../constants/pages';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
  recent: {},
};

export default function pagesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_PAGES:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_PAGES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_PAGES_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_PAGES:
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
    case ADD_PAGE:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case RECENT_PAGE:
      return {
        ...state,
        recent: {
          ...state.recent,
          data: action.payload,
        },
      };
    default:
      return state;
  }
}
