import axios from "axios";
import {
  SET_AUTHORS_LOADING,
  ADD_AUTHORS,
  AUTHORS_API,
  ADD_AUTHORS_REQUEST,
} from "../constants/authors";
import { addErrorNotification } from "./notifications";
import getError from "../utils/getError";
import { Dispatch } from "redux";

// Define interfaces for the data structures
interface Author {
  id: string | number;
  [key: string]: any; // Additional author properties
}

interface AuthorsResponse {
  nodes: Author[];
  total: number;
}

interface AuthorsRequestData {
  data: (string | number)[];
  query: Record<string, any>;
  total: number;
}

interface AuthorsAction {
  type: string;
  payload: any;
}

// Define action creator return types
type AppThunk<ReturnType = void> = (
  dispatch: Dispatch<AuthorsAction>
) => ReturnType;

export const getAuthors = (
  query: Record<string, any>
): AppThunk<Promise<void>> => {
  return (dispatch: Dispatch<AuthorsAction>) => {
    dispatch(loadingAuthors());
    return axios
      .get<AuthorsResponse>(AUTHORS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addAuthorsList(response.data.nodes));
        dispatch(
          addAuthorsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopAuthorsLoading()));
  };
};

export const addAuthors = (authors: Author[]): AppThunk => {
  return (dispatch: Dispatch<AuthorsAction>) => {
    dispatch(addAuthorsList(authors));
  };
};

export const loadingAuthors = (): AuthorsAction => ({
  type: SET_AUTHORS_LOADING,
  payload: true,
});

export const stopAuthorsLoading = (): AuthorsAction => ({
  type: SET_AUTHORS_LOADING,
  payload: false,
});

export const addAuthorsList = (data: Author[]): AuthorsAction => ({
  type: ADD_AUTHORS,
  payload: data,
});

export const addAuthorsRequest = (data: AuthorsRequestData): AuthorsAction => ({
  type: ADD_AUTHORS_REQUEST,
  payload: data,
});
