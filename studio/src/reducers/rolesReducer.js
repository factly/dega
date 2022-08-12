import {
  ADD_ROLES,
  ADD_ROLES_REQUEST,
  SET_ROLES_LOADING,
  RESET_ROLES,
  GET_ROLE,
  UPDATE_ROLE,
  ADD_SPACE_USERS,
  ADD_SELECTED_ROLE_USERS,
  SET_SPACES_LOADING,
} from '../constants/roles';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
  spacesLoading: true,
  spaceUsers: {},
};

export default function rolesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_ROLES:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_ROLES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ROLES_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_ROLES:
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
    // case ADD_SELECTED_ROLE_USERS:
    //   return{
    //     ...state,
    //     selectedSpaceRoleUsers:{
    //       ...state.selectedSpaceRoleUsers,
    //       ...action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
    //     }
    // }
    case SET_SPACES_LOADING:
      return {
        ...state,
        spacesLoading: action.payload,
      };
    // case ADD_ROLES_REQUEST:
    //   return {
    //     ...state,
    //     req: state.req
    //       .filter((value) => !deepEqual(value.query, action.payload.query))
    //       .concat(action.payload),
    //   };
    case ADD_SPACE_USERS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        spaceUsers: {
          ...state.spaceUsers,
          ...action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
        },
      };
    case GET_ROLE:
    case UPDATE_ROLE:
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
