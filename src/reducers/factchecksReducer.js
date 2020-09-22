import {
  ADD_FACTCHECKS,
  ADD_FACTCHECKS_REQUEST,
  SET_FACTCHECKS_LOADING,
} from '../constants/factchecks';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function factchecksReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_FACTCHECKS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_FACTCHECKS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_FACTCHECKS:
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
    default:
      return state;
  }
}
