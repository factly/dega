import axios from 'axios';
import {
  GET_CLAIMANTS_SUCCESS,
  GET_CLAIMANTS_FAILURE,
  ADD_CLAIMANT_FAILURE,
  ADD_CLAIMANT_SUCCESS,
  API_ADD_CLAIMANT,
  API_GET_CLAIMANTS,
  UPDATE_CLAIMANT_SUCCESS,
  UPDATE_CLAIMANT_FAILURE,
  DELETE_CLAIMANT_SUCCESS,
  DELETE_CLAIMANT_FAILURE,
  LOADING_CLAIMANTS,
  GET_CLAIMANT_SUCCESS,
  GET_CLAIMANT_FAILURE,
} from '../constants/claimants';

export const getClaimants = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingClaimants());
    return axios
      .get(API_GET_CLAIMANTS, {
        params: query,
      })
      .then((response) => {
        dispatch(getClaimantsSuccess(response.data, query));
      })
      .catch((error) => {
        dispatch(getClaimantsFailure(error.message));
      });
  };
};

export const getClaimant = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingClaimants());
    return axios
      .get(API_GET_CLAIMANTS + '/' + id)
      .then((response) => {
        dispatch(getClaimantSuccess(response.data));
      })
      .catch((error) => {
        dispatch(getClaimantFailure(error.message));
      });
  };
};

export const addClaimant = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingClaimants());
    return axios
      .post(API_ADD_CLAIMANT, data)
      .then((response) => {
        dispatch(addClaimantSuccess(response.data));
      })
      .catch((error) => {
        dispatch(addClaimantFailure(error.message));
      });
  };
};

export const updateClaimant = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingClaimants());
    return axios
      .put(API_ADD_CLAIMANT + '/' + data.id, data)
      .then((response) => {
        dispatch(updateClaimantSuccess(response.data));
      })
      .catch((error) => {
        dispatch(updateClaimantFailure(error.message));
      });
  };
};

export const deleteClaimant = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingClaimants());
    return axios
      .delete(API_ADD_CLAIMANT + '/' + id)
      .then(() => {
        dispatch(deleteClaimantSuccess(id));
      })
      .catch((error) => {
        dispatch(deleteClaimantFailure(error.message));
      });
  };
};

const loadingClaimants = () => ({
  type: LOADING_CLAIMANTS,
});

const getClaimantsSuccess = (data, query) => ({
  type: GET_CLAIMANTS_SUCCESS,
  payload: { data, query },
});

const getClaimantsFailure = (error) => ({
  type: GET_CLAIMANTS_FAILURE,
  payload: {
    error,
  },
});

const getClaimantSuccess = (data) => ({
  type: GET_CLAIMANT_SUCCESS,
  payload: data,
});

const getClaimantFailure = (error) => ({
  type: GET_CLAIMANT_FAILURE,
  payload: {
    error,
  },
});

const addClaimantSuccess = (data) => ({
  type: ADD_CLAIMANT_SUCCESS,
  payload: {
    ...data,
  },
});

const addClaimantFailure = (error) => ({
  type: ADD_CLAIMANT_FAILURE,
  payload: {
    error,
  },
});

const updateClaimantSuccess = (data) => ({
  type: UPDATE_CLAIMANT_SUCCESS,
  payload: {
    ...data,
  },
});

const updateClaimantFailure = (error) => ({
  type: UPDATE_CLAIMANT_FAILURE,
  payload: {
    error,
  },
});

const deleteClaimantSuccess = (id) => ({
  type: DELETE_CLAIMANT_SUCCESS,
  payload: id,
});

const deleteClaimantFailure = (error) => ({
  type: DELETE_CLAIMANT_FAILURE,
  payload: {
    error,
  },
});
