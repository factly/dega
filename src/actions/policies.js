import axios from 'axios';
import {
  ADD_POLICY,
  ADD_POLICIES,
  ADD_POLICIES_REQUEST,
  SET_POLICIES_LOADING,
  RESET_POLICIES,
  POLICIES_API,
} from '../constants/policies';
import { addErrors } from './notifications';

export const getPolicies = (query) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .get(POLICIES_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addPoliciesList(response.data.nodes));
        dispatch(
          addPoliciesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopPoliciesLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const getPolicy = (id) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .get(POLICIES_API + '/' + id)
      .then((response) => {
        dispatch(getPolicyByID(response.data));
        dispatch(stopPoliciesLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addPolicy = (data) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .post(POLICIES_API, data)
      .then(() => {
        dispatch(resetPolicies());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const updatePolicy = (data) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .put(POLICIES_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getPolicyByID(response.data));
        dispatch(stopPoliciesLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const deletePolicy = (id) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .delete(POLICIES_API + '/' + id)
      .then(() => {
        dispatch(resetPolicies());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addPolicies = (policies) => {
  return (dispatch) => {
    dispatch(addPoliciesList(policies));
  };
};

const loadingPolicies = () => ({
  type: SET_POLICIES_LOADING,
  payload: true,
});

const stopPoliciesLoading = () => ({
  type: SET_POLICIES_LOADING,
  payload: false,
});

const getPolicyByID = (data) => ({
  type: ADD_POLICY,
  payload: data,
});

const addPoliciesList = (data) => ({
  type: ADD_POLICIES,
  payload: data,
});

const addPoliciesRequest = (data) => ({
  type: ADD_POLICIES_REQUEST,
  payload: data,
});

const resetPolicies = () => ({
  type: RESET_POLICIES,
});
