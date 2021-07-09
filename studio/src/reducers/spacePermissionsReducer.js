import {
  ADD_SPACE_PERMISSION,
  ADD_SPACE_PERMISSIONS,
  ADD_SPACE_PERMISSIONS_REQUEST,
  SET_SPACE_PERMISSIONS_LOADING,
  RESET_SPACE_PERMISSIONS,
} from '../constants/spacePermissions';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function spacesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_SPACE_PERMISSIONS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_SPACE_PERMISSIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SPACE_PERMISSIONS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_SPACE_PERMISSIONS:
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
    case ADD_SPACE_PERMISSION:
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
