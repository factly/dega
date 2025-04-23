import {
  ADD_PERMISSIONS,
  ADD_PERMISSIONS_REQUEST,
  SET_PERMISSIONS_LOADING,
} from "../constants/permissions";

// Define interfaces for permission data structures
interface PermissionData {
  [key: string]: any;
}

interface PermissionPayload {
  user_id: string;
  data: PermissionData;
  length: number;
}

interface PermissionRequest {
  [key: string]: any;
}

// Define the state interface
interface PermissionsState {
  details: {
    [key: string]: PermissionData;
  };
  req: PermissionRequest[];
  loading: boolean;
}

// Define action interfaces
interface SetPermissionsLoadingAction {
  type: typeof SET_PERMISSIONS_LOADING;
  payload: boolean;
}

interface AddPermissionsRequestAction {
  type: typeof ADD_PERMISSIONS_REQUEST;
  payload: PermissionRequest;
}

interface AddPermissionsAction {
  type: typeof ADD_PERMISSIONS;
  payload: PermissionPayload;
}

// Union type for all possible actions
type PermissionsActionTypes =
  | SetPermissionsLoadingAction
  | AddPermissionsRequestAction
  | AddPermissionsAction;

// Initial state
const initialState: PermissionsState = {
  details: {},
  req: [],
  loading: true,
};

// The reducer function
export default function permissionsReducer(
  state: PermissionsState = initialState,
  action: PermissionsActionTypes = {} as PermissionsActionTypes
): PermissionsState {
  switch (action.type) {
    case SET_PERMISSIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ADD_PERMISSIONS_REQUEST:
      return {
        ...state,
        req: state.req.concat(action.payload),
      };
    case ADD_PERMISSIONS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.user_id]: action.payload.data,
        },
      };

    default:
      return state;
  }
}
