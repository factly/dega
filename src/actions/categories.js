import axios from 'axios';
import {
  ADD_CATEGORY,
  ADD_CATEGORIES,
  ADD_CATEGORIES_REQUEST,
  SET_CATEGORIES_LOADING,
  RESET_CATEGORIES,
  CATEGORIES_API,
} from '../constants/categories';
import { addErrors } from './notifications';

export const getCategories = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .get(CATEGORIES_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addCategoriesList(response.data.nodes));
        dispatch(
          addCategoriesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopCategoriesLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrors(error.message));
      });
  };
};

export const getCategory = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .get(CATEGORIES_API + '/' + id)
      .then((response) => {
        let category = response.data;
        if (category.medium_id > 0) dispatch(addMedia([medium]));
        delete category.medium;

        dispatch(getCategoryByID(category));
        dispatch(stopCategoriesLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addCategory = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .post(CATEGORIES_API, data)
      .then(() => {
        let category = response.data;
        if (category.medium_id > 0) dispatch(addMedia([medium]));
        dispatch(resetCategories());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const updateCategory = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .put(CATEGORIES_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getCategoryByID(response.data));
        dispatch(stopCategoriesLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const deleteCategory = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingCategories());
    return axios
      .delete(CATEGORIES_API + '/' + id)
      .then(() => {
        dispatch(resetCategories());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addCategories = (categories) => {
  return (dispatch, getState) => {
    return dispatch(addCategoriesList(categories));
  };
};

const loadingCategories = () => ({
  type: SET_CATEGORIES_LOADING,
  payload: true,
});

const stopCategoriesLoading = () => ({
  type: SET_CATEGORIES_LOADING,
  payload: false,
});

const getCategoryByID = (data) => ({
  type: ADD_CATEGORY,
  payload: {
    ...data,
  },
});

const addCategoriesList = (data) => ({
  type: ADD_CATEGORIES,
  payload: { data },
});

const addCategoriesRequest = (data) => ({
  type: ADD_CATEGORIES_REQUEST,
  payload: {
    ...data,
  },
});

const resetCategories = () => ({
  type: RESET_CATEGORIES,
});
