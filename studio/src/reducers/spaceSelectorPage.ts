import { SET_VISIBLE } from "../constants/spaceSelectorPage";

// Define action type interface
interface SpaceSelectorAction {
  type: typeof SET_VISIBLE;
  payload: boolean;
}

// Define state interface
interface SpaceSelectorState {
  visible: boolean;
}

const initialState: SpaceSelectorState = {
  visible: false,
};

export default function spaceSelectorReducer(
  state: SpaceSelectorState = initialState,
  action: SpaceSelectorAction = {} as SpaceSelectorAction
): SpaceSelectorState {
  switch (action.type) {
    case SET_VISIBLE: {
      return { visible: action.payload };
    }
    default:
      return state;
  }
}
