import {
  ADD_POST,
  ADD_POSTS,
  ADD_POSTS_REQUEST,
  SET_POSTS_LOADING,
  RESET_POSTS,
} from '../constants/posts';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function postsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_POSTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_POSTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_POSTS_REQUEST:
      return {
        ...state,
        req: state.req.filter((value) => !deepEqual(value, action.payload)).concat(action.payload),
      };
    case ADD_POSTS:
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
    case ADD_POST:
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
