import axios from "axios";
import {
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
  API_SPACES,
  SET_SELECTED_SPACE,
  DELETE_SPACE_SUCCESS,
  UPDATE_SPACE_SUCCESS,
} from "../constants/spaces";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import getError, { ApiError } from "../utils/getError";
import { AppThunk } from "../store/types";

// Type Definitions
export interface Space {
  id: string;
  name: string;
  slug: string;
  site_title?: string;
  tag_line?: string;
  site_address?: string;
  description?: string;
  meta_fields?: string | Record<string, any>;
  organisation_id: string;
  org_role?: string;
}

export interface Organization {
  id: string;
  title: string;
  role: string;
  spaces: Space[];
}

// Action payload types
interface LoadingSpacesAction {
  type: typeof LOADING_SPACES;
  payload: boolean;
}

interface GetSpacesSuccessAction {
  type: typeof GET_SPACES_SUCCESS;
  payload: Organization[];
}

interface AddSpaceSuccessAction {
  type: typeof ADD_SPACE_SUCCESS;
  payload: Space;
}

interface UpdateSpaceSuccessAction {
  type: typeof UPDATE_SPACE_SUCCESS;
  payload: Space;
}

interface DeleteSpaceSuccessAction {
  type: typeof DELETE_SPACE_SUCCESS;
  payload: string;
}

interface SetSelectedSpaceAction {
  type: typeof SET_SELECTED_SPACE;
  payload: {
    id: string;
  };
}

// Union type for space actions
export type SpaceAction =
  | LoadingSpacesAction
  | GetSpacesSuccessAction
  | AddSpaceSuccessAction
  | UpdateSpaceSuccessAction
  | DeleteSpaceSuccessAction
  | SetSelectedSpaceAction;

// Action creators
export const loadingSpaces = (payload: boolean): LoadingSpacesAction => ({
  type: LOADING_SPACES,
  payload,
});

export const getSpacesSuccess = (
  organizations: Organization[]
): GetSpacesSuccessAction => ({
  type: GET_SPACES_SUCCESS,
  payload: organizations,
});

export const addSpaceSuccess = (space: Space): AddSpaceSuccessAction => ({
  type: ADD_SPACE_SUCCESS,
  payload: space,
});

export const updateSpaceSuccess = (data: Space): UpdateSpaceSuccessAction => ({
  type: UPDATE_SPACE_SUCCESS,
  payload: data,
});

export const deleteSpaceSuccess = (id: string): DeleteSpaceSuccessAction => ({
  type: DELETE_SPACE_SUCCESS,
  payload: id,
});

export const getSpaces = (): AppThunk<Promise<Organization[] | undefined>> => {
  return async (dispatch, getState) => {
    // Get current state
    const state = getState();
    const { spaces } = state;

    // If spaces have been fetched recently and we have data, don't fetch again
    if (
      spaces &&
      spaces.lastFetched &&
      Date.now() - spaces.lastFetched < 300000 &&
      spaces.orgs.length > 0
    ) {
      // Don't fetch again if we have data less than 5 minutes old
      return;
    }

    dispatch(loadingSpaces(true));
    try {
      const response = await axios.get(`${API_SPACES}/my`);
      const organizations: Organization[] = response.data;

      // Ensure we handle empty array correctly
      dispatch(getSpacesSuccess(organizations || []));
      return organizations;
    } catch (error) {
      dispatch(addErrorNotification(getError(error as ApiError)));
      // Also dispatch success with empty array to mark fetch as complete
      dispatch(getSpacesSuccess([]));
      return [];
    } finally {
      dispatch(loadingSpaces(false));
    }
  };
};

export const setSelectedSpace = (spaceId: string): AppThunk => {
  return (dispatch) => {
    localStorage.setItem("space", spaceId);

    axios.defaults.headers.common["X-Space"] = spaceId;

    dispatch({
      type: SET_SELECTED_SPACE,
      payload: {
        id: spaceId,
      },
    });

    dispatch(addSuccessNotification("Space changed"));
  };
};

export const addSpace = (
  data: Partial<Space>
): AppThunk<Promise<Space | undefined>> => {
  return async (dispatch) => {
    dispatch(loadingSpaces(true));
    try {
      const response = await axios.post(API_SPACES, data);
      dispatch(addSpaceSuccess(response.data));
      dispatch(addSuccessNotification("Space added"));
      return response.data;
    } catch (error) {
      dispatch(addErrorNotification(getError(error as ApiError)));
      throw error;
    } finally {
      dispatch(loadingSpaces(false));
    }
  };
};

export const deleteSpace = (id: string): AppThunk => {
  return async (dispatch) => {
    dispatch(loadingSpaces(true));
    try {
      await axios.delete(`${API_SPACES}/${id}`);
      dispatch(deleteSpaceSuccess(id));
      dispatch(addSuccessNotification("Space deleted"));
    } catch (error) {
      dispatch(addErrorNotification(getError(error as ApiError)));
      throw error;
    } finally {
      dispatch(loadingSpaces(false));
    }
  };
};

export const updateSpace = (
  data: Space
): AppThunk<Promise<Space | undefined>> => {
  return async (dispatch) => {
    dispatch(loadingSpaces(true));
    try {
      const response = await axios.put(API_SPACES, data);
      dispatch(updateSpaceSuccess(response.data));
      dispatch(addSuccessNotification("Space updated"));
      return response.data;
    } catch (error) {
      dispatch(addErrorNotification(getError(error as ApiError)));
      throw error;
    } finally {
      dispatch(loadingSpaces(false));
    }
  };
};
