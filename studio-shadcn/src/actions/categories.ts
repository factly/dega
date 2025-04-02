import axios from "axios";
import {
  ADD_CATEGORIES,
  ADD_CATEGORIES_REQUEST,
  SET_CATEGORIES_LOADING,
  RESET_CATEGORIES,
  CATEGORIES_API,
  GET_CATEGORY,
  UPDATE_CATEGORY,
} from "../constants/categories";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import { addMedia } from "./media";
import getError from "../utils/getError";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../store/index";
import { AnyAction } from "redux";

// Define types
interface Medium {
  id: number;
  [key: string]: any;
}

interface Description {
  json: any;
  html: string;
}

interface Category {
  id: string | number;
  name: string;
  description?: any;
  description_html?: string;
  medium?: Medium | null;
  [key: string]: any;
}

interface CategoryWithProcessedFields {
  id: string | number; // Allow both string and number IDs
  name: string;
  description: Description;
  medium?: number | null;
  [key: string]: any;
}

interface CategoryResponse {
  nodes: Category[];
  total: number;
}

interface GetCategoriesQuery {
  [key: string]: any;
}

interface CategoryRequest {
  data: string[];
  query: GetCategoriesQuery;
  total: number;
}

// Define action types
interface SetCategoriesLoadingAction {
  type: typeof SET_CATEGORIES_LOADING;
  payload: boolean;
}

interface AddCategoriesAction {
  type: typeof ADD_CATEGORIES;
  payload: CategoryWithProcessedFields[];
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
  payload: CategoryWithProcessedFields;
}

interface UpdateCategoryAction {
  type: typeof UPDATE_CATEGORY;
  payload: CategoryWithProcessedFields;
}

type CategoryActionTypes =
  | SetCategoriesLoadingAction
  | AddCategoriesAction
  | AddCategoriesRequestAction
  | ResetCategoriesAction
  | GetCategoryAction
  | UpdateCategoryAction;

type AppThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType>,
  RootState,
  unknown,
  AnyAction
>;

// Helper function to process category data
const processCategory = (category: Category): CategoryWithProcessedFields => {
  const { medium, description_html, ...rest } = category;

  return {
    ...rest,
    description: {
      json: category.description,
      html: description_html || "",
    },
    medium: medium?.id || null,
  };
};

// action to fetch all categories
export const getCategories = (
  query: GetCategoriesQuery,
  setLoading: boolean = true
): AppThunk<any> => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    if (currentSpaceID === 0) {
      return Promise.resolve();
    }

    if (setLoading) dispatch(loadingCategories());
    const querySnapshot = { ...query };

    return axios
      .get<CategoryResponse>(CATEGORIES_API, {
        params: querySnapshot,
      })
      .then((response) => {
        // Add media to store
        const mediaItems = response.data.nodes
          .filter((category): category is Category & { medium: Medium } =>
            Boolean(category.medium)
          )
          .map((category) => category.medium);

        if (mediaItems.length > 0) {
          dispatch(addMedia(mediaItems));
        }

        // Process and add categories
        const processedCategories = response.data.nodes.map(processCategory);
        dispatch(addCategoriesList(processedCategories));

        // Add categories request
        dispatch(
          addCategoriesRequest({
            data: response.data.nodes.map((item) => String(item.id)),
            query: querySnapshot,
            total: response.data.total,
          })
        );

        return response;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error);
      })
      .finally(() => {
        if (setLoading) dispatch(stopCategoriesLoading());
      });
  };
};

// action to fetch category by id
export const getCategory = (id: string | number): AppThunk<any> => {
  return (dispatch) => {
    // Validate id before making the API call
    if (!id) {
      dispatch(addErrorNotification("Invalid category ID"));
      return Promise.reject(new Error("Invalid category ID"));
    }

    dispatch(loadingCategories());
    return axios
      .get<Category>(`${CATEGORIES_API}/${id}`)
      .then((response) => {
        if (response.data.medium) {
          dispatch(addMedia([response.data.medium]));
        }

        const processedCategory = processCategory(response.data);
        dispatch(addCategory(GET_CATEGORY, processedCategory));
        return response;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error);
      })
      .finally(() => dispatch(stopCategoriesLoading()));
  };
};

// action to create category
export const createCategory = (data: Partial<Category>): AppThunk<any> => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .post<Category>(CATEGORIES_API, data)
      .then((response) => {
        dispatch(resetCategories());
        dispatch(addSuccessNotification("Category created"));
        return response;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error);
      })
      .finally(() => dispatch(stopCategoriesLoading()));
  };
};

// action to update category by id
export const updateCategory = (data: Category): AppThunk<any> => {
  return (dispatch) => {
    if (!data.id) {
      dispatch(addErrorNotification("Category ID is required for update"));
      return Promise.reject(new Error("Category ID is required"));
    }

    dispatch(loadingCategories());
    return axios
      .put<Category>(`${CATEGORIES_API}/${data.id}`, data)
      .then((response) => {
        if (response.data.medium) {
          dispatch(addMedia([response.data.medium]));
        }

        const processedCategory = processCategory(response.data);
        dispatch(addCategory(UPDATE_CATEGORY, processedCategory));
        dispatch(addSuccessNotification("Category updated"));
        return response;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error);
      })
      .finally(() => dispatch(stopCategoriesLoading()));
  };
};

export const deleteCategory = (id: string | number): AppThunk<any> => {
  return (dispatch) => {
    if (!id) {
      dispatch(addErrorNotification("Invalid category ID"));
      return Promise.reject(new Error("Invalid category ID"));
    }

    dispatch(loadingCategories());
    return axios
      .delete(`${CATEGORIES_API}/${id}`)
      .then((response) => {
        dispatch(resetCategories());
        dispatch(addSuccessNotification("Category deleted"));
        return response; // Return the response for chaining
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error); // Propagate the error
      })
      .finally(() => {
        dispatch(stopCategoriesLoading());
      });
  };
};

export const addCategories = (categories: Category[]): AppThunk<any> => {
  return (dispatch) => {
    const mediaItems = categories
      .filter((category): category is Category & { medium: Medium } =>
        Boolean(category.medium)
      )
      .map((category) => category.medium);

    if (mediaItems.length > 0) {
      dispatch(addMedia(mediaItems));
    }

    const processedCategories = categories.map(processCategory);
    dispatch(addCategoriesList(processedCategories));
    return Promise.resolve();
  };
};

export const loadingCategories = (): SetCategoriesLoadingAction => ({
  type: SET_CATEGORIES_LOADING,
  payload: true,
});

export const stopCategoriesLoading = (): SetCategoriesLoadingAction => ({
  type: SET_CATEGORIES_LOADING,
  payload: false,
});

export const addCategory = (
  type: typeof GET_CATEGORY | typeof UPDATE_CATEGORY,
  payload: CategoryWithProcessedFields
): GetCategoryAction | UpdateCategoryAction => ({
  type,
  payload,
});

export const addCategoriesList = (
  data: CategoryWithProcessedFields[]
): AddCategoriesAction => ({
  type: ADD_CATEGORIES,
  payload: data,
});

export const addCategoriesRequest = (
  data: CategoryRequest
): AddCategoriesRequestAction => ({
  type: ADD_CATEGORIES_REQUEST,
  payload: data,
});

export const resetCategories = (): ResetCategoriesAction => ({
  type: RESET_CATEGORIES,
});
