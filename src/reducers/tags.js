import {
  ADD_TAG,
  ADD_TAGS,
  ADD_TAGS_REQUEST,
  SET_TAGS_LOADING,
  RESET_TAGS,
} from '../constants/tags';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function tagsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_TAGS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_TAGS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_TAGS_REQUEST:
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
    case ADD_TAGS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
        },
      };
    case ADD_TAG:
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
