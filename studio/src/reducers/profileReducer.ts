import { SET_PROFILE_LOADING, ADD_PROFILE } from "../constants/profile";

// Define interfaces for state and actions
interface ProfileState {
  details: Record<string, any>;
  loading: boolean;
}

interface SetProfileLoadingAction {
  type: typeof SET_PROFILE_LOADING;
  payload: boolean;
}

interface AddProfileAction {
  type: typeof ADD_PROFILE;
  payload: Record<string, any>;
}

// Union type for all possible profile actions
type ProfileActionTypes = SetProfileLoadingAction | AddProfileAction;

const initialState: ProfileState = {
  details: {},
  loading: true,
};

export default function profileReducer(
  state: ProfileState = initialState,
  action: ProfileActionTypes = {} as ProfileActionTypes
): ProfileState {
  switch (action.type) {
    case SET_PROFILE_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_PROFILE:
      return {
        ...state,
        details: action.payload,
      };
    default:
      return state;
  }
}
