import axios from 'axios';
import { Dispatch } from 'redux';
import {
  ADD_MEDIA,
  ADD_MEDIA_REQUEST,
  SET_MEDIA_LOADING,
  RESET_MEDIA,
  MEDIA_API,
  GET_MEDIUM,
  UPDATE_MEDIUM,
} from '../constants/media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

// Types
interface Medium {
  id: number;
  [key: string]: any; // Add specific medium properties here
}

interface MediaResponse {
  nodes: Medium[];
  total: number;
}

interface QueryParams {
  [key: string]: string | number | boolean;
}

// Action Types
interface SetMediaLoadingAction {
  type: typeof SET_MEDIA_LOADING;
  payload: boolean;
}

interface AddMediaAction {
  type: typeof ADD_MEDIA;
  payload: Medium[];
}

interface AddMediaRequestAction {
  type: typeof ADD_MEDIA_REQUEST;
  payload: {
    data: number[];
    query: QueryParams;
    total: number;
  };
}

interface GetMediumAction {
  type: typeof GET_MEDIUM;
  payload: Medium;
}

interface UpdateMediumAction {
  type: typeof UPDATE_MEDIUM;
  payload: Medium;
}

interface ResetMediaAction {
  type: typeof RESET_MEDIA;
}

type MediaActionTypes = 
  | SetMediaLoadingAction 
  | AddMediaAction 
  | AddMediaRequestAction 
  | GetMediumAction 
  | UpdateMediumAction 
  | ResetMediaAction;

// Action Creators
export const getMedia = (query: QueryParams, profile?: boolean) => {
  return (dispatch: Dispatch<MediaActionTypes>) => {
    dispatch(loadingMedia());
    return axios
      .get<MediaResponse>(MEDIA_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addMedia(response.data.nodes));
        dispatch(
          addMediaRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

export const getMedium = (id: number, profile?: boolean) => {
  return (dispatch: Dispatch<MediaActionTypes>) => {
    dispatch(loadingMedia());
    return axios
      .get<Medium>(`${MEDIA_API}/${id}`)
      .then((response) => {
        dispatch({ type: GET_MEDIUM, payload: response.data });
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

export const createMedium = (data: Medium | Medium[], profile?: boolean) => {
  return (dispatch: Dispatch<MediaActionTypes>) => {
    dispatch(loadingMedia());
    return axios
      .post<profile ? Medium : MediaResponse>(MEDIA_API, profile ? (data as Medium[])[0] : data)
      .then((response) => {
        dispatch(resetMedia());
        dispatch(addSuccessNotification('Medium created'));
        return profile ? response.data : (response.data as MediaResponse).nodes[0];
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updateMedium = (data: Medium) => {
  return (dispatch: Dispatch<MediaActionTypes>) => {
    dispatch(loadingMedia());
    return axios
      .put<Medium>(`${MEDIA_API}/${data.id}`, data)
      .then((response) => {
        dispatch({ type: UPDATE_MEDIUM, payload: response.data });
        dispatch(addSuccessNotification('Medium updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopMediaLoading()));
  };
};

export const deleteMedium = (id: number) => {
  return (dispatch: Dispatch<MediaActionTypes>) => {
    dispatch(loadingMedia());
    return axios
      .delete(`${MEDIA_API}/${id}`)
      .then(() => {
        dispatch(resetMedia());
        dispatch(addSuccessNotification('Medium deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingMedia = (): SetMediaLoadingAction => ({
  type: SET_MEDIA_LOADING,
  payload: true,
});

export const stopMediaLoading = (): SetMediaLoadingAction => ({
  type: SET_MEDIA_LOADING,
  payload: false,
});

export const addMedia = (data: Medium[]): AddMediaAction => ({
  type: ADD_MEDIA,
  payload: data,
});

export const addMediaRequest = (data: {
  data: number[];
  query: QueryParams;
  total: number;
}): AddMediaRequestAction => ({
  type: ADD_MEDIA_REQUEST,
  payload: data,
});

export const resetMedia = (): ResetMediaAction => ({
  type: RESET_MEDIA,
});