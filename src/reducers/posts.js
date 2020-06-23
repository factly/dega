import {
  GET_POSTS_SUCCESS,
  GET_POST_SUCCESS,
  ADD_POST_SUCCESS,
  UPDATE_POST_SUCCESS,
  DELETE_POST_SUCCESS,
  LOADING_POSTS,
} from '../constants/posts';

const initialState = {
  req: [],
  post: {},
  details: {},
  loading: true,
  total: 0,
};

export default function postsReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_POSTS:
      return {
        ...state,
        loading: false,
      };
    case GET_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case GET_POSTS_SUCCESS:
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
    case ADD_POST_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case UPDATE_POST_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.id]: action.payload },
      };
    case DELETE_POST_SUCCESS:
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
