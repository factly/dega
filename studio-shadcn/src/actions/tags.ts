import axios from "axios";
import {
  ADD_TAGS,
  ADD_TAGS_REQUEST,
  SET_TAGS_LOADING,
  RESET_TAGS,
  TAGS_API,
  GET_TAG,
  UPDATE_TAG,
} from "../constants/tags";
import {
  addErrorNotification,
  addSuccessNotification,
  NotificationAction,
} from "./notifications";
import getError from "../utils/getError";
import { Dispatch, AnyAction, UnknownAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../store/index";

// Define interfaces
interface Tag {
  id: number;
  description: {
    json: any;
    html: string;
  };
  description_html?: string;
  [key: string]: any;
}

interface TagsResponse {
  nodes: Tag[];
  total: number;
}

interface TagsRequestPayload {
  data: number[];
  query: any;
  total: number;
}

type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction | NotificationAction
>;

// action to fetch tags
export const getTags = (query: any): AppThunk => {
  return (
    dispatch: Dispatch<UnknownAction | NotificationAction>,
    getState: () => RootState
  ) => {
    const currentSpaceID = getState().spaces?.selected;
    if (currentSpaceID === 0) {
      return;
    }
    dispatch(loadingTags());
    return axios
      .get<TagsResponse>(TAGS_API, {
        params: query,
      })
      .then((response) => {
        if (response.data.nodes?.length) {
          response.data.nodes.forEach((tag) => {
            tag.description = {
              json: tag.description,
              html: tag.description_html,
            };
          });
        }
        dispatch(addTags(response.data.nodes));
        dispatch(
          addTagsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopTagsLoading()));
  };
};

// action to fetch tag by id
export const getTag = (id: number): AppThunk => {
  return (dispatch: Dispatch<UnknownAction | NotificationAction>) => {
    dispatch(loadingTags());
    return axios
      .get<Tag>(`${TAGS_API}/${id}`)
      .then((response) => {
        response.data.description = {
          json: response.data.description,
          html: response.data.description_html || "",
        };
        dispatch(addTag(GET_TAG, response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopTagsLoading()));
  };
};

// action to create tag
export const createTag = (data: Omit<Tag, "id">): AppThunk => {
  return (dispatch: Dispatch<UnknownAction | NotificationAction>) => {
    dispatch(loadingTags());
    return axios
      .post(TAGS_API, data)
      .then(() => {
        dispatch(resetTags());
        dispatch(addSuccessNotification("Tag created"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update tag by id
export const updateTag = (data: Tag): AppThunk => {
  return (dispatch: Dispatch<UnknownAction | NotificationAction>) => {
    dispatch(loadingTags());
    return axios
      .put<Tag>(`${TAGS_API}/${data.id}`, data)
      .then((response) => {
        response.data.description = {
          json: response.data.description,
          html: response.data.description_html || "",
        };
        dispatch(addTag(UPDATE_TAG, response.data));
        dispatch(addSuccessNotification("Tag updated"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopTagsLoading()));
  };
};

// action to delete tag by id
export const deleteTag = (id: number): AppThunk => {
  return (dispatch: Dispatch<UnknownAction | NotificationAction>) => {
    dispatch(loadingTags());
    return axios
      .delete(`${TAGS_API}/${id}`)
      .then(() => {
        dispatch(resetTags());
        dispatch(addSuccessNotification("Tag deleted"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingTags = () => ({
  type: SET_TAGS_LOADING,
  payload: true,
});

export const stopTagsLoading = () => ({
  type: SET_TAGS_LOADING,
  payload: false,
});

export const addTag = (type: string, payload: Tag) => ({
  type,
  payload,
});

export const addTags = (data: Tag[]) => ({
  type: ADD_TAGS,
  payload: data,
});

export const addTagsRequest = (data: TagsRequestPayload) => ({
  type: ADD_TAGS_REQUEST,
  payload: data,
});

export const resetTags = () => ({
  type: RESET_TAGS,
});
