import axios, { AxiosError } from "axios";
import { Dispatch } from "redux";
import {
  USERS_API,
  ADD_USERS_REQUEST,
  SET_USERS_LOADING,
  ADD_USERS,
} from "../constants/users";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import getError from "../utils/getError";

// Define interfaces
interface User {
  id: string;
  display_name?: string;
  email?: string;
  [key: string]: any; // For any additional properties
}

interface UserAction {
  type: string;
  payload: any;
}

interface UserRequestData {
  data: string[];
  query: any;
  total: number;
}

export const getUsers = (query: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addUsers(response.data.nodes));

        dispatch(
          addRequest({
            data: response.data.nodes.map((item: User) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const addUsers = (data: User[]): UserAction => ({
  type: ADD_USERS,
  payload: data,
});

export const addRequest = (data: UserRequestData): UserAction => ({
  type: ADD_USERS_REQUEST,
  payload: data,
});

export const loadingUsers = (): UserAction => ({
  type: SET_USERS_LOADING,
  payload: true,
});

export const stopLoading = (): UserAction => ({
  type: SET_USERS_LOADING,
  payload: false,
});

export const createUser = (data: { name: string; description?: string }) => {
  return (dispatch: Dispatch<any>) => {
    return axios
      .post(USERS_API, {
        name: data.name,
        description: data.description,
      })
      .then((res) => {
        if (res.data.user) {
          dispatch(addUsers([res.data.user]));
        }
        dispatch(addSuccessNotification("User Created Successfully"));
        return res.data.user;
      })
      .catch((error: Error | AxiosError) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      });
  };
};

// Alias for compatibility with the Selector component
export const addUser = createUser;
