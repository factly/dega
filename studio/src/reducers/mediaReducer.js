import {
  ADD_MEDIA,
  ADD_MEDIA_REQUEST,
  SET_MEDIA_LOADING,
  RESET_MEDIA,
  GET_MEDIUM,
  UPDATE_MEDIUM,
} from '../constants/media';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function mediaReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_MEDIA:
      return {
        ...state,
        req: [],
        loading: true,
      };
    case SET_MEDIA_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_MEDIA_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_MEDIA:
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
    case GET_MEDIUM:
    case UPDATE_MEDIUM:
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
