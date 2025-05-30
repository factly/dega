import { SET_SESSIONS_LOADING, ADD_SESSION } from "../constants/session";

// Define interfaces for state and actions
interface SessionState {
  details: Record<string, any>;
  loading: boolean;
}

interface SetSessionsLoadingAction {
  type: typeof SET_SESSIONS_LOADING;
  payload: boolean;
}

interface AddSessionAction {
  type: typeof ADD_SESSION;
  payload: Record<string, any>;
}

// Union type for all possible session actions
type SessionActionTypes = SetSessionsLoadingAction | AddSessionAction;

const initialState: SessionState = {
  details: {},
  loading: true,
};

export default function sessionReducer(
  state: SessionState = initialState,
  action: SessionActionTypes = {} as SessionActionTypes
): SessionState {
  switch (action.type) {
    case SET_SESSIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SESSION:
      return {
        ...state,
        details: {
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
