import axios from '../utils/axios';
import {
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAILURE,
  ADD_CATEGORY_FAILURE,
  ADD_CATEGORY_SUCCESS,
  API_ADD_CATEGORY,
  API_GET_CATEGORIES,
} from '../constants/categories';

import { LOADING_PAGE } from '../constants';

export const getCategories = () => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_GET_CATEGORIES,
      method: 'get',
    }).catch((error) => {
      dispatch(getCategoriesFailure(error.message));
    });
    if (response) {
      dispatch(getCategoriesSuccess(response.data));
    }
  };
};

export const addCategory = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const spaceId = getState().spaces.selectedSpace.id;
    const response = await axios({
      url: API_ADD_CATEGORY,
      method: 'post',
      data: { ...data, space_id: spaceId, medium_id: 0 },
    }).catch((error) => {
      dispatch(addCategoryFailure(error.message));
    });
    if (response) {
      dispatch(addCategorySuccess(data));
    }
  };
};

const loadingSpaces = () => ({
  type: LOADING_PAGE,
});

const getCategoriesSuccess = (categories) => ({
  type: GET_CATEGORIES_SUCCESS,
  payload: categories,
});

const getCategoriesFailure = (error) => ({
  type: GET_CATEGORIES_FAILURE,
  payload: {
    error,
  },
});

const addCategorySuccess = (category) => ({
  type: ADD_CATEGORY_SUCCESS,
  payload: {
    ...category,
  },
});

const addCategoryFailure = (error) => ({
  type: ADD_CATEGORY_FAILURE,
  payload: {
    error,
  },
});
