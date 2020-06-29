import {
  ADD_CLAIMANT,
  ADD_CLAIMANTS,
  ADD_CLAIMANTS_REQUEST,
  SET_CLAIMANTS_LOADING,
  RESET_CLAIMANTS,
} from '../constants/claimants';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function claimantsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_CLAIMANTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case SET_CLAIMANTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_CLAIMANTS_REQUEST:
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
    case ADD_CLAIMANTS:
      const localDetails = state.details;
      action.payload.data.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    case ADD_CLAIMANT:
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
