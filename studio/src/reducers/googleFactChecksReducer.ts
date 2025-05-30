import {
  ADD_GOOGLE_FACT_CHECKS_REQUEST,
  SET_GOOGLE_FACT_CHECKS_LOADING,
} from "../constants/googleFactChecks";
import deepEqual from "deep-equal";

// Define interfaces for the state and actions
interface GoogleFactChecksState {
  req: GoogleFactCheckRequest[];
  loading: boolean;
}

interface GoogleFactCheckRequest {
  query: any; // You might want to define a more specific type based on your application
  // Add other properties that might be in this object
}

interface SetLoadingAction {
  type: typeof SET_GOOGLE_FACT_CHECKS_LOADING;
  payload: boolean;
}

interface AddRequestAction {
  type: typeof ADD_GOOGLE_FACT_CHECKS_REQUEST;
  payload: GoogleFactCheckRequest;
}

// Union type for all possible actions
type GoogleFactChecksAction = SetLoadingAction | AddRequestAction;

const initialState: GoogleFactChecksState = {
  req: [],
  loading: true,
};

export default function googleFactChecksReducer(
  state: GoogleFactChecksState = initialState,
  action: GoogleFactChecksAction = {} as GoogleFactChecksAction
): GoogleFactChecksState {
  switch (action.type) {
    case SET_GOOGLE_FACT_CHECKS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_GOOGLE_FACT_CHECKS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    default:
      return state;
  }
}
