import deepEqual from "deep-equal";
import {
  ADD_USERS,
  ADD_USERS_REQUEST,
  SET_USERS_LOADING,
} from "../constants/users";

// Define interfaces for our state and data structures
interface User {
  id: string;
  [key: string]: any; // For any additional user properties
}

interface UserRequest {
  query: any;
  [key: string]: any; // For any additional request properties
}

interface UsersState {
  req: UserRequest[];
  details: {
    [key: string]: User;
  };
  loading: boolean;
}

// Define action types
interface SetUsersLoadingAction {
  type: typeof SET_USERS_LOADING;
  payload: boolean;
}

interface AddUsersRequestAction {
  type: typeof ADD_USERS_REQUEST;
  payload: UserRequest;
}

interface AddUsersAction {
  type: typeof ADD_USERS;
  payload: User[];
}

// Union type for all possible action types
type UsersActionTypes =
  | SetUsersLoadingAction
  | AddUsersRequestAction
  | AddUsersAction;

const initialState: UsersState = {
  req: [],
  details: {},
  loading: true,
};

export default function usersReducer(
  state: UsersState = initialState,
  action: UsersActionTypes = {} as UsersActionTypes
): UsersState {
  switch (action.type) {
    case SET_USERS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_USERS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_USERS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<{ [key: string]: User }>(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    default:
      return state;
  }
}
