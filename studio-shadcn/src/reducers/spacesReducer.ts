import {
  SET_SELECTED_SPACE,
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
  DELETE_SPACE_SUCCESS,
  UPDATE_SPACE_SUCCESS,
} from "../constants/spaces";

// Define interfaces for our data structures
interface Space {
  id: string;
  organisation_id?: string;
  org_role?: string;
  [key: string]: any;
}

interface Organization {
  id: string;
  role: string;
  spaces: Space[] | string[];
  [key: string]: any;
}

interface SpacesState {
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
type SpacesAction =
  | LoadingSpacesAction
  | GetSpacesSuccessAction
  | AddSpaceSuccessAction
  | SetSelectedSpaceAction
  | UpdateSpaceSuccessAction
  | DeleteSpaceSuccessAction
  | { type: string; payload?: any };

const initialState: SpacesState = {
  orgs: [],
  details: {},
  loading: true,
  selected: "",
  org_role: "",
};

export default function spacesReducer(
  state: SpacesState = initialState,
  action: SpacesAction = { type: "" }
): SpacesState {
  if (!action.payload) {
    return state;
  }

  switch (action.type) {
    case LOADING_SPACES:
      return {
        ...state,
        loading: action.payload as boolean,
      };

    case GET_SPACES_SUCCESS: {
      const organizations = action.payload as Organization[];
      const space_details: { [key: string]: Space } = {};

      organizations.forEach((element) => {
        (element.spaces as Space[]).forEach((s) => {
          space_details[s.id] = { ...s, org_role: element.role };
        });
      });

      const spaceID = localStorage.getItem("space")
        ? localStorage.getItem("space")
        : "";

      const defaultSpace =
        Object.keys(space_details).length > 0
          ? space_details[spaceID || ""]
            ? space_details[spaceID || ""].id
            : space_details[Object.keys(space_details)[0]].id
          : "";

      const setSpaceID = space_details[state.selected]
        ? state.selected
        : defaultSpace;
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
