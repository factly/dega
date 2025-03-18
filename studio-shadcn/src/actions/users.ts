import axios from "axios";
import {
  USERS_API,
  ADD_USERS_REQUEST,
  SET_USERS_LOADING,
  ADD_USERS,
} from "../constants/users";
import { addErrorNotification } from "./notifications";
import getError from "../utils/getError";

// Define interfaces
interface User {
  id: string;
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
  return (dispatch: (action: any) => void) => {
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
