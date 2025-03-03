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
  id: number | string;
  name: string;
  description?: string;
  [key: string]: any; // For other potential properties
}

interface UsersRequestData {
  data: (number | string)[];
  query: SpaceUserQuery;
  total: number;
}

interface SpaceUserQuery {
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
    dispatch(loadingSpaceUsers(true));
    return axios
      .get<SpaceUsersResponseData>(SPACE_USERS_API, {
        params: query,
      })
      .then((res) => {
        dispatch(addSpaceUsers(res.data.nodes));
        dispatch(
          addUsersRequest({
            data: res.data.nodes.map((item) => item.id),
            query: query,
            total: res.data.total,
          })
        );
      })
      .catch((error: Error | AxiosError) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(loadingSpaceUsers(false));
      });
  };
};

export const updateSpaceUsers = (data: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch(loadingSpaceUsers(true));
    return axios
      .put("/core/spaces/users", data)
      .then((response) => {
        dispatch(addSuccessNotification("User Added Successfully"));
        return response.data;
      })
      .catch((error: Error | AxiosError) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(loadingSpaceUsers(false));
      });
  };
};

export const addSpaceUser = (
  data: SpaceUserData,
  setUser: (user: SpaceUser) => void,
  setShowModal: (show: boolean) => void
) => {
  return (dispatch: Dispatch<any>) => {
    return axios
      .post<SpaceUserResponseData>(SPACE_USERS_API, {
        name: data.name,
        description: data.description,
      })
      .then((res) => {
        setUser(res.data.user);
        setShowModal(true);
        dispatch(addSuccessNotification("User Added Successfully"));
      })
      .catch((error: Error | AxiosError) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteSpaceUser = (id: number | string) => {
  return (dispatch: Dispatch<any>) => {
    return axios
      .delete(`${SPACE_USERS_API}/${id}`)
      .then(() => {
        dispatch(addSuccessNotification("User Deleted Successfully"));
      })
      .catch((error: Error | AxiosError) => {
        dispatch(addErrorNotification(error.message));
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
