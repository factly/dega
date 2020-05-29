import { GET_TAGS_SUCCESS, ADD_TAG_SUCCESS } from '../constants/tags';
import { LOADING_PAGE } from '../constants';

const initialState = {
  tags: [],
  loading: false,
};

export default function tagsReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  console.log('tags Reducer', state, action);
  switch (action.type) {
    case LOADING_PAGE:
      return {
        ...state,
        loading: true,
      };
    case GET_TAGS_SUCCESS:
      return {
        ...state,
        tags: action.payload.nodes,
        loading: false,
      };
    case ADD_TAG_SUCCESS:
      return {
        ...state,
        tags: [...state.tags, action.payload],
        loading: false,
      };
    default:
      return state;
  }
}
