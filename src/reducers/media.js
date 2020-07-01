import {
  ADD_MEDIUM,
  ADD_MEDIA,
  ADD_MEDIA_REQUEST,
  SET_MEDIA_LOADING,
  RESET_MEDIA,
} from '../constants/media';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function mediaReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_MEDIA:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_MEDIA_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_MEDIA_REQUEST:
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
    case ADD_MEDIA:
      const localDetails = state.details;
      action.payload.data.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    case ADD_MEDIUM:
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
