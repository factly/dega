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
} from '../constants/categories';

export const getCategories = (query) => {
  return async (dispatch, getState) => {
    let found = false;
    const {
      categories: { req },
    } = getState();

    // map data based on query
    req.forEach((each) => {
      const { limit, page } = each.query;
      if (page === query.page && limit === query.limit) {
        found = true;
        return;
      }
    });

    if (!found) {
      dispatch(loadingSpaces());
      const response = await axios({
        url: API_GET_CATEGORIES,
        method: 'get',
        params: query,
      }).catch((error) => {
        dispatch(getCategoriesFailure(error.message));
      });
      if (response) {
        dispatch(getCategoriesSuccess(response.data, query));
      }
    }
  };
};

export const addCategory = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_ADD_CATEGORY,
      method: 'post',
      data: data,
    }).catch((error) => {
      dispatch(addCategoryFailure(error.message));
    });
    if (response) {
      dispatch(addCategorySuccess(data));
    }
  };
};

export const updateCategory = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());

    const response = await axios({
      url: API_ADD_CATEGORY + `/${data.id}`,
      method: 'put',
      data: { ...data },
    }).catch((error) => {
      dispatch(updateCategoryFailure(error.message));
    });
    if (response) {
      dispatch(updateCategorySuccess(data));
    }
  };
};

export const deleteCategory = (id) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());

    const response = await axios({
      url: API_ADD_CATEGORY + `/${id}`,
      method: 'delete',
    }).catch((error) => {
      dispatch(deleteCategoryFailure(error.message));
    });
    if (response) {
      dispatch(deleteCategorySuccess(id));
    }
  };
};

const loadingSpaces = () => ({
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
