import { SET_COLLAPSE } from './../constants/sidebar';

const initialState = {
  collapsed: false,
};

export default function sidebarReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_COLLAPSE:
      return { collapsed: action.payload };
    default:
      return state;
  }
}
