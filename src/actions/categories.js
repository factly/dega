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
import { addMediaList } from './media';

export const getCategories = (query) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .get(CATEGORIES_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addMediaList(
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
        dispatch(stopCategoriesLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getCategory = (id) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .get(CATEGORIES_API + '/' + id)
      .then((response) => {
        if (response.data.medium) dispatch(addMediaList([response.data.medium]));

        dispatch(getCategoryByID({ ...response.data, medium: response.data.medium?.id }));
        dispatch(stopCategoriesLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
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
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updateCategory = (data) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .put(CATEGORIES_API + '/' + data.id, data)
      .then((response) => {
        if (response.data.medium) dispatch(addMediaList([response.data.medium]));

        dispatch(getCategoryByID({ ...response.data, medium: response.data.medium?.id }));
        dispatch(stopCategoriesLoading());
        dispatch(addSuccessNotification('Category updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
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
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addCategories = (categories) => {
  return (dispatch) => {
    dispatch(
      addMediaList(
        categories.filter((category) => category.medium).map((category) => category.medium),
      ),
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
  payload: data,
});

const addCategoriesList = (data) => ({
  type: ADD_CATEGORIES,
  payload: data,
});

const addCategoriesRequest = (data) => ({
  type: ADD_CATEGORIES_REQUEST,
  payload: data,
});

const resetCategories = () => ({
  type: RESET_CATEGORIES,
});
