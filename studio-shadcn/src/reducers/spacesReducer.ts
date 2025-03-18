import {
  SET_SELECTED_SPACE,
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
  DELETE_SPACE_SUCCESS,
  UPDATE_SPACE_SUCCESS,
} from "../constants/spaces";

// Define interfaces for our data structures
export interface Space {
  id: string;
  organisation_id?: string;
  org_role?: string;
  [key: string]: any;
}

export interface Organization {
  id: string;
  role: string;
  spaces: Space[] | string[];
  [key: string]: any;
}

export interface SpacesState {
  orgs: Organization[];
  details: {
    [key: string]: Space;
  };
  loading: boolean;
  selected: string;
  org_role: string;
}

// Define action interfaces
interface LoadingSpacesAction {
  type: typeof LOADING_SPACES;
  payload: boolean;
}

interface GetSpacesSuccessAction {
  type: typeof GET_SPACES_SUCCESS;
  payload: Organization[];
}

interface AddSpaceSuccessAction {
  type: typeof ADD_SPACE_SUCCESS;
  payload: Space;
}

interface SetSelectedSpaceAction {
  type: typeof SET_SELECTED_SPACE;
  payload: {
    id: string;
  };
}

interface UpdateSpaceSuccessAction {
  type: typeof UPDATE_SPACE_SUCCESS;
  payload: Space;
}

interface DeleteSpaceSuccessAction {
  type: typeof DELETE_SPACE_SUCCESS;
  payload: any;
}

// Union type for all possible actions
export type SpacesAction =
  | LoadingSpacesAction
  | GetSpacesSuccessAction
  | AddSpaceSuccessAction
  | SetSelectedSpaceAction
  | UpdateSpaceSuccessAction
  | DeleteSpaceSuccessAction
  | { type: string; payload?: any };

// Initialize with the stored space ID to ensure there's a selected space on app load
const storedSpaceId = localStorage.getItem("space") || "";

const initialState: SpacesState = {
  orgs: [],
  details: {},
  loading: true,
  selected: storedSpaceId,
  org_role: "",
};

export function spaces(
  state: SpacesState = initialState,
  action: SpacesAction = { type: "" }
): SpacesState {
  // Return state for actions without payload, except for special cases
  if (!action.payload && action.type !== LOADING_SPACES) {
    return state;
  }

  switch (action.type) {
    case LOADING_SPACES:
      return {
        ...state,
        loading:
          action.payload === undefined ? false : (action.payload as boolean),
      };

    case GET_SPACES_SUCCESS: {
      const organizations = action.payload as Organization[];
      const space_details: { [key: string]: Space } = {};

      organizations.forEach((element) => {
        (element.spaces as Space[]).forEach((s) => {
          space_details[s.id] = { ...s, org_role: element.role };
        });
      });

      // Get space ID from localStorage, fallback to empty string
      const spaceID = localStorage.getItem("space") || "";

      // Use the stored ID if valid, otherwise use the first available space
      const defaultSpace =
        Object.keys(space_details).length > 0
          ? space_details[spaceID]
            ? spaceID // Use stored space if it exists
            : space_details[Object.keys(space_details)[0]].id // Otherwise use first space
          : "";

      // Use the current selected space if it exists in space_details, otherwise use defaultSpace
      const setSpaceID = space_details[state.selected]
        ? state.selected
        : defaultSpace;

      // Store the selected space ID in localStorage
      localStorage.setItem("space", setSpaceID);

      return {
        ...state,
        orgs: organizations.map((each) => {
          return {
            ...each,
            spaces: (each.spaces as Space[]).map((e) => e.id),
          };
        }),
        details: space_details,
        loading: false,
        selected: setSpaceID,
        org_role: space_details[setSpaceID]
          ? space_details[setSpaceID].org_role || ""
          : "",
      };
    }

    case ADD_SPACE_SUCCESS: {
      const newSpace = action.payload as Space;
      const org_index = state.orgs.findIndex(
        (element) => element.id === newSpace.organisation_id
      );

      if (org_index === -1) {
        return state;
      }

      const space_list = [...state.orgs[org_index].spaces] as string[];
      space_list.splice(0, 0, newSpace.id);
      const org_copy = [...state.orgs];
      org_copy[org_index] = {
        ...org_copy[org_index],
        spaces: space_list,
      };

      localStorage.setItem("space", newSpace.id);

      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [newSpace.id]: newSpace,
        },
        orgs: org_copy,
        selected: newSpace.id,
      };
    }

    case SET_SELECTED_SPACE: {
      const { id } = action.payload as { id: string };
      localStorage.setItem("space", id);

      return {
        ...state,
        selected: id,
        org_role: state.details[id] ? state.details[id].org_role || "" : "",
      };
    }

    case UPDATE_SPACE_SUCCESS: {
      const updatedSpace = action.payload as Space;

      return {
        ...state,
        details: {
          ...state.details,
          [updatedSpace.id]: {
            ...state.details[updatedSpace.id],
            ...updatedSpace,
          },
        },
      };
    }

    case DELETE_SPACE_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
