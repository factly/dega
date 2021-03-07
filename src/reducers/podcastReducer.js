import {
  ADD_PODCAST,
  ADD_PODCASTS,
  ADD_PODCASTS_REQUEST,
  SET_PODCASTS_LOADING,
  RESET_PODCASTS,
} from '../constants/podcasts';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function podcastsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_PODCASTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_PODCASTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_PODCASTS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_PODCASTS:
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
    case ADD_PODCAST:
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
