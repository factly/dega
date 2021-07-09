import {
  ADD_ORGANISATION_REQUEST,
  ADD_ORGANISATION_REQUESTS,
  ADD_ORGANISATION_REQUESTS_REQUEST,
  SET_ORGANISATION_REQUESTS_LOADING,
  RESET_ORGANISATION_REQUESTS,
} from '../constants/organisationRequests';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function organisationRequestsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_ORGANISATION_REQUESTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_ORGANISATION_REQUESTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ORGANISATION_REQUESTS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_ORGANISATION_REQUESTS:
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
    case ADD_ORGANISATION_REQUEST:
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
