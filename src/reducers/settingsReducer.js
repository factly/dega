import defaultSettings from '../config/proSettings';
import { TOGGLE_SIDER } from '../constants/settings';

const initialState = {
  ...defaultSettings,
  sider: {
    collapsed: true,
  },
};

export default function settingsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_SIDER:
      return {
        ...state,
        ...{
          sider: {
            collapsed: !state.sider.collapsed,
          },
        },
      };
    default:
      return state;
  }
}
