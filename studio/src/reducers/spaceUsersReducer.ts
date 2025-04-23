import {
  ADD_SPACE_USERS,
  ADD_SPACE_USERS_REQUEST,
  SET_SPACE_USERS_LOADING,
} from "../constants/spaceUsers";
import deepEqual from "deep-equal";

// Define interfaces for our data structures
interface SpaceUser {
  id: string;
  display_name: string;
  email: string;
  [key: string]: any;
}

interface SpaceUsersRequest {
  query: {
    page: string | null;
    limit: string | null;
    q?: string;
    [key: string]: any;
  };
  data: string[];
  total: number;
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
  loading: false, // Start with loading false to prevent immediate loading state
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

      // Check if we already have this exact query
      const existingRequestIndex = state.req.findIndex((req) =>
        deepEqual(req.query, request.query)
      );

      if (existingRequestIndex >= 0) {
        // We already have this request, just update it
        const updatedRequests = [...state.req];
        updatedRequests[existingRequestIndex] = request;

        return {
          ...state,
          req: updatedRequests,
        };
      }

      // Otherwise add it as a new request
      return {
        ...state,
        req: [...state.req, request],
      };
    }

    case ADD_SPACE_USERS: {
      const users = action.payload as SpaceUser[];
      if (users.length === 0) {
        return state;
      }

      const updatedDetails: Record<string, SpaceUser> = { ...state.details };

      users.forEach((user) => {
        updatedDetails[user.id] = user;
      });

      return {
        ...state,
        details: updatedDetails,
      };
    }

    default:
      return state;
  }
}
