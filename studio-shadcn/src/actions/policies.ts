import axios from "axios";
import {
  ADD_POLICIES,
  ADD_POLICIES_REQUEST,
  SET_POLICIES_LOADING,
  RESET_POLICIES,
  POLICIES_API,
  UPDATE_POLICY,
  GET_POLICY,
} from "../constants/policies";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import getError from "../utils/getError";

// Define interfaces
interface Policy {
  id: string;
  [key: string]: any;
}

interface PolicyAction {
  type: string;
  payload: any;
}

interface PolicyRequestData {
  data: string[];
  query: any;
  total: number;
}

// action to fetch all policies
export const addDefaultPolicies = (query: any) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingPolicies());
    return axios
      .post(`${POLICIES_API}/default`)
      .then((response) => {
        dispatch(addPolicies(response.data));
        dispatch(
          addPoliciesRequest({
            data: response.data.map((item: Policy) => item.id),
            query: query,
            total: response.data.length,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

// action to fetch all policies
export const getPolicies = (query: any) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingPolicies());
    return axios
      .get(POLICIES_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addPolicies(response.data.nodes));
        dispatch(
          addPoliciesRequest({
            data: response.data.nodes.map((item: Policy) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

// action to fetch policy by id
export const getPolicy = (id: string) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingPolicies());
    return axios
      .get(`${POLICIES_API}/${id}`)
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
export const createPolicy = (data: Omit<Policy, "id">) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingPolicies());
    return axios
      .post(POLICIES_API, data)
      .then(() => {
        dispatch(resetPolicies());
        dispatch(addSuccessNotification("Policy created"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update policy by id
export const updatePolicy = (data: Policy) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingPolicies());
    return axios
      .put(`${POLICIES_API}/${data.id}`, data)
      .then((response) => {
        dispatch(addPolicy(UPDATE_POLICY, response.data));
        dispatch(addSuccessNotification("Policy updated"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPoliciesLoading()));
  };
};

// action to delete policy by id
export const deletePolicy = (id: string) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingPolicies());
    return axios
      .delete(`${POLICIES_API}/${id}`)
      .then(() => {
        dispatch(resetPolicies());
        dispatch(addSuccessNotification("Policy deleted"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingPolicies = (): PolicyAction => ({
  type: SET_POLICIES_LOADING,
  payload: true,
});

export const stopPoliciesLoading = (): PolicyAction => ({
  type: SET_POLICIES_LOADING,
  payload: false,
});

export const addPolicy = (type: string, payload: Policy): PolicyAction => ({
  type,
  payload,
});

export const addPolicies = (payload: Policy[]): PolicyAction => ({
  type: ADD_POLICIES,
  payload,
});

export const addPoliciesRequest = (
  payload: PolicyRequestData
): PolicyAction => ({
  type: ADD_POLICIES_REQUEST,
  payload,
});

export const resetPolicies = (): PolicyAction => ({
  type: RESET_POLICIES,
});
