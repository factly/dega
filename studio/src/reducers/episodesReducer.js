import {
  ADD_EPISODES,
  ADD_EPISODES_REQUEST,
  SET_EPISODES_LOADING,
  RESET_EPISODES,
  GET_EPISODE,
  UPDATE_EPISODE,
} from '../constants/episodes';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function episodesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_EPISODES:
      return {
        ...state,
        req: [],
        loading: true,
      };
    case SET_EPISODES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_EPISODES_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_EPISODES:
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
    case GET_EPISODE:
    case UPDATE_EPISODE:
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
