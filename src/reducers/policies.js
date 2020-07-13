import {
  ADD_POLICY,
  ADD_POLICIES,
  ADD_POLICIES_REQUEST,
  SET_POLICIES_LOADING,
  RESET_POLICIES,
} from '../constants/policies';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function policiesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_POLICIES:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_POLICIES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_POLICIES_REQUEST:
      const localReq = state.req;
      const { query, data, total } = action.payload;

      const nodeIndex = state.req.findIndex((item) => {
        return item.query.page === query.page;
      });

      if (nodeIndex > -1) localReq.splice(nodeIndex, 1);

      localReq.push({
        data: data,
        query: query,
        total: total,
      });

      return {
        ...state,
        req: localReq,
      };
    case ADD_POLICIES:
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
    case ADD_POLICY:
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
