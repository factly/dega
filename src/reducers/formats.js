import {
  GET_FORMATS_SUCCESS,
  ADD_FORMAT_SUCCESS,
  UPDATE_FORMAT_SUCCESS,
  DELETE_FORMAT_SUCCESS,
  LOADING_FORMATS,
} from '../constants/formats';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function formatsReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_FORMATS:
      return {
        ...state,
        loading: false,
      };
    case GET_FORMATS_SUCCESS:
      const localReq = state.req;
      localReq.push({
        ids: action.payload.data.nodes.map((item) => item.id),
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
    case ADD_FORMAT_SUCCESS:
      return initialState;
    case UPDATE_FORMAT_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.id]: action.payload },
      };
    case DELETE_FORMAT_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
