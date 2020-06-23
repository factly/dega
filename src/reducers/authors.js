import { GET_AUTHORS_SUCCESS, LOADING_AUTHORS } from '../constants/authors';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function authorsReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_AUTHORS:
      return {
        ...state,
        loading: false,
      };
    case GET_AUTHORS_SUCCESS:
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
    default:
      return state;
  }
}
