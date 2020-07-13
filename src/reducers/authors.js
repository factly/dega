import { SET_AUTHORS_LOADING, ADD_AUTHORS, ADD_AUTHORS_REQUEST } from '../constants/authors';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function tagsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_AUTHORS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_AUTHORS_REQUEST:
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
    case ADD_AUTHORS:
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
    default:
      return state;
  }
}
