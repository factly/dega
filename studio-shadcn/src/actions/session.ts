import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { ADD_SESSION, SET_SESSIONS_LOADING } from "../constants/session";
import { getUserInfo } from "../utils/zitadel";
import {
  SessionData,
  UserInfoResponse,
  AddSessionAction,
  SetLoadingAction,
  SessionActionTypes,
  SessionResponse,
  RootState,
} from "./types";

export interface GetSessionResponse {
  success: boolean;
  noToken?: boolean;
}

// Action creators
export const getSession = (): ThunkAction<
  Promise<GetSessionResponse>,
  RootState,
  unknown,
  SessionActionTypes
> => {
  return async (
    dispatch: Dispatch<SessionActionTypes>
  ): Promise<GetSessionResponse> => {
    dispatch(setLoading(true));

    try {
      const res: UserInfoResponse = await getUserInfo();

      if (res.error) {
        return { success: false, noToken: false };
      }

      if (res.data) {
        dispatch(addSession(res.data));
        return { success: true, noToken: false };
      }

      return { success: false, noToken: true };
    } catch (error) {
      console.error("Error in getSession:", error);
      return { success: false, noToken: false };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

const addSession = (session: SessionData): AddSessionAction => {
  return {
    type: ADD_SESSION,
    payload: session,
  };
};

const setLoading = (loading: boolean): SetLoadingAction => {
  return {
    type: SET_SESSIONS_LOADING,
    payload: loading,
  };
};

export type { SessionData, SessionResponse, SessionActionTypes };
