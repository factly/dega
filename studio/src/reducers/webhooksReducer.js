import {
  ADD_WEBHOOK,
  ADD_WEBHOOKS,
  ADD_WEBHOOKS_REQUEST,
  SET_WEBHOOKS_LOADING,
  RESET_WEBHOOKS,
} from '../constants/webhooks';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function webhooksReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_WEBHOOKS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_WEBHOOKS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_WEBHOOKS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_WEBHOOKS:
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
    case ADD_WEBHOOK:
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
