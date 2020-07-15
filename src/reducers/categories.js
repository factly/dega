import {
  ADD_CATEGORY,
  ADD_CATEGORIES,
  ADD_CATEGORIES_REQUEST,
  SET_CATEGORIES_LOADING,
  RESET_CATEGORIES,
} from '../constants/categories';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function categoriesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_CATEGORIES:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_CATEGORIES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_CATEGORIES_REQUEST:
      return {
        ...state,
        req: state.req.filter((value) => !deepEqual(value, action.payload)).concat(action.payload),
      };
    case ADD_CATEGORIES:
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
    case ADD_CATEGORY:
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
