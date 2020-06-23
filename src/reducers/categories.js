import {
  GET_CATEGORIES_SUCCESS,
  ADD_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_SUCCESS,
  LOADING_CATEGORIES,
  GET_CATEGORY_SUCCESS,
  ADD_CATEGORIES,
} from '../constants/categories';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function categoriesReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_CATEGORIES:
      return {
        ...state,
        loading: false,
      };
    case GET_CATEGORIES_SUCCESS:
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
    case GET_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case ADD_CATEGORIES:
      let details = state.details;
      action.payload.data.forEach((element) => {
        details[element.id] = element;
      });
      return {
        ...state,
        details: details,
      };
    case ADD_CATEGORY_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.id]: action.payload },
      };
    case DELETE_CATEGORY_SUCCESS:
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
