import {
  ADD_SPACE_REQUEST,
  ADD_SPACE_REQUESTS,
  ADD_SPACE_REQUESTS_REQUEST,
  SET_SPACE_REQUESTS_LOADING,
  RESET_SPACE_REQUESTS,
} from '../constants/spaceRequests';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function spaceRequestsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_SPACE_REQUESTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_SPACE_REQUESTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SPACE_REQUESTS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_SPACE_REQUESTS:
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
    case ADD_SPACE_REQUEST:
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
