import { GET_SPACES_SUCCESS, ADD_SPACE_SUCCESS, LOADING_SPACES } from '../actions/types';

const initialState = {
  spaces: [],
  loading: false,
};

export default function spacesReducer(state = initialState, action = {}) {
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
      };
    case ADD_SPACE_SUCCESS:
      return {
        ...state,
        spaces: [...state.spaces, action.payload],
        loading: false,
      };
    default:
      return state;
  }
}
