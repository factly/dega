import {
  ADD_CLAIMS,
  ADD_CLAIMS_REQUEST,
  SET_CLAIMS_LOADING,
  RESET_CLAIMS,
  GET_CLAIM,
  UPDATE_CLAIM,
} from "../constants/claims";
import deepEqual from "deep-equal";

// Define interfaces for the data structures
interface Claim {
  id: string;
  [key: string]: any;
}

interface ClaimRequest {
  query: any;
  [key: string]: any;
}

interface ClaimsState {
  req: ClaimRequest[];
  details: {
    [id: string]: Claim;
  };
  loading: boolean;
}

// Define types for actions
interface ResetClaimsAction {
  type: typeof RESET_CLAIMS;
}

interface SetClaimsLoadingAction {
  type: typeof SET_CLAIMS_LOADING;
  payload: boolean;
}

interface AddClaimsRequestAction {
  type: typeof ADD_CLAIMS_REQUEST;
  payload: ClaimRequest;
}

interface AddClaimsAction {
  type: typeof ADD_CLAIMS;
  payload: Claim[];
}

interface GetClaimAction {
  type: typeof GET_CLAIM;
  payload: Claim;
}

interface UpdateClaimAction {
  type: typeof UPDATE_CLAIM;
  payload: Claim;
}

type ClaimsActionTypes =
  | ResetClaimsAction
  | SetClaimsLoadingAction
  | AddClaimsRequestAction
  | AddClaimsAction
  | GetClaimAction
  | UpdateClaimAction;

const initialState: ClaimsState = {
  req: [],
  details: {},
  loading: true,
};

export default function claimsReducer(
  state: ClaimsState = initialState,
  action: ClaimsActionTypes = {} as ClaimsActionTypes
): ClaimsState {
  switch (action.type) {
    case RESET_CLAIMS:
      return {
        ...state,
        req: [],
        loading: true,
      };
    case SET_CLAIMS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_CLAIMS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_CLAIMS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {} as { [id: string]: Claim }
          ),
        },
      };
    case GET_CLAIM:
    case UPDATE_CLAIM:
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
