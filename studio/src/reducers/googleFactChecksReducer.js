import {
  ADD_GOOGLE_FACT_CHECKS_REQUEST,
  SET_GOOGLE_FACT_CHECKS_LOADING,
} from '../constants/googleFactChecks';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  loading: true,
};

export default function googleFactChecksReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_GOOGLE_FACT_CHECKS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_GOOGLE_FACT_CHECKS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    default:
      return state;
  }
}
