import {
  ADD_EVENT,
  ADD_EVENTS,
  ADD_EVENTS_REQUEST,
  RESET_EVENTS,
  SET_EVENTS_LOADING,
} from '../constants/events';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};
export default function eventsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_EVENTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_EVENTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_EVENTS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_EVENTS:
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
    case ADD_EVENT:
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
