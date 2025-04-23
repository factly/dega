import {
  ADD_SPACE_TOKENS,
  ADD_SPACE_TOKENS_REQUEST,
  SET_SPACE_TOKENS_LOADING,
} from "../constants/tokens";
import deepEqual from "deep-equal";

// Define interfaces for the token data structures
interface TokenItem {
  id: string;
  [key: string]: any;
}

interface TokenRequest {
  query: any;
  [key: string]: any;
}

// Define the state interface
interface TokensState {
  req: TokenRequest[];
  details: {
    [key: string]: TokenItem;
  };
  loading: boolean;
}

// Define the action interfaces
interface SetSpaceTokensLoadingAction {
  type: typeof SET_SPACE_TOKENS_LOADING;
  payload: boolean;
}

interface AddSpaceTokensRequestAction {
  type: typeof ADD_SPACE_TOKENS_REQUEST;
  payload: TokenRequest;
}

interface AddSpaceTokensAction {
  type: typeof ADD_SPACE_TOKENS;
  payload: TokenItem[];
}

// Union type for all possible actions
type TokensActionTypes =
  | SetSpaceTokensLoadingAction
  | AddSpaceTokensRequestAction
  | AddSpaceTokensAction;

// Initial state
const initialState: TokensState = {
  req: [],
  details: {},
  loading: true,
};

// The reducer function
export default function tokensReducer(
  state: TokensState = initialState,
  action: TokensActionTypes = {} as TokensActionTypes
): TokensState {
  switch (action.type) {
    case SET_SPACE_TOKENS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SPACE_TOKENS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_SPACE_TOKENS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    default:
      return state;
  }
}
