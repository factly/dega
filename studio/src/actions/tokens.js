import axios from 'axios';
import { addErrorNotification, addSuccessNotification } from './notifications';
import {
  ADD_SPACE_TOKENS,
  ADD_SPACE_TOKENS_REQUEST,
  SET_SPACE_TOKENS_LOADING,
  SPACE_TOKENS_API,
} from '../constants/tokens';

export const addSpaceTokens = (payload) => ({
  type: ADD_SPACE_TOKENS,
  payload,
});

export const getSpaceTokens = (query) => {
  return (dispatch) => {
    dispatch(loadingSpaceTokens(true));
    return axios
      .get(SPACE_TOKENS_API, {
        params: query,
      })
      .then((res) => {
        dispatch(addSpaceTokens(res.data.nodes));
        dispatch(
          addTokensRequest({
            data: res.data.nodes.map((item) => item.id),
            query: query,
            total: res.data.total,
          }),
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

export const addSpaceToken = (data, setToken, setShowModal) => {
  return (dispatch) => {
    return axios
      .post(SPACE_TOKENS_API, {
        name: data.name,
        description: data.description,
      })
      .then((res) => {
        setToken(res.data.token);
        setShowModal(true);
        dispatch(addSuccessNotification('Token Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};
export const deleteSpaceToken = (id) => {
  return (dispatch) => {
    return axios
      .delete(`${SPACE_TOKENS_API}/${id}`)
      .then(() => {
        dispatch(addSuccessNotification('Token Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const loadingSpaceTokens = (payload) => ({
  type: SET_SPACE_TOKENS_LOADING,
  payload,
});

export const addTokensRequest = (data) => ({
  type: ADD_SPACE_TOKENS_REQUEST,
  payload: data,
});
