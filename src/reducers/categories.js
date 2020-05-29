import { GET_CATEGORIES_SUCCESS, ADD_CATEGORY_SUCCESS } from '../constants/categories';
import { LOADING_PAGE } from '../constants';

const initialState = {
  categories: [],
  loading: false,
};

export default function categoriesReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  console.log('Categories Reducer', state, action);
  switch (action.type) {
    case LOADING_PAGE:
      return {
        ...state,
        loading: true,
      };
    case GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload.nodes,
        loading: false,
      };
    case ADD_CATEGORY_SUCCESS:
      return {
        ...state,
        categories: [...state.categories, action.payload],
        loading: false,
      };
    default:
      return state;
  }
}
