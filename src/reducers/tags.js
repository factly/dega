import {
  GET_TAGS_SUCCESS,
  ADD_TAG_SUCCESS,
  UPDATE_TAG_SUCCESS,
  DELETE_TAG_SUCCESS,
  LOADING_TAGS,
  ADD_TAGS,
} from '../constants/tags';
import { each } from 'lodash';

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
    case LOADING_TAGS:
      return {
        ...state,
        loading: false,
      };
    case GET_TAGS_SUCCESS:
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
    case ADD_TAG_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    case ADD_TAGS:
      let details = state.details;
      action.payload.data.forEach((element) => {
        details[element.id] = element;
      });
      return {
        ...state,
        details: details,
      };
    case UPDATE_TAG_SUCCESS:
      return {
        ...state,
        details: { ...state.details, [action.payload.id]: action.payload },
      };
    case DELETE_TAG_SUCCESS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
        total: 0,
      };
    default:
      return state;
  }
}
