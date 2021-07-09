import axios from 'axios';
import {
  ADD_POLICY,
  ADD_POLICIES,
  ADD_POLICIES_REQUEST,
  SET_POLICIES_LOADING,
  RESET_POLICIES,
  POLICIES_API,
} from '../constants/policies';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

export const addDefaultPolicies = (query) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .post(POLICIES_API + '/default')
      .then((response) => {
        dispatch(addPoliciesList(response.data.nodes));
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
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

export const getPolicy = (id) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .get(POLICIES_API + '/' + id)
      .then((response) => {
        dispatch(getPolicyByID(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

export const addPolicy = (data) => {
  return (dispatch) => {
    dispatch(loadingPolicies());
    return axios
      .post(POLICIES_API, data)
      .then(() => {
        dispatch(resetPolicies());
        dispatch(addSuccessNotification('Policy added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
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
        dispatch(addSuccessNotification('Policy updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

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

export const addPolicies = (policies) => {
  return (dispatch) => {
    dispatch(addPoliciesList(policies));
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

export const getPolicyByID = (data) => ({
  type: ADD_POLICY,
  payload: data,
});

export const addPoliciesList = (data) => ({
  type: ADD_POLICIES,
  payload: data,
});

export const addPoliciesRequest = (data) => ({
  type: ADD_POLICIES_REQUEST,
  payload: data,
});

export const resetPolicies = () => ({
  type: RESET_POLICIES,
});
