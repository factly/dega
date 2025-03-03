import { SET_COLLAPSE } from "./../constants/sidebar";

// Define interface for the state
interface SidebarState {
  collapsed: boolean;
}

// Define interface for the action
interface SidebarAction {
  type: string;
  payload?: boolean;
}

const initialState: SidebarState = {
  collapsed: false,
};

export default function sidebarReducer(
  state: SidebarState = initialState,
  action: SidebarAction = {} as SidebarAction
): SidebarState {
  switch (action.type) {
    case SET_COLLAPSE:
      return { collapsed: action.payload as boolean };
    default:
      return state;
  }
}
