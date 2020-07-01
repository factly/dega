import {
  ADD_FORMAT,
  ADD_FORMATS,
  ADD_FORMATS_REQUEST,
  SET_FORMATS_LOADING,
  RESET_FORMATS,
} from '../constants/formats';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function formatsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_FORMATS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_FORMATS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_FORMATS_REQUEST:
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
    case ADD_FORMATS:
      const localDetails = state.details;
      action.payload.data.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    case ADD_FORMAT:
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
