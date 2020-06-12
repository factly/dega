import { ADD_MEDIUM, LOADING_MEDIA, GET_MEDIA_SUCCESS } from '../constants/media';

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
        loading: false,
      };
    case ADD_MEDIUM:
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case GET_MEDIA_SUCCESS:
      const local = state.req;
      local.push({ data: action.payload.data.nodes, query: action.payload.query });
      return {
        ...state,
        loading: false,
        req: local,
        total: action.payload.data.total,
      };
    default:
      return state;
  }
}
