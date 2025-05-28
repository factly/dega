import {
  ADD_SACH_FACT_CHECKS,
  SET_SACH_FACT_CHECKS_LOADING,
} from "../constants/sachFactChecks";

// Define interfaces for state and actions
interface SachFactCheck {}

interface SachFactChecksState {
  details: SachFactCheck[];
  loading: boolean;
}

interface AddSachFactChecksAction {
  type: typeof ADD_SACH_FACT_CHECKS;
  payload: SachFactCheck[];
}

interface SetSachFactChecksLoadingAction {
  type: typeof SET_SACH_FACT_CHECKS_LOADING;
  payload: boolean;
}

type SachFactChecksActionTypes =
  | AddSachFactChecksAction
  | SetSachFactChecksLoadingAction;

// Initial state
const initialState: SachFactChecksState = {
  details: [],
  loading: true,
};

// Reducer function
export default function sachFactCheckReducer(
  state: SachFactChecksState = initialState,
  action: SachFactChecksActionTypes = {} as SachFactChecksActionTypes
): SachFactChecksState {
  switch (action.type) {
    case ADD_SACH_FACT_CHECKS:
      return {
        ...state,
        details: [...action.payload],
      };
    case SET_SACH_FACT_CHECKS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}
