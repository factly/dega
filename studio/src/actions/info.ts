import axios from "axios";
import { ADD_INFO, INFO_API, SET_INFO_LOADING } from "../constants/info";
import getError from "../utils/getError";
import { addErrorNotification, NotificationAction } from "./notifications";
import { Dispatch, Action } from "redux";

// Define types for our actions
interface AddInfoAction extends Action {
  type: typeof ADD_INFO;
  payload: any;
}

interface SetInfoLoadingAction extends Action {
  type: typeof SET_INFO_LOADING;
  payload: boolean;
}

// Union type for all info actions
type InfoActionTypes =
  | AddInfoAction
  | SetInfoLoadingAction
  | NotificationAction;

// Thunk action creator type
type ThunkResult<R> = (dispatch: Dispatch<InfoActionTypes>) => R;

export const getInfo = (): ThunkResult<Promise<void>> => {
  return (dispatch: Dispatch<InfoActionTypes>): Promise<void> => {
    dispatch(loadingInfo(true));

    return axios
      .get(INFO_API)
      .then((response) => {
        dispatch(addInfo(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(loadingInfo(false));
      });
  };
};

export const addInfo = (data: any): AddInfoAction => ({
  type: ADD_INFO,
  payload: data,
});

export const loadingInfo = (payload: boolean): SetInfoLoadingAction => ({
  type: SET_INFO_LOADING,
  payload,
});
