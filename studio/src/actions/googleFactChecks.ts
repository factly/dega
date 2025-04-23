import axios from "axios";
import {
  GOOGLE_FACT_CHECKS_API,
  ADD_GOOGLE_FACT_CHECKS_REQUEST,
  SET_GOOGLE_FACT_CHECKS_LOADING,
} from "../constants/googleFactChecks";
import { addErrorNotification } from "./notifications";
import getError from "../utils/getError";

interface GoogleFactCheckNode {
  id: string;
  [key: string]: any;
}

interface GoogleFactChecksResponse {
  nodes: GoogleFactCheckNode[];
  total: number;
  nextPage?: string;
}

export interface Query {
  [key: string]: string | number | boolean | undefined;
}

interface RequestPayload {
  data: GoogleFactCheckNode[];
  query: Query;
  total: number;
  nextPage?: string;
}

interface AddRequestAction {
  type: typeof ADD_GOOGLE_FACT_CHECKS_REQUEST;
  payload: RequestPayload;
}

interface SetLoadingAction {
  type: typeof SET_GOOGLE_FACT_CHECKS_LOADING;
  payload: boolean;
}

type GoogleFactChecksAction = AddRequestAction | SetLoadingAction;

export const getGoogleFactChecks = (query: Query) => {
  return (dispatch: (action: GoogleFactChecksAction | any) => void) => {
    dispatch(loadingGoogleFactChecks());
    return axios
      .get<GoogleFactChecksResponse>(GOOGLE_FACT_CHECKS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addRequest({
            data: response.data.nodes,
            query: query,
            total: response.data.total,
            nextPage: response.data.nextPage,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const addRequest = (data: RequestPayload): AddRequestAction => ({
  type: ADD_GOOGLE_FACT_CHECKS_REQUEST,
  payload: data,
});

export const loadingGoogleFactChecks = (): SetLoadingAction => ({
  type: SET_GOOGLE_FACT_CHECKS_LOADING,
  payload: true,
});

export const stopLoading = (): SetLoadingAction => ({
  type: SET_GOOGLE_FACT_CHECKS_LOADING,
  payload: false,
});
