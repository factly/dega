import {
  ADD_RATING,
  ADD_RATINGS,
  ADD_RATINGS_REQUEST,
  SET_RATINGS_LOADING,
  RESET_RATINGS,
} from '../constants/ratings';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function ratingsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_RATINGS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_RATINGS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_RATINGS_REQUEST:
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
    case ADD_RATINGS:
      const localDetails = state.details;
      action.payload.data.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    case ADD_RATING:
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
