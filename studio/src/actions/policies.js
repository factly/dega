import axios from 'axios';
import {
  ADD_POLICY,
  ADD_POLICIES,
  ADD_POLICIES_REQUEST,
  SET_POLICIES_LOADING,
  RESET_POLICIES,
  POLICIES_API,
  UPDATE_POLICY,
  GET_POLICY,
} from '../constants/policies';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

// action to fetch all policies
export const addDefaultPolicies = (query) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .post(POLICIES_API + '/default')
      .then((response) => {
        dispatch(addPolicies(response.data.nodes));
        dispatch(
          addPoliciesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

// action to fetch all policies
export const getPolicies = (query) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .get(POLICIES_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addPolicies(response.data.nodes));
        dispatch(
          addPoliciesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

// action to fetch policy by id
export const getPolicy = (id) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .get(POLICIES_API + '/' + id)
      .then((response) => {
        dispatch(addPolicy(GET_POLICY, response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

// action to create policy
export const createPolicy = (data) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .post(POLICIES_API, data)
      .then(() => {
        dispatch(resetPolicies());
        dispatch(addSuccessNotification('Policy created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update policy by id
export const updatePolicy = (data) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .put(POLICIES_API + '/' + data.id, data)
      .then((response) => {
        dispatch(addPolicy(UPDATE_POLICY, response.data));
        dispatch(addSuccessNotification('Policy updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

// action to delete policy by id
export const deletePolicy = (id) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .delete(POLICIES_API + '/' + id)
      .then(() => {
        dispatch(resetPolicies());
        dispatch(addSuccessNotification('Policy deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingPolicies = () => ({
  type: SET_POLICIES_LOADING,
  payload: true,
});

export const stopPoliciesLoading = () => ({
  type: SET_POLICIES_LOADING,
  payload: false,
});

export const addPolicy = (type, payload) => ({
  type: ADD_POLICY,
  payload,
});

export const addPolicies = (payload) => ({
  type: ADD_POLICIES,
  payload,
});

export const addPoliciesRequest = (payload) => ({
  type: ADD_POLICIES_REQUEST,
  payload,
});

export const resetPolicies = () => ({
  type: RESET_POLICIES,
});
