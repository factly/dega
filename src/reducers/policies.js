import {
  LOADING_POLICIES,
  ADD_POLICY_SUCCESS,
  GET_POLICIES_SUCCESS,
  GET_POLICY_SUCCESS,
  DELETE_POLICY_SUCCESS,
  UPDATE_POLICY_SUCCESS,
} from '../constants/policies';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function policiesReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_POLICIES:
      return {
        ...state,
        loading: false,
      };
    case GET_POLICIES_SUCCESS:
      const localReq = state.req;

      const nodeIndex = state.req.findIndex((item) => {
        return item.query.page === action.payload.query.page;
      });

      if (nodeIndex > -1) localReq.splice(nodeIndex, 1);

      localReq.push({
        data: action.payload.data.nodes.map((item) => item.name),
        query: action.payload.query,
      });

      const localDetails = state.details;
      action.payload.data.nodes.forEach((element) => {
        localDetails[element.name] = element;
      });

      return {
        ...state,
        loading: false,
        req: localReq,
        details: localDetails,
        total: action.payload.data.total,
      };
    case GET_POLICY_SUCCESS:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.name]: action.payload,
        },
      };
    case UPDATE_POLICY_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.name]: action.payload },
      };
    case ADD_POLICY_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case DELETE_POLICY_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    default:
      return state;
  }
}
