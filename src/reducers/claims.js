import {
  ADD_CLAIM,
  ADD_CLAIMS,
  ADD_CLAIMS_REQUEST,
  SET_CLAIMS_LOADING,
  RESET_CLAIMS,
} from '../constants/claims';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function claimsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_CLAIMS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_CLAIMS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_CLAIMS_REQUEST:
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
    case ADD_CLAIMS:
      const localDetails = state.details;
      action.payload.data.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    case ADD_CLAIM:
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
