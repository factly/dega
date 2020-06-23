import axios from 'axios';
import {
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAILURE,
  ADD_CATEGORY_FAILURE,
  ADD_CATEGORY_SUCCESS,
  API_ADD_CATEGORY,
  API_GET_CATEGORIES,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  LOADING_CATEGORIES,
  GET_CATEGORY_SUCCESS,
  GET_CATEGORY_FAILURE,
} from '../constants/categories';

export const getCategories = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .get(API_GET_CATEGORIES, {
        params: query,
      })
      .then((response) => {
        dispatch(getCategoriesSuccess(response.data, query));
      })
      .catch((error) => {
        dispatch(getCategoriesFailure(error.message));
      });
  };
};

export const getCategory = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .get(API_GET_CATEGORIES + '/' + id)
      .then((response) => {
        dispatch(getCategorySuccess(response.data));
      })
      .catch((error) => {
        dispatch(getCategoryFailure(error.message));
      });
  };
};

export const addCategory = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .post(API_ADD_CATEGORY, data)
      .then((response) => {
        dispatch(addCategorySuccess(response.data));
      })
      .catch((error) => {
        dispatch(addCategoryFailure(error.message));
      });
  };
};

export const updateCategory = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .put(API_ADD_CATEGORY + '/' + data.id, data)
      .then((response) => {
        dispatch(updateCategorySuccess(response.data));
      })
      .catch((error) => {
        dispatch(updateCategoryFailure(error.message));
      });
  };
};

export const deleteCategory = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .delete(API_ADD_CATEGORY + '/' + id)
      .then(() => {
        dispatch(deleteCategorySuccess(id));
      })
      .catch((error) => {
        dispatch(deleteCategoryFailure(error.message));
      });
  };
};

const loadingCategories = () => ({
  type: LOADING_CATEGORIES,
});

const getCategoriesSuccess = (data, query) => ({
  type: GET_CATEGORIES_SUCCESS,
  payload: { data, query },
});

const getCategoriesFailure = (error) => ({
  type: GET_CATEGORIES_FAILURE,
  payload: {
    error,
  },
});

const getCategorySuccess = (data, query) => ({
  type: GET_CATEGORY_SUCCESS,
  payload: data,
});

const getCategoryFailure = (error) => ({
  type: GET_CATEGORY_FAILURE,
  payload: {
    error,
  },
});

const addCategorySuccess = (data) => ({
  type: ADD_CATEGORY_SUCCESS,
  payload: {
    ...data,
  },
});

const addCategoryFailure = (error) => ({
  type: ADD_CATEGORY_FAILURE,
  payload: {
    error,
  },
});

const updateCategorySuccess = (data) => ({
  type: UPDATE_CATEGORY_SUCCESS,
  payload: {
    ...data,
  },
});

const updateCategoryFailure = (error) => ({
  type: UPDATE_CATEGORY_FAILURE,
  payload: {
    error,
  },
});

const deleteCategorySuccess = (id) => ({
  type: DELETE_CATEGORY_SUCCESS,
  payload: id,
});

const deleteCategoryFailure = (error) => ({
  type: DELETE_CATEGORY_FAILURE,
  payload: {
    error,
  },
});
