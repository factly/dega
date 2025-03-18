import axios, { AxiosError } from "axios";
import { Dispatch } from "redux";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import {
  ADD_SPACE_USERS,
  ADD_SPACE_USERS_REQUEST,
  SET_SPACE_USERS_LOADING,
  SPACE_USERS_API,
} from "../constants/spaceUsers";
import getError from "../utils/getError";

// Define interfaces for the data structures
interface SpaceUser {
  id: string;
  display_name: string;
  email: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

interface UsersRequestData {
  data: string[];
  query: SpaceUserQuery;
  total: number;
}

interface SpaceUserQuery {
  page?: number | string | null;
  limit?: number | string | null;
  q?: string;
  [key: string]: any;
}

interface SpaceUserData {
  name: string;
  description?: string;
}

interface SpaceUserResponseData {
  user: SpaceUser;
  [key: string]: any;
}

interface SpaceUsersResponseData {
  nodes: SpaceUser[];
  total: number;
  [key: string]: any;
}

// Action interfaces
interface AddSpaceUsersAction {
  type: typeof ADD_SPACE_USERS;
  payload: SpaceUser[];
}

interface AddUsersRequestAction {
  type: typeof ADD_SPACE_USERS_REQUEST;
  payload: UsersRequestData;
}

interface LoadingSpaceUsersAction {
  type: typeof SET_SPACE_USERS_LOADING;
  payload: boolean;
}

// Type for all possible actions in this file
export type SpaceUsersActionTypes =
  | AddSpaceUsersAction
  | AddUsersRequestAction
  | LoadingSpaceUsersAction;

export const addSpaceUsers = (payload: SpaceUser[]): AddSpaceUsersAction => ({
  type: ADD_SPACE_USERS,
  payload,
});

export const getSpaceUsers = (query: SpaceUserQuery) => {
  return (dispatch: Dispatch<any>) => {
    const normalizedQuery = {
      page: query.page?.toString() || null,
      limit: query.limit?.toString() || null,
      // Only include q if it's explicitly defined
      ...(query.q ? { q: query.q } : {}),
    };

    dispatch(loadingSpaceUsers(true));
    return axios
      .get<SpaceUsersResponseData>(SPACE_USERS_API, {
        params: query,
      })
      .then((res) => {
        // First ensure we have data
        if (res.data && res.data.nodes && Array.isArray(res.data.nodes)) {
          // Add users to details
          dispatch(addSpaceUsers(res.data.nodes));

          // Make sure we don't have duplicate IDs in the data array
          const uniqueIds = Array.from(
            new Set(res.data.nodes.map((item) => item.id))
          );

          dispatch(
            addUsersRequest({
              data: uniqueIds,
              query: normalizedQuery,
              total: res.data.total || 0,
            })
          );

          // Log success for debugging
          console.log(
            `Successfully fetched ${res.data.nodes.length} users for query`,
            normalizedQuery
          );
        } else {
          console.warn(
            "Received empty or invalid response from space users API",
            res.data
          );
        }

        return res.data;
      })
      .catch((error: Error | AxiosError) => {
        console.error("Error fetching space users:", error);
        dispatch(addErrorNotification(getError(error)));
        throw error; // Rethrow for error handling in components
      })
      .finally(() => {
        dispatch(loadingSpaceUsers(false));
      });
  };
};

export const updateSpaceUsers = (data: { ids: string[] }) => {
  return (dispatch: Dispatch<any>) => {
    dispatch(loadingSpaceUsers(true));
    return axios
      .put("/core/spaces/users", data)
      .then((response) => {
        dispatch(addSuccessNotification("Users Added Successfully"));
        const refreshParams = { page: 1, limit: 10 };
        return dispatch(getSpaceUsers(refreshParams));
      })
      .catch((error: Error | AxiosError) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      });
  };
};

export const addSpaceUser = (
  data: SpaceUserData,
  setUser?: (user: SpaceUser) => void,
  setShowModal?: (show: boolean) => void
) => {
  return (dispatch: Dispatch<any>) => {
    return axios
      .post<SpaceUserResponseData>(SPACE_USERS_API, {
        name: data.name,
        description: data.description,
      })
      .then((res) => {
        if (setUser) setUser(res.data.user);
        if (setShowModal) setShowModal(true);
        dispatch(addSuccessNotification("Users Added Successfully"));
        return res.data.user;
      })
      .catch((error: Error | AxiosError) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      });
  };
};

export const deleteSpaceUser = (id: string) => {
  return (dispatch: Dispatch<any>) => {
    return axios
      .delete(`${SPACE_USERS_API}/${id}`)
      .then(() => {
        dispatch(addSuccessNotification("User Deleted Successfully"));
      })
      .catch((error: Error | AxiosError) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingSpaceUsers = (
  payload: boolean
): LoadingSpaceUsersAction => ({
  type: SET_SPACE_USERS_LOADING,
  payload,
});

export const addUsersRequest = (
  data: UsersRequestData
): AddUsersRequestAction => ({
  type: ADD_SPACE_USERS_REQUEST,
  payload: data,
});

// Add these exports for compatibility with the Selector component
export const getUsers = getSpaceUsers;
export const createUser = addSpaceUser;
