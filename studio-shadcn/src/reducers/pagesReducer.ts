import {
    ADD_PAGE,
    ADD_PAGES,
    ADD_PAGES_REQUEST,
    RESET_PAGES,
    SET_PAGES_LOADING,
  } from '../constants/pages';
  import deepEqual from 'deep-equal';
  
  // Define interfaces for the state and payload objects
  interface Page {
    id: string;
    [key: string]: any;
  }
  
  interface PagesRequest {
    query: any;
    [key: string]: any;
  }
  
  interface PagesState {
    req: PagesRequest[];
    details: {
      [key: string]: Page;
    };
    loading: boolean;
  }
  
  // Define types for the various actions
  interface ResetPagesAction {
    type: typeof RESET_PAGES;
  }
  
  interface SetPagesLoadingAction {
    type: typeof SET_PAGES_LOADING;
    payload: boolean;
  }
  
  interface AddPagesRequestAction {
    type: typeof ADD_PAGES_REQUEST;
    payload: PagesRequest;
  }
  
  interface AddPagesAction {
    type: typeof ADD_PAGES;
    payload: Page[];
  }
  
  interface AddPageAction {
    type: typeof ADD_PAGE;
    payload: Page;
  }
  
  // Union type for all possible action types
  type PagesActionTypes =
    | ResetPagesAction
    | SetPagesLoadingAction
    | AddPagesRequestAction
    | AddPagesAction
    | AddPageAction;
  
  const initialState: PagesState = {
    req: [],
    details: {},
    loading: true,
  };
  
  export default function pagesReducer(
    state: PagesState = initialState,
    action: PagesActionTypes = {} as PagesActionTypes
  ): PagesState {
    switch (action.type) {
      case RESET_PAGES:
        return {
          ...state,
          req: [],
          details: {},
          loading: true,
        };
      case SET_PAGES_LOADING:
        return {
          ...state,
          loading: action.payload,
        };
      case ADD_PAGES_REQUEST:
        return {
          ...state,
          req: state.req
            .filter((value) => !deepEqual(value.query, action.payload.query))
            .concat(action.payload),
        };
      case ADD_PAGES:
        if (action.payload.length === 0) {
          return state;
        }
        return {
          ...state,
          details: {
            ...state.details,
            ...action.payload.reduce(
              (obj, item) => Object.assign(obj, { [item.id]: item }), 
              {} as { [key: string]: Page }
            ),
          },
        };
      case ADD_PAGE:
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