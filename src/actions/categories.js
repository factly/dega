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
import { addMediaList } from './media';

export const getCategories = (query) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .get(CATEGORIES_API, {
        params: query,
      })
      .then((response) => {
        const media = [];
        const categories = response.data.nodes.map((category) => {
          if (category.medium) media.push(category.medium);
          delete category.medium;
          return category;
        });

        dispatch(addMediaList(media));
        dispatch(addCategoriesList(categories));
        dispatch(
          addCategoriesRequest({
            data: categories.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopCategoriesLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const getCategory = (id) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .get(CATEGORIES_API + '/' + id)
      .then((response) => {
        const category = response.data;
        if (category.medium) dispatch(addMediaList([category.medium]));
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
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .post(CATEGORIES_API, data)
      .then(() => {
        dispatch(resetCategories());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const updateCategory = (data) => {
  return (dispatch) => {
    dispatch(loadingCategories());
    return axios
      .put(CATEGORIES_API + '/' + data.id, data)
      .then((response) => {
        const category = response.data;
        if (category.medium) dispatch(addMediaList([category.medium]));
        delete category.medium;

        dispatch(getCategoryByID(category));
        dispatch(stopCategoriesLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
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
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addCategories = (categories) => {
  return (dispatch) => {
    const media = [];
    const categoriesList = categories.map((category) => {
      if (category.medium) media.push(category.medium);
      delete category.medium;
      return category;
    });

    dispatch(addMediaList(media));
    return dispatch(addCategoriesList(categoriesList));
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
