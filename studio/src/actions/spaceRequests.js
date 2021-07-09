import axios from 'axios';
import {
  ADD_SPACE_REQUEST,
  ADD_SPACE_REQUESTS,
  ADD_SPACE_REQUESTS_REQUEST,
  SET_SPACE_REQUESTS_LOADING,
  RESET_SPACE_REQUESTS,
  SPACE_REQUESTS_API,
  SPACE_REQUESTS_CREATE_API,
} from '../constants/spaceRequests';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

export const getSpaces = (query, isAdmin) => {
  const url = isAdmin ? SPACE_REQUESTS_API : SPACE_REQUESTS_API + '/my';
  return (dispatch) => {
    dispatch(loadingSpaceRequests());
    return axios
      .get(url, {
        params: query,
      })
      .then((response) => {
        dispatch(addSpaceRequestsList(response.data.nodes.map((space_request) => space_request)));
        dispatch(
          addSpaceRequestsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopSpaceRequestsLoading()));
  };
};

export const addSpaceRequest = (data) => {
  return (dispatch) => {
    dispatch(loadingSpaceRequests());
    return axios
      .post(SPACE_REQUESTS_CREATE_API, data)
      .then(() => {
        dispatch(resetSpaceRequests());
        dispatch(addSuccessNotification('Space Request added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const approveSpaceRequest = (request_id, action) => {
  return (dispatch) => {
    dispatch(loadingSpaceRequests());
    return axios
      .post(SPACE_REQUESTS_API + '/' + request_id + '/' + action)
      .then(() => {
        dispatch(resetSpaceRequests());
        dispatch(addSuccessNotification('Space Request ' + action + 'ed'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addSpaceRequests = (space_requests) => {
  return (dispatch) => {
    dispatch(addSpaceRequestsList(space_requests.map((space_request) => space_request)));
  };
};

export const loadingSpaceRequests = () => ({
  type: SET_SPACE_REQUESTS_LOADING,
  payload: true,
});

export const stopSpaceRequestsLoading = () => ({
  type: SET_SPACE_REQUESTS_LOADING,
  payload: false,
});

export const getSpaceRequestByID = (data) => ({
  type: ADD_SPACE_REQUEST,
  payload: data,
});

export const addSpaceRequestsList = (data) => ({
  type: ADD_SPACE_REQUESTS,
  payload: data,
});

export const addSpaceRequestsRequest = (data) => ({
  type: ADD_SPACE_REQUESTS_REQUEST,
  payload: data,
});

export const resetSpaceRequests = () => ({
  type: RESET_SPACE_REQUESTS,
});
