import {
  ADD_CATEGORY,
  ADD_CATEGORIES,
  ADD_CATEGORIES_REQUEST,
  SET_CATEGORIES_LOADING,
  RESET_CATEGORIES,
} from '../constants/categories';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function categoriesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_CATEGORIES:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_CATEGORIES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_CATEGORIES_REQUEST:
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
    case ADD_CATEGORIES:
      const localDetails = state.details;
      action.payload.data.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    case ADD_CATEGORY:
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
