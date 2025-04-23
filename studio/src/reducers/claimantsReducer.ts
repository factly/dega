import {
  ADD_CLAIMANTS,
  ADD_CLAIMANTS_REQUEST,
  SET_CLAIMANTS_LOADING,
  RESET_CLAIMANTS,
  GET_CLAIMANT,
  UPDATE_CLAIMANT,
} from "../constants/claimants";
import deepEqual from "deep-equal";

// Define types for our state and actions
interface Claimant {
  id: string | number;
  [key: string]: any;
}

interface ClaimantRequest {
  query: Record<string, any>;
  [key: string]: any;
}

interface ClaimantsState {
  req: ClaimantRequest[];
  details: Record<string | number, Claimant>;
  loading: boolean;
}

// Action types
interface ResetClaimantsAction {
  type: typeof RESET_CLAIMANTS;
}

interface SetClaimantsLoadingAction {
  type: typeof SET_CLAIMANTS_LOADING;
  payload: boolean;
}

interface AddClaimantsRequestAction {
  type: typeof ADD_CLAIMANTS_REQUEST;
  payload: ClaimantRequest;
}

interface AddClaimantsAction {
  type: typeof ADD_CLAIMANTS;
  payload: Claimant[];
}

interface GetClaimantAction {
  type: typeof GET_CLAIMANT;
  payload: Claimant;
}

interface UpdateClaimantAction {
  type: typeof UPDATE_CLAIMANT;
  payload: Claimant;
}

type ClaimantsActionTypes =
  | ResetClaimantsAction
  | SetClaimantsLoadingAction
  | AddClaimantsRequestAction
  | AddClaimantsAction
  | GetClaimantAction
  | UpdateClaimantAction;

const initialState: ClaimantsState = {
  req: [],
  details: {},
  loading: true,
};

export default function claimantsReducer(
  state: ClaimantsState = initialState,
  action: ClaimantsActionTypes = {} as ClaimantsActionTypes
): ClaimantsState {
  switch (action.type) {
    case RESET_CLAIMANTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_CLAIMANTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_CLAIMANTS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_CLAIMANTS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {} as Record<string | number, Claimant>
          ),
        },
      };
    case GET_CLAIMANT:
    case UPDATE_CLAIMANT:
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
