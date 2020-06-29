import {
  ADD_FACT_CHECK,
  ADD_FACT_CHECKS,
  ADD_FACT_CHECKS_REQUEST,
  SET_FACT_CHECKS_LOADING,
  RESET_FACT_CHECKS,
} from '../constants/factChecks';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function factChecksReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_FACT_CHECKS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case SET_FACT_CHECKS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_FACT_CHECKS_REQUEST:
      const localReq = state.req;
      const { query, data, total } = action.payload;

      const nodeIndex = state.req.findIndex((item) => {
        return item.query.page === query.page;
      });

      if (nodeIndex > -1) localReq.splice(nodeIndex, 1);

      localReq.push({
        data: data,
        query: query,
      });

      return {
        ...state,
        req: localReq,
        total: total,
      };
    case ADD_FACT_CHECKS:
      const localDetails = state.details;
      action.payload.data.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    case ADD_FACT_CHECK:
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
