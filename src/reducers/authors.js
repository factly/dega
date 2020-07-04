import { SET_AUTHORS_LOADING, ADD_AUTHORS, ADD_AUTHORS_REQUEST } from '../constants/authors';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function tagsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_AUTHORS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_AUTHORS_REQUEST:
      const localReq = [...state.req];
      const { query, data, total } = action.payload;

      const nodeIndex = state.req.findIndex((item) => {
        return item.query.page === query.page;
      });

      if (nodeIndex > -1) localReq.splice(nodeIndex, 1);

      localReq.push({
        data: data,
        query: query,
      });

      return {
        ...state,
        req: localReq,
        total: total,
      };
    case ADD_AUTHORS:
      const localDetails = { ...state.details };
      action.payload.forEach((element) => {
        localDetails[element.id] = element;
      });
      return {
        ...state,
        details: localDetails,
      };
    default:
      return state;
  }
}
