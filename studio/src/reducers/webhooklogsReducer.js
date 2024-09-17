import {
  ADD_WEBHOOKLOGS,
  ADD_WEBHOOKLOGS_REQUEST,
  SET_WEBHOOKLOGS_LOADING,
  RESET_WEBHOOKLOGS,
} from '../constants/webhooklogs';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function webhooklogsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_WEBHOOKLOGS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_WEBHOOKLOGS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_WEBHOOKLOGS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_WEBHOOKLOGS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action?.payload?.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
        },
      };
    default:
      return state;
  }
}
