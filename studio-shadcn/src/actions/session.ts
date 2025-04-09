import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { ADD_SESSION, SET_SESSIONS_LOADING } from "../constants/session";
import {
  SessionData,
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

export interface UserInfoResponse {
  data?: any;
  error?: string;
}

// Action creators
export const getUserInfo = async (): Promise<UserInfoResponse> => {
  try {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      return { error: "No session token found" };
    }

    const response = await fetch(
      `${import.meta.env.VITE_ZITADEL_AUTHORITY}/oidc/v1/userinfo`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      return { data };
    }

    return { error: `Request failed with status: ${response.status}` };
  } catch (error) {
    console.error("UserInfo error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Error fetching user info",
    };
  }
};

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

      return { success: false, noToken: false };
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