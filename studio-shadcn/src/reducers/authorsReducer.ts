import {
  SET_AUTHORS_LOADING,
  ADD_AUTHORS,
  ADD_AUTHORS_REQUEST,
} from "../constants/authors";
import deepEqual from "deep-equal";

// Define interfaces for the state and author object
interface Author {
  id: string;
  [key: string]: any;
}

interface AuthorsRequest {
  query: any;
  [key: string]: any;
}

interface AuthorsState {
  req: AuthorsRequest[];
  details: Record<string, Author>;
  loading: boolean;
}

// Define action types
interface SetAuthorsLoadingAction {
  type: typeof SET_AUTHORS_LOADING;
  payload: boolean;
}

interface AddAuthorsRequestAction {
  type: typeof ADD_AUTHORS_REQUEST;
  payload: AuthorsRequest;
}

interface AddAuthorsAction {
  type: typeof ADD_AUTHORS;
  payload: Author[];
}

// Union type for all possible actions
type AuthorsActionTypes =
  | SetAuthorsLoadingAction
  | AddAuthorsRequestAction
  | AddAuthorsAction;

const initialState: AuthorsState = {
  req: [],
  details: {},
  loading: true,
};

export default function authorsReducer(
  state: AuthorsState = initialState,
  action: AuthorsActionTypes = {} as AuthorsActionTypes
): AuthorsState {
  switch (action.type) {
    case SET_AUTHORS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_AUTHORS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_AUTHORS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<Record<string, Author>>(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    default:
      return state;
  }
}
