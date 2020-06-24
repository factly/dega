import {
  GET_CLAIMANTS_SUCCESS,
  ADD_CLAIMANT_SUCCESS,
  UPDATE_CLAIMANT_SUCCESS,
  DELETE_CLAIMANT_SUCCESS,
  LOADING_CLAIMANTS,
  GET_CLAIMANT_SUCCESS,
  ADD_CLAIMANTS,
} from '../constants/claimants';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function claimantsReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_CLAIMANTS:
      return {
        ...state,
        loading: false,
      };
    case GET_CLAIMANTS_SUCCESS:
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
    case GET_CLAIMANT_SUCCESS:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case ADD_CLAIMANTS:
      let details = state.details;
      action.payload.data.forEach((element) => {
        details[element.id] = element;
      });
      return {
        ...state,
        details: details,
      };
    case ADD_CLAIMANT_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case UPDATE_CLAIMANT_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.id]: action.payload },
      };
    case DELETE_CLAIMANT_SUCCESS:
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
