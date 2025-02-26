import {
  ADD_SPACE_USERS,
  ADD_SPACE_USERS_REQUEST,
  SET_SPACE_USERS_LOADING,
} from "../constants/spaceUsers";
import deepEqual from "deep-equal";

// Define interfaces for our data structures
interface SpaceUser {
  id: string;
  [key: string]: any;
}

interface SpaceUsersRequest {
  query: any;
  [key: string]: any;
}

interface SpaceUsersState {
  req: SpaceUsersRequest[];
  details: {
    [key: string]: SpaceUser;
  };
  loading: boolean;
}

// Define action interfaces
interface SetSpaceUsersLoadingAction {
  type: typeof SET_SPACE_USERS_LOADING;
  payload: boolean;
}

interface AddSpaceUsersRequestAction {
  type: typeof ADD_SPACE_USERS_REQUEST;
  payload: SpaceUsersRequest;
}

interface AddSpaceUsersAction {
  type: typeof ADD_SPACE_USERS;
  payload: SpaceUser[];
}

// Union type for all possible actions
type SpaceUsersAction =
  | SetSpaceUsersLoadingAction
  | AddSpaceUsersRequestAction
  | AddSpaceUsersAction
  | { type: string; payload?: any };

const initialState: SpaceUsersState = {
  req: [],
  details: {},
  loading: true,
};

export default function usersReducer(
  state: SpaceUsersState = initialState,
  action: SpaceUsersAction = { type: "" }
): SpaceUsersState {
  switch (action.type) {
    case SET_SPACE_USERS_LOADING:
      return {
        ...state,
        loading: action.payload as boolean,
      };

    case ADD_SPACE_USERS_REQUEST: {
      const request = action.payload as SpaceUsersRequest;
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, request.query))
          .concat(request),
      };
    }

    case ADD_SPACE_USERS: {
      const users = action.payload as SpaceUser[];
      if (users.length === 0) {
        return state;
      }

      return {
        ...state,
        details: {
          ...state.details,
          ...users.reduce<Record<string, SpaceUser>>((obj, item) => {
            obj[item.id] = item;
            return obj;
          }, {}),
        },
      };
    }

    default:
      return state;
  }
}
