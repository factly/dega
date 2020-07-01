import {
  ADD_POST,
  ADD_POSTS,
  ADD_POSTS_REQUEST,
  SET_POSTS_LOADING,
  RESET_POSTS,
} from '../constants/posts';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function postsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_POSTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_POSTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_POSTS_REQUEST:
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
    case ADD_POSTS:
      const localDetails = state.details;
      action.payload.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    case ADD_POST:
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
