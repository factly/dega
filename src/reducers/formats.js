import {
  ADD_FORMAT,
  ADD_FORMATS,
  ADD_FORMATS_REQUEST,
  SET_FORMATS_LOADING,
  RESET_FORMATS,
} from '../constants/formats';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function formatsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_FORMATS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_FORMATS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_FORMATS_REQUEST:
      return {
        ...state,
        req: state.req.filter((value) => !deepEqual(value, action.payload)).concat(action.payload),
      };
    case ADD_FORMATS:
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
    case ADD_FORMAT:
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
