import axios from 'axios';
import { API_GET_SPACES, ADD_SPACE_TOKENS } from '../constants/spaces';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const addSpaceTokens = (spaceID, data) => ({
  type: ADD_SPACE_TOKENS,
  payload: {
    spaceID: spaceID,
    data: data,
  },
});

export const getSpaceTokens = (spaceID) => {
  return (dispatch, getState) => {
    return axios
      .get(`${API_GET_SPACES}/${getState().spaces.selected}/tokens`)
      .then((res) => {
        dispatch(addSpaceTokens(spaceID, { tokens: res.data, id: getState().spaces.selected }));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {});
  };
};

export const addSpaceToken = (data, setToken, setShowModal) => {
  return (dispatch, getState) => {
    return axios
      .post(`${API_GET_SPACES}/${getState().spaces.selected}/tokens`, {
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
      })
      .finally(() => {});
  };
};
export const deleteSpaceToken = (id) => {
  return (dispatch, getState) => {
    return axios
      .delete(`${API_GET_SPACES}/${getState().spaces.selected}/tokens/${id}`)
      .then(() => {
        dispatch(addSuccessNotification('Token Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {});
  };
};
