export const spaceSelector = (state) => {
  const selectedOrg = state.spaces.orgs.find((item) => item.spaces.includes(state.spaces.selected));
  let spaces = [];
  if (selectedOrg) {
    spaces = selectedOrg.spaces.map((s) => state.spaces.details[s]);
  }
  return {
    loading: state.spaces.loading,
    spaces: spaces,
  };
};
