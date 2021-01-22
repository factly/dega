import {
  ADD_MENU,
  ADD_MENUS,
  ADD_MENUS_REQUEST,
  SET_MENUS_LOADING,
  RESET_MENUS,
} from '../constants/menu';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function menuReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_MENUS:
      return {
        ...state,
        req : [],
        details: {},
        loading: true,
      };
    case SET_MENUS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_MENUS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_MENUS:
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
    case ADD_MENU:
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