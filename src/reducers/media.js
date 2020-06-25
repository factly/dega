import {
  ADD_MEDIUM_SUCCESS,
  LOADING_MEDIA,
  GET_MEDIA_SUCCESS,
  GET_MEDIUM_SUCCESS,
  UPDATE_MEDIUM_SUCCESS,
  DELETE_MEDIUM_SUCCESS,
} from '../constants/media';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function mediaReducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOADING_MEDIA:
      return {
        ...state,
        loading: true,
      };
    case ADD_MEDIUM_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case GET_MEDIA_SUCCESS:
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
    case GET_MEDIUM_SUCCESS:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case UPDATE_MEDIUM_SUCCESS:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case DELETE_MEDIUM_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
