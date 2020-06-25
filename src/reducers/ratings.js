import {
  GET_RATINGS_SUCCESS,
  ADD_RATING_SUCCESS,
  UPDATE_RATING_SUCCESS,
  DELETE_RATING_SUCCESS,
  LOADING_RATINGS,
  GET_RATING_SUCCESS,
  ADD_RATINGS,
} from '../constants/ratings';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function ratingsReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_RATINGS:
      return {
        ...state,
        loading: false,
      };
    case GET_RATINGS_SUCCESS:
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
    case GET_RATING_SUCCESS:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case ADD_RATINGS:
      let details = state.details;
      action.payload.forEach((element) => {
        details[element.id] = element;
      });
      return {
        ...state,
        details: details,
      };
    case ADD_RATING_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case UPDATE_RATING_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.id]: action.payload },
      };
    case DELETE_RATING_SUCCESS:
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
