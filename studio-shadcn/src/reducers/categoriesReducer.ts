import {
  ADD_CATEGORIES,
  ADD_CATEGORIES_REQUEST,
  SET_CATEGORIES_LOADING,
  RESET_CATEGORIES,
  GET_CATEGORY,
  UPDATE_CATEGORY,
} from "../constants/categories";
import deepEqual from "deep-equal";

// Define types for the category object
interface Category {
  id: number;
  [key: string]: any;
}

// Define types for the request object
interface CategoryRequest {
  query: any;
  data: string[];
  total: number;
  [key: string]: any;
}

// Define the state interface
interface CategoriesState {
  req: CategoryRequest[];
  details: {
    [key: string]: Category;
  };
  loading: boolean;
}

// Define action interfaces
interface SetCategoriesLoadingAction {
  type: typeof SET_CATEGORIES_LOADING;
  payload: boolean;
}

interface AddCategoriesAction {
  type: typeof ADD_CATEGORIES;
  payload: Category[];
}

interface AddCategoriesRequestAction {
  type: typeof ADD_CATEGORIES_REQUEST;
  payload: CategoryRequest;
}

interface ResetCategoriesAction {
  type: typeof RESET_CATEGORIES;
}

interface GetCategoryAction {
  type: typeof GET_CATEGORY;
  payload: Category;
}

interface UpdateCategoryAction {
  type: typeof UPDATE_CATEGORY;
  payload: Category;
}

// Define union type for all possible actions
type CategoriesAction =
  | SetCategoriesLoadingAction
  | AddCategoriesAction
  | AddCategoriesRequestAction
  | ResetCategoriesAction
  | GetCategoryAction
  | UpdateCategoryAction
  | { type: string };

const initialState: CategoriesState = {
  req: [],
  details: {},
  loading: true,
};

export default function categoriesReducer(
  state: CategoriesState = initialState,
  action: CategoriesAction = { type: "" }
): CategoriesState {
  switch (action.type) {
    case RESET_CATEGORIES:
      return {
        ...state,
        req: [],
        loading: true,
      };
    case SET_CATEGORIES_LOADING:
      return {
        ...state,
        loading: (action as SetCategoriesLoadingAction).payload,
      };
    case ADD_CATEGORIES_REQUEST:
      return {
        ...state,
        req: state.req
          .filter(
            (value) =>
              !deepEqual(
                value.query,
                (action as AddCategoriesRequestAction).payload.query
              )
          )
          .concat((action as AddCategoriesRequestAction).payload),
      };
    case ADD_CATEGORIES: {
      const payload = (action as AddCategoriesAction).payload;
      if (payload.length === 0) {
        return state;
      }

      const newDetails = payload.reduce<{ [key: string]: Category }>(
        (obj, item) => {
          obj[String(item.id)] = item;
          return obj;
        },
        {}
      );

      return {
        ...state,
        details: {
          ...state.details,
          ...newDetails,
        },
      };
    }
    case GET_CATEGORY:
    case UPDATE_CATEGORY: {
      const payload = (action as GetCategoryAction | UpdateCategoryAction)
        .payload;
      return {
        ...state,
        details: {
          ...state.details,
          [String(payload.id)]: payload,
        },
      };
    }
    default:
      return state;
  }
}
