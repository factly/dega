import axios from 'axios';
import {
  ADD_MENUS,
  ADD_MENUS_REQUEST,
  SET_MENUS_LOADING,
  RESET_MENUS,
  MENUS_API,
  GET_MENU,
  UPDATE_MENU,
} from '../constants/menu';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

// action to fetch all menus
export const getMenus = (query) => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .get(MENUS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addMenus(response.data.nodes));
        dispatch(
          addMenusRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMenusLoading()));
  };
};

// action to fetch menu by id
export const getMenu = (id) => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .get(MENUS_API + '/' + id)
      .then((response) => {
        dispatch(addMenu(GET_MENU, response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMenusLoading()));
  };
};

// action to create menu
export const createMenu = (data) => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .post(MENUS_API, data)
      .then(() => {
        dispatch(resetMenus());
        dispatch(addSuccessNotification('Menu created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update menu
export const updateMenu = (data) => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .put(MENUS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(addMenu(UPDATE_MENU, response.data));
        dispatch(addSuccessNotification('Menu updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMenusLoading()));
  };
};

// action to delete menu by id
export const deleteMenu = (id) => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .delete(MENUS_API + '/' + id)
      .then(() => {
        dispatch(resetMenus());
        dispatch(addSuccessNotification('Menu deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingMenus = () => ({
  type: SET_MENUS_LOADING,
  payload: true,
});

export const stopMenusLoading = () => ({
  type: SET_MENUS_LOADING,
  payload: false,
});

export const addMenu = (type, payload) => ({
  type,
  payload,
});

export const addMenus = (payload) => ({
  type: ADD_MENUS,
  payload,
});

export const addMenusRequest = (payload) => ({
  type: ADD_MENUS_REQUEST,
  payload,
});

export const resetMenus = () => ({
  type: RESET_MENUS,
});
