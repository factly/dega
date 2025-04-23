import defaultSettings, { ProSettings } from "../config/proSettings";
import { TOGGLE_SIDER } from "../constants/settings";

// Define the extended state interface with sider property
export interface SettingsState extends ProSettings {
  sider: {
    collapsed: boolean;
  };
}

// Define the action interface
export interface SettingsAction {
  type: string;
  payload?: any;
}

const initialState: SettingsState = {
  ...defaultSettings,
  sider: {
    collapsed: true,
  },
};

export default function settingsReducer(
  state: SettingsState = initialState,
  action: SettingsAction = { type: "" }
): SettingsState {
  switch (action.type) {
    case TOGGLE_SIDER:
      return {
        ...state,
        sider: {
          collapsed: !state.sider.collapsed,
        },
      };
    default:
      return state;
  }
}
