import {
  ADD_POLICIES,
  ADD_POLICIES_REQUEST,
  SET_POLICIES_LOADING,
  RESET_POLICIES,
  GET_POLICY,
  UPDATE_POLICY,
} from "../constants/policies";
import deepEqual from "deep-equal";

// Define interfaces for the state and policy objects
interface Policy {
  id: string;
  [key: string]: any;
}

interface PolicyRequest {
  query: any;
  [key: string]: any;
}

interface PoliciesState {
  req: PolicyRequest[];
  details: {
    [id: string]: Policy;
  };
  loading: boolean;
}

// Define action types
interface ResetPoliciesAction {
  type: typeof RESET_POLICIES;
}

interface SetPoliciesLoadingAction {
  type: typeof SET_POLICIES_LOADING;
  payload: boolean;
}

interface AddPoliciesRequestAction {
  type: typeof ADD_POLICIES_REQUEST;
  payload: PolicyRequest;
}

interface AddPoliciesAction {
  type: typeof ADD_POLICIES;
  payload: Policy[];
}

interface GetPolicyAction {
  type: typeof GET_POLICY;
  payload: Policy;
}

interface UpdatePolicyAction {
  type: typeof UPDATE_POLICY;
  payload: Policy;
}

// Union type for all possible actions
type PolicyActionTypes =
  | ResetPoliciesAction
  | SetPoliciesLoadingAction
  | AddPoliciesRequestAction
  | AddPoliciesAction
  | GetPolicyAction
  | UpdatePolicyAction;

const initialState: PoliciesState = {
  req: [],
  details: {},
  loading: true,
};

export default function policiesReducer(
  state: PoliciesState = initialState,
  action: PolicyActionTypes = {} as PolicyActionTypes
): PoliciesState {
  switch (action.type) {
    case RESET_POLICIES:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_POLICIES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_POLICIES_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_POLICIES:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<{ [id: string]: Policy }>(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    case GET_POLICY:
    case UPDATE_POLICY:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    default:
      return state;
  }
}
