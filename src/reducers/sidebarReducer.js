import { COLLAPSE, EXPAND } from './../constants/sidebar';

const initialState = {
  collapsed: false,
};

export default function sidebarReducer(state = initialState, action = {}) {
  switch (action.type) {
    case COLLAPSE:
      return { collapsed: true };
    case EXPAND:
      return { collapsed: false };
    default:
      return state;
  }
}
