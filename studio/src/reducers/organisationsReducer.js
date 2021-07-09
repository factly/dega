import {
  ADD_ORGANISATION_PERMISSION,
  ADD_ORGANISATION_PERMISSIONS,
  ADD_ORGANISATION_PERMISSIONS_REQUEST,
  SET_ORGANISATION_PERMISSIONS_LOADING,
  RESET_ORGANISATION_PERMISSIONS,
} from '../constants/organisations';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function organisationsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_ORGANISATION_PERMISSIONS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_ORGANISATION_PERMISSIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ORGANISATION_PERMISSIONS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_ORGANISATION_PERMISSIONS:
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
    case ADD_ORGANISATION_PERMISSION:
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
