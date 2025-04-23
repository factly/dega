import {
  ADD_MENUS,
  ADD_MENUS_REQUEST,
  SET_MENUS_LOADING,
  RESET_MENUS,
  GET_MENU,
  UPDATE_MENU,
} from "../constants/menu";
import deepEqual from "deep-equal";

// Define interfaces for the menu item and related types
interface Menu {
  id: string | number;
  [key: string]: any;
}

interface MenuQuery {
  query: any;
  [key: string]: any;
}

interface MenuState {
  req: MenuQuery[];
  details: {
    [key: string | number]: Menu;
  };
  loading: boolean;
}

// Define interfaces for the actions
interface ResetMenusAction {
  type: typeof RESET_MENUS;
}

interface SetMenusLoadingAction {
  type: typeof SET_MENUS_LOADING;
  payload: boolean;
}

interface AddMenusRequestAction {
  type: typeof ADD_MENUS_REQUEST;
  payload: MenuQuery;
}

interface AddMenusAction {
  type: typeof ADD_MENUS;
  payload: Menu[];
}

interface GetMenuAction {
  type: typeof GET_MENU;
  payload: Menu;
}

interface UpdateMenuAction {
  type: typeof UPDATE_MENU;
  payload: Menu;
}

// Union type for all possible actions
type MenuActionTypes =
  | ResetMenusAction
  | SetMenusLoadingAction
  | AddMenusRequestAction
  | AddMenusAction
  | GetMenuAction
  | UpdateMenuAction;

const initialState: MenuState = {
  req: [],
  details: {},
  loading: true,
};

export default function menuReducer(
  state: MenuState = initialState,
  action: MenuActionTypes = {} as MenuActionTypes
): MenuState {
  switch (action.type) {
    case RESET_MENUS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_MENUS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_MENUS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_MENUS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<{ [key: string | number]: Menu }>(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    case GET_MENU:
    case UPDATE_MENU:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    default:
      return state;
  }
}
