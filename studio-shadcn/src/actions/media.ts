import axios from "axios";
import {
  ADD_MEDIA,
  ADD_MEDIA_REQUEST,
  SET_MEDIA_LOADING,
  RESET_MEDIA,
  MEDIA_API,
  GET_MEDIUM,
  UPDATE_MEDIUM,
} from "../constants/media";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import getError from "../utils/getError";
import { Dispatch } from "redux";
import { AppThunk } from "../store/types";

// Types
export interface Medium {
  id: string | number;
  name?: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  url?: {
    proxy?: string;
    raw: string;
  };
  [key: string]: any;
}

interface MediaRequestPayload {
  data: (string | number)[];
  query: Record<string, any>;
  total: number;
}

interface MediaAction {
  type: string;
  payload?: any;
}

// Helper function to get space ID
const getSpaceId = (): string => {
  return localStorage.getItem("space") || "";
};

// Action to fetch media
export const getMedia = (
  query: Record<string, any>,
  profile?: boolean
): AppThunk => {
  return (dispatch: Dispatch<MediaAction>) => {
    dispatch(loadingMedia());

    // Get the space ID
    const spaceId = getSpaceId();

    return axios
      .get(MEDIA_API, {
        params: query,
        headers: {
          "X-Space": spaceId,
        },
      })
      .then((response) => {
        dispatch(addMedia(response.data.nodes));
        dispatch(
          addMediaRequest({
            data: response.data.nodes.map((item: Medium) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

// Action to fetch medium by id
export const getMedium = (
  id: string | number,
  profile?: boolean
): AppThunk<Promise<void>> => {
  return (dispatch: Dispatch<MediaAction>) => {
    dispatch(loadingMedia());
    const spaceId = getSpaceId();

    return axios
      .get(`${MEDIA_API}/${id}`, {
        headers: {
          "X-Space": spaceId,
        },
      })
      .then((response) => {
        dispatch({ type: GET_MEDIUM, payload: response.data });
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

// Action to create medium
export const createMedium = (
  data: Medium | Medium[],
  profile?: boolean
): AppThunk<Promise<Medium>> => {
  return (dispatch: Dispatch<MediaAction>) => {
    dispatch(loadingMedia());
    const spaceId = getSpaceId();

    return axios
      .post(
        MEDIA_API,
        profile ? (Array.isArray(data) ? data[0] : data) : data,
        {
          headers: {
            "X-Space": spaceId,
          },
        }
      )
      .then((response) => {
        dispatch(resetMedia());
        dispatch(addSuccessNotification("Medium created"));
        return profile
          ? response.data
          : Array.isArray(response.data.nodes)
          ? response.data.nodes[0]
          : response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        throw error; // Re-throw to allow error handling in components
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

// Action to update medium
export const updateMedium = (data: Medium): AppThunk<Promise<void>> => {
  return (dispatch: Dispatch<MediaAction>) => {
    dispatch(loadingMedia());
    const spaceId = getSpaceId();

    return axios
      .put(`${MEDIA_API}/${data.id}`, data, {
        headers: {
          "X-Space": spaceId,
        },
      })
      .then((response) => {
        dispatch({ type: UPDATE_MEDIUM, payload: response.data });
        dispatch(addSuccessNotification("Medium updated"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

// Action to delete medium by id
export const deleteMedium = (id: string | number): AppThunk<Promise<void>> => {
  return (dispatch: Dispatch<MediaAction>) => {
    dispatch(loadingMedia());
    const spaceId = getSpaceId();

    return axios
      .delete(`${MEDIA_API}/${id}`, {
        headers: {
          "X-Space": spaceId,
        },
      })
      .then(() => {
        dispatch(resetMedia());
        dispatch(addSuccessNotification("Medium deleted"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

export const loadingMedia = (): MediaAction => ({
  type: SET_MEDIA_LOADING,
  payload: true,
});

export const stopMediaLoading = (): MediaAction => ({
  type: SET_MEDIA_LOADING,
  payload: false,
});

export const addMedia = (data: Medium[]): MediaAction => ({
  type: ADD_MEDIA,
  payload: data,
});

export const addMediaRequest = (data: MediaRequestPayload): MediaAction => ({
  type: ADD_MEDIA_REQUEST,
  payload: data,
});

export const resetMedia = (): MediaAction => ({
  type: RESET_MEDIA,
});
