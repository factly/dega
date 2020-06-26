import axios from 'axios';
import {
  LOADING_POLICIES,
  ADD_POLICY_SUCCESS,
  ADD_POLICY_FAILURE,
  API_ADD_POLICY,
  API_GET_POLICIES,
  GET_POLICIES_SUCCESS,
  GET_POLICIES_FAILURE,
  DELETE_POLICY_SUCCESS,
  DELETE_POLICY_FAILURE,
} from '../constants/policies';

export const getPolicies = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingPolicies());
    return axios
      .get(API_GET_POLICIES, {
        params: query,
      })
      .then((response) => {
        dispatch(getPoliciesSuccess(response.data, query));
      })
      .catch((error) => {
        dispatch(getPoliciesFailure(error.message));
      });
  };
};

export const addPolicy = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingPolicies());
    return axios
      .post(API_ADD_POLICY, data)
      .then((response) => {
        dispatch(addPolicySuccess(response.data));
      })
      .catch((error) => {
        dispatch(addPolicyFailure(error.message));
      });
  };
};

export const deletePolicy = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingPolicies());
    return axios
      .delete(API_GET_POLICIES + '/' + id)
      .then(() => {
        dispatch(deletePolicySuccess(id));
      })
      .catch((error) => {
        dispatch(deletePolicyFailure(error.message));
      });
  };
};

const loadingPolicies = () => ({
  type: LOADING_POLICIES,
});

const getPoliciesSuccess = (data, query) => ({
  type: GET_POLICIES_SUCCESS,
  payload: { data, query },
});

const getPoliciesFailure = (error) => ({
  type: GET_POLICIES_FAILURE,
  payload: {
    error,
  },
});

const addPolicySuccess = (data) => ({
  type: ADD_POLICY_SUCCESS,
  payload: data,
});

const addPolicyFailure = (error) => ({
  type: ADD_POLICY_FAILURE,
  payload: {
    error,
  },
});

const deletePolicySuccess = (id) => ({
  type: DELETE_POLICY_SUCCESS,
  payload: id,
});

const deletePolicyFailure = (error) => ({
  type: DELETE_POLICY_FAILURE,
  payload: {
    error,
  },
});
