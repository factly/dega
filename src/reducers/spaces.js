import {
  SET_SELECTED_SPACE,
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
} from '../constants/spaces';

const initialState = {
  spaces: [],
  loading: false,
  selected: null,
};

export default function spacesReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_SPACES:
      return {
        ...state,
        loading: true,
      };
    case GET_SPACES_SUCCESS:
      return {
        ...state,
        spaces: action.payload,
        loading: false,
        selected: action.payload[0].spaces.length > 0 ? action.payload[0].spaces[0].id : null,
      };
    case ADD_SPACE_SUCCESS:
      return {
        ...state,
        spaces: [...state.spaces, action.payload],
        loading: false,
      };
    case SET_SELECTED_SPACE:
      return {
        ...state,
        selected: action.payload,
      };
    default:
      return state;
  }
}
