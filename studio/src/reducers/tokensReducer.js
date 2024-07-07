import {
  ADD_SPACE_TOKENS,
  ADD_SPACE_TOKENS_REQUEST,
  SET_SPACE_TOKENS_LOADING,
} from '../constants/tokens';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function tokensReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_SPACE_TOKENS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SPACE_TOKENS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_SPACE_TOKENS:
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
