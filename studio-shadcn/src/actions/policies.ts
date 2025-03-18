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
import { ThunkAction } from "redux-thunk";
import { Action } from "redux";
import { RootState } from "../store";

// Define interfaces
export interface Policy {
  id: string;
  name: string;
  description?: string;
  permissions?: {
    resource: string;
    actions: string[];
  }[];
  [key: string]: any;
}

export interface PolicyAction {
  type: string;
  payload: any;
}

export interface PolicyRequestData {
  data: string[];
  query: any;
  total: number;
}

type ThunkResult<R> = ThunkAction<R, RootState, undefined, Action<string>>;

// action to fetch all policies
export const addDefaultPolicies = (query: any): ThunkResult<Promise<void>> => {
  return (dispatch) => {
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
export const getPolicies = (query: any): ThunkResult<Promise<void>> => {
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
export const getPolicy = (id: string): ThunkResult<Promise<void>> => {
  return (dispatch) => {
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
export const createPolicy = (
  data: Omit<Policy, "id">
): ThunkResult<Promise<void>> => {
  return (dispatch) => {
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
export const updatePolicy = (data: Policy): ThunkResult<Promise<void>> => {
  return (dispatch) => {
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
export const deletePolicy = (id: string): ThunkResult<Promise<void>> => {
  return (dispatch) => {
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
