import {
  SET_SELECTED_SPACE,
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
} from '../constants/spaces';

const initialState = {
  spaces: [],
  loading: false,
  selectedSpace: {},
};

export default function spacesReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  console.log('Spaces Reducer', state, action);
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
        selectedSpace: action.payload[0].spaces[0],
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
        selectedSpace: action.payload,
      };
    default:
      return state;
  }
}
