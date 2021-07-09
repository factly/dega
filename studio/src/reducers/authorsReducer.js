import { SET_AUTHORS_LOADING, ADD_AUTHORS, ADD_AUTHORS_REQUEST } from '../constants/authors';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function authorsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_AUTHORS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_AUTHORS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_AUTHORS:
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
