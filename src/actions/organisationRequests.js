import axios from 'axios';
import {
  ADD_ORGANISATION_REQUEST,
  ADD_ORGANISATION_REQUESTS,
  ADD_ORGANISATION_REQUESTS_REQUEST,
  SET_ORGANISATION_REQUESTS_LOADING,
  RESET_ORGANISATION_REQUESTS,
  ORGANISATION_REQUESTS_API,
  ORGANISATION_REQUESTS_CREATE_API,
} from '../constants/organisationRequests';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const getOrganisations = (query, isAdmin) => {
  const url = isAdmin ? ORGANISATION_REQUESTS_API : ORGANISATION_REQUESTS_API + '/my';
  return (dispatch) => {
    dispatch(loadingOrganisationRequests());
    return axios
      .get(url, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addOrganisationRequestsList(
            response.data.nodes.map((organisation_request) => organisation_request),
          ),
        );
        dispatch(
          addOrganisationRequestsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopOrganisationRequestsLoading());
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors &&
          error.response.data.errors.length > 0
        ) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      });
  };
};

export const addOrganisationRequest = (data) => {
  return (dispatch) => {
    dispatch(loadingOrganisationRequests());
    return axios
      .post(ORGANISATION_REQUESTS_CREATE_API, data)
      .then(() => {
        dispatch(resetOrganisationRequests());
        dispatch(addSuccessNotification('Organisation Request added'));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      });
  };
};

export const approveOrganisationRequest = (request_id, action) => {
  return (dispatch) => {
    dispatch(loadingOrganisationRequests());
    return axios
      .post(ORGANISATION_REQUESTS_API + '/' + request_id + '/' + action)
      .then(() => {
        dispatch(resetOrganisationRequests());
        dispatch(addSuccessNotification('Organisation Request ' + action + 'ed'));
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors &&
          error.response.data.errors.length > 0
        ) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      });
  };
};

export const addOrganisationRequests = (organisation_requests) => {
  return (dispatch) => {
    dispatch(
      addOrganisationRequestsList(
        organisation_requests.map((organisation_request) => organisation_request),
      ),
    );
  };
};

export const loadingOrganisationRequests = () => ({
  type: SET_ORGANISATION_REQUESTS_LOADING,
  payload: true,
});

export const stopOrganisationRequestsLoading = () => ({
  type: SET_ORGANISATION_REQUESTS_LOADING,
  payload: false,
});

export const getOrganisationRequestByID = (data) => ({
  type: ADD_ORGANISATION_REQUEST,
  payload: data,
});

export const addOrganisationRequestsList = (data) => ({
  type: ADD_ORGANISATION_REQUESTS,
  payload: data,
});

export const addOrganisationRequestsRequest = (data) => ({
  type: ADD_ORGANISATION_REQUESTS_REQUEST,
  payload: data,
});

export const resetOrganisationRequests = () => ({
  type: RESET_ORGANISATION_REQUESTS,
});
