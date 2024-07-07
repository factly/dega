import axios from 'axios';
import { addErrorNotification, addSuccessNotification } from './notifications';
import {
  ADD_SPACE_USERS,
  ADD_SPACE_USERS_REQUEST,
  SET_SPACE_USERS_LOADING,
  SPACE_USERS_API,
} from '../constants/spaceUsers';
import getError from '../utils/getError';

export const addSpaceUsers = (payload) => ({
  type: ADD_SPACE_USERS,
  payload,
});

export const getSpaceUsers = (query) => {
  return (dispatch) => {
    dispatch(loadingSpaceUsers(true));
    return axios
      .get(SPACE_USERS_API, {
        params: query,
      })
      .then((res) => {
        dispatch(addSpaceUsers(res.data.nodes));
        dispatch(
          addUsersRequest({
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
        dispatch(loadingSpaceUsers(false));
      });
  };
};

export const updateSpaceUsers = (data) => {
  return (dispatch) => {
    dispatch(loadingSpaceUsers(true));
    return axios
      .put(`/core/spaces/users`, data)
      .then((response) => {
        dispatch(addSuccessNotification('User Added Successfully'));
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => {
        dispatch(loadingSpaceUsers(false));
      });
  };
};

export const addSpaceUser = (data, setUser, setShowModal) => {
  return (dispatch) => {
    return axios
      .post(SPACE_USERS_API, {
        name: data.name,
        description: data.description,
      })
      .then((res) => {
        setUser(res.data.user);
        setShowModal(true);
        dispatch(addSuccessNotification('User Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};
export const deleteSpaceUser = (id) => {
  return (dispatch) => {
    return axios
      .delete(`${SPACE_USERS_API}/${id}`)
      .then(() => {
        dispatch(addSuccessNotification('User Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const loadingSpaceUsers = (payload) => ({
  type: SET_SPACE_USERS_LOADING,
  payload,
});

export const addUsersRequest = (data) => ({
  type: ADD_SPACE_USERS_REQUEST,
  payload: data,
});
