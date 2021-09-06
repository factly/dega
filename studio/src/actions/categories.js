import axios from 'axios';
import {
  ADD_CATEGORY,
  ADD_CATEGORIES,
  ADD_CATEGORIES_REQUEST,
  SET_CATEGORIES_LOADING,
  RESET_CATEGORIES,
  CATEGORIES_API,
} from '../constants/categories';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addMedia } from './media';
import getError from '../utils/getError';

export const getCategories = (query) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .get(CATEGORIES_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addMedia(
            response.data.nodes
              .filter((category) => category.medium)
              .map((category) => category.medium),
          ),
        );
        dispatch(
          addCategoriesList(
            response.data.nodes.map((category) => {
              return { ...category, medium: category.medium?.id };
            }),
          ),
        );
        dispatch(
          addCategoriesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopCategoriesLoading()));
  };
};

export const getCategory = (id) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .get(CATEGORIES_API + '/' + id)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));

        dispatch(getCategoryByID({ ...response.data, medium: response.data.medium?.id }));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopCategoriesLoading()));
  };
};

export const addCategory = (data) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .post(CATEGORIES_API, data)
      .then(() => {
        dispatch(resetCategories());
        dispatch(addSuccessNotification('Category added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updateCategory = (data) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .put(CATEGORIES_API + '/' + data.id, data)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));

        dispatch(getCategoryByID({ ...response.data, medium: response.data.medium?.id }));
        dispatch(addSuccessNotification('Category updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopCategoriesLoading()));
  };
};

export const deleteCategory = (id) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .delete(CATEGORIES_API + '/' + id)
      .then(() => {
        dispatch(resetCategories());
        dispatch(addSuccessNotification('Category deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addCategories = (categories) => {
  return (dispatch) => {
    dispatch(
      addMedia(categories.filter((category) => category.medium).map((category) => category.medium)),
    );
    dispatch(
      addCategoriesList(
        categories.map((category) => {
          return { ...category, medium: category.medium?.id };
        }),
      ),
    );
  };
};

export const loadingCategories = () => ({
  type: SET_CATEGORIES_LOADING,
  payload: true,
});

export const stopCategoriesLoading = () => ({
  type: SET_CATEGORIES_LOADING,
  payload: false,
});

export const getCategoryByID = (data) => ({
  type: ADD_CATEGORY,
  payload: data,
});

export const addCategoriesList = (data) => ({
  type: ADD_CATEGORIES,
  payload: data,
});

export const addCategoriesRequest = (data) => ({
  type: ADD_CATEGORIES_REQUEST,
  payload: data,
});

export const resetCategories = () => ({
  type: RESET_CATEGORIES,
});
