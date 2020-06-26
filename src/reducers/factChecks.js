import {
  GET_FACT_CHECKS_SUCCESS,
  GET_FACT_CHECK_SUCCESS,
  ADD_FACT_CHECK_SUCCESS,
  UPDATE_FACT_CHECK_SUCCESS,
  DELETE_FACT_CHECK_SUCCESS,
  LOADING_FACT_CHECKS,
} from '../constants/factChecks';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function factChecksReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_FACT_CHECKS:
      return {
        ...state,
        loading: false,
      };
    case GET_FACT_CHECK_SUCCESS:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case GET_FACT_CHECKS_SUCCESS:
      const localReq = state.req;

      const nodeIndex = state.req.findIndex((item) => {
        return item.query.page === action.payload.query.page;
      });

      if (nodeIndex > -1) localReq.splice(nodeIndex, 1);

      localReq.push({
        data: action.payload.data.nodes.map((item) => item.id),
        query: action.payload.query,
      });

      const localDetails = state.details;
      action.payload.data.nodes.forEach((element) => {
        localDetails[element.id] = element;
      });

      return {
        ...state,
        loading: false,
        req: localReq,
        details: localDetails,
        total: action.payload.data.total,
      };
    case ADD_FACT_CHECK_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case UPDATE_FACT_CHECK_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.id]: action.payload },
      };
    case DELETE_FACT_CHECK_SUCCESS:
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
