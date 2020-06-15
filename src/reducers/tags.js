import {
  GET_TAGS_SUCCESS,
  ADD_TAG_SUCCESS,
  UPDATE_TAG_SUCCESS,
  DELETE_TAG_SUCCESS,
} from '../constants/tags';
import { LOADING_PAGE } from '../constants';

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

export default function tagsReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_PAGE:
      return {
        ...state,
        loading: false,
      };
    case GET_TAGS_SUCCESS:
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
    case ADD_TAG_SUCCESS:
      return {
        ...state,
        req: [],
        details: { ...state.details, [action.payload.id]: action.payload },
        loading: false,
        total: state.total + 1,
      };
    case UPDATE_TAG_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.id]: action.payload },
      };
    case DELETE_TAG_SUCCESS:
      const id = action.payload;
      const details = { ...state.details };
      delete details[id];
      return {
        ...state,
        loading: false,
        req: [],
        ids: [],
        details,
        total: state.total - 1,
      };
    default:
      return state;
  }
}
