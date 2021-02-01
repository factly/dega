const initialState = {
  collapsed: false,
};

export default function sidebarReducer(state = initialState, action = {}) {
  switch (action.type) {
    case true:
      return { collapsed: true };
    case false:
      return { collapsed: false };
    default:
      return state;
  }
}
