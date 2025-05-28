import axios from "axios";
import {
  PERMISSIONS_API,
  ADD_PERMISSIONS_REQUEST,
  SET_PERMISSIONS_LOADING,
  ADD_PERMISSIONS,
} from "../constants/permissions";
import { addErrorNotification } from "./notifications";
import getError from "../utils/getError";

// Define interfaces
interface Permission {
  [key: string]: any;
}

interface PermissionPayload {
  data: Permission;
  user_id: number;
}

interface PermissionAction {
  type: string;
  payload: any;
}

export const getPermissions = (id: string | number) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingPermissions());
    return axios
      .get(`${PERMISSIONS_API}${id}/permissions`)
      .then((response) => {
        const payload: PermissionPayload = {
          data: response.data,
          user_id: parseInt(id.toString()),
        };
        dispatch(addPermission(payload));
        dispatch(addRequest([parseInt(id.toString())]));

        return payload;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const addPermission = (data: PermissionPayload): PermissionAction => ({
  type: ADD_PERMISSIONS,
  payload: data,
});

export const addRequest = (data: number[]): PermissionAction => ({
  type: ADD_PERMISSIONS_REQUEST,
  payload: data,
});

export const loadingPermissions = (): PermissionAction => ({
  type: SET_PERMISSIONS_LOADING,
  payload: true,
});

export const stopLoading = (): PermissionAction => ({
  type: SET_PERMISSIONS_LOADING,
  payload: false,
});
