import {
  ADD_PERMISSIONS,
  ADD_PERMISSIONS_REQUEST,
  SET_PERMISSIONS_LOADING,
} from '../constants/permissions';

const initialState = {
  details: {},
  req: [],
  loading: true,
};

export default function permissions(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PERMISSIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ADD_PERMISSIONS_REQUEST:
      return {
        ...state,
        req: state.req.concat(action.payload),
      };
    case ADD_PERMISSIONS:
      if (action.payload.length === 0) {
        return state;
      }

      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce(
            (obj, item) => Object.assign(obj, { [item.user_id]: item.data }),
            {},
          ),
        },
      };

    default:
      return state;
  }
}
