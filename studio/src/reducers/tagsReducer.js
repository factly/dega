import {
  ADD_TAGS,
  ADD_TAGS_REQUEST,
  SET_TAGS_LOADING,
  RESET_TAGS,
  GET_TAG,
  UPDATE_TAG,
} from '../constants/tags';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function tagsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_TAGS:
      return {
        ...state,
        req: [],
        loading: true,
      };
    case SET_TAGS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_TAGS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_TAGS:
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
    case GET_TAG:
    case UPDATE_TAG:
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
