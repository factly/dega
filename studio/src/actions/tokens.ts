import axios from "axios";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import {
  ADD_SPACE_TOKENS,
  ADD_SPACE_TOKENS_REQUEST,
  SET_SPACE_TOKENS_LOADING,
  SPACE_TOKENS_API,
} from "../constants/tokens";

// Define interfaces
interface TokenData {
  id: string;
  name: string;
  description: string;
  [key: string]: any; // For any additional properties
}

interface TokenFormData {
  name: string;
  description: string;
}

interface TokenAction {
  type: string;
  payload: any;
}

interface TokenRequestData {
  data: string[];
  query: any;
  total: number;
}

// Action creators
export const addSpaceTokens = (payload: TokenData[]): TokenAction => ({
  type: ADD_SPACE_TOKENS,
  payload,
});

export const getSpaceTokens = (query: any) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingSpaceTokens(true));
    return axios
      .get(SPACE_TOKENS_API, {
        params: query,
      })
      .then((res) => {
        dispatch(addSpaceTokens(res.data.nodes));
        dispatch(
          addTokensRequest({
            data: res.data.nodes.map((item: TokenData) => item.id),
            query: query,
            total: res.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(loadingSpaceTokens(false));
      });
  };
};

export const addSpaceToken = (
  data: TokenFormData,
  setToken: (token: string) => void,
  setShowModal: (show: boolean) => void
) => {
  return (dispatch: (action: any) => void) => {
    return axios
      .post(SPACE_TOKENS_API, {
        name: data.name,
        description: data.description,
      })
      .then((res) => {
        setToken(res.data.token);
        setShowModal(true);
        dispatch(addSuccessNotification("Token Added Successfully"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteSpaceToken = (id: string) => {
  return (dispatch: (action: any) => void) => {
    return axios
      .delete(`${SPACE_TOKENS_API}/${id}`)
      .then(() => {
        dispatch(addSuccessNotification("Token Deleted Successfully"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const loadingSpaceTokens = (payload: boolean): TokenAction => ({
  type: SET_SPACE_TOKENS_LOADING,
  payload,
});

export const addTokensRequest = (data: TokenRequestData): TokenAction => ({
  type: ADD_SPACE_TOKENS_REQUEST,
  payload: data,
});
