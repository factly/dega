import axios from "axios";
import {
  ADD_MENUS,
  ADD_MENUS_REQUEST,
  SET_MENUS_LOADING,
  RESET_MENUS,
  MENUS_API,
  GET_MENU,
  UPDATE_MENU,
} from "../constants/menu";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import getError from "../utils/getError";
import { AppThunk } from "../store/types";

// Define types
export interface Menu {
  id: string | number;
  name: string;
  menu?: MenuItem[];
  meta_fields?: any;
  [key: string]: any; // Additional menu properties
}

export interface MenuItem {
  name: string;
  title?: string;
  url?: string;
  menu?: MenuItem[];
  [key: string]: any;
}

interface MenusResponse {
  nodes: Menu[];
  total: number;
}

interface MenusRequestPayload {
  data: (string | number)[];
  query: Record<string, any>;
  total: number;
}

type MenuActionType = typeof GET_MENU | typeof UPDATE_MENU;

// action to fetch all menus
export const getMenus = (query: Record<string, any>): AppThunk => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .get<MenusResponse>(MENUS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addMenus(response.data.nodes));
        dispatch(
          addMenusRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          })
        );
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      })
      .finally(() => dispatch(stopMenusLoading()));
  };
};

// action to fetch menu by id
export const getMenu = (id: string | number): AppThunk => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .get<Menu>(`${MENUS_API}/${id}`)
      .then((response) => {
        dispatch(addMenu(GET_MENU, response.data));
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      })
      .finally(() => dispatch(stopMenusLoading()));
  };
};

// action to create menu
export const createMenu = (data: Omit<Menu, "id">): AppThunk<Promise<Menu>> => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .post<Menu>(MENUS_API, data)
      .then((response) => {
        dispatch(resetMenus());
        dispatch(addSuccessNotification("Menu created successfully"));
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      })
      .finally(() => dispatch(stopMenusLoading()));
  };
};

// action to update menu
export const updateMenu = (data: Menu): AppThunk<Promise<Menu>> => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .put<Menu>(`${MENUS_API}/${data.id}`, data)
      .then((response) => {
        dispatch(addMenu(UPDATE_MENU, response.data));
        dispatch(addSuccessNotification("Menu updated successfully"));
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      })
      .finally(() => dispatch(stopMenusLoading()));
  };
};

// action to delete menu by id
export const deleteMenu = (id: string | number): AppThunk<Promise<any>> => {
  return (dispatch) => {
    dispatch(loadingMenus());
    return axios
      .delete(`${MENUS_API}/${id}`)
      .then((response) => {
        dispatch(resetMenus());
        dispatch(addSuccessNotification("Menu deleted successfully"));
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      })
      .finally(() => dispatch(stopMenusLoading()));
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

export const addMenu = (type: MenuActionType, payload: Menu) => ({
  type,
  payload,
});

export const addMenus = (payload: Menu[]) => ({
  type: ADD_MENUS,
  payload,
});

export const addMenusRequest = (payload: MenusRequestPayload) => ({
  type: ADD_MENUS_REQUEST,
  payload,
});

export const resetMenus = () => ({
  type: RESET_MENUS,
});
