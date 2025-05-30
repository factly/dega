import { SET_REDIRECT } from "../constants/settings";

// Define the state interface
interface RedirectState {
  code: number;
}

// Define the action interface
interface RedirectAction {
  type: typeof SET_REDIRECT;
  payload: number;
}

// Define the initial state
const initialState: RedirectState = {
  code: 200,
};

// Define the reducer function with proper type annotations
export default function redirectReducer(
  state: RedirectState = initialState,
  action: RedirectAction | { type: string } = { type: "" }
): RedirectState {
  switch (action.type) {
    case SET_REDIRECT:
      return {
        ...state,
        code: (action as RedirectAction).payload,
      };
    default:
      return state;
  }
}
