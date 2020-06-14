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
      const localReq = state.req;
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
    default:
      return state;
  }
}
