interface Space {
  id: string;
  name: string;
  site_address: string;
  site_title: string;
  tag_line: string;
  org_role?: string;
}

interface Organization {
  id: string;
  title: string;
  role: string;
  spaces: string[];
}

interface SpacesState {
  orgs: Organization[];
  selected: string;
  details: Record<string, Space>;
  loading: boolean;
  org_role: string;
}

interface RootState {
  spaces: SpacesState;
}

interface SelectorOutput {
  loading: boolean;
  spaces: Space[];
}

export const spaceSelector = (state: RootState): SelectorOutput => {
  if (!state.spaces) {
    return {
      loading: false,
      spaces: [],
      total: 0,
    };
  }

  // Find the organization that contains the selected space
  const selectedOrg = state.spaces.orgs.find((item) =>
    item.spaces.includes(state.spaces.selected)
  );

  let spaces: Space[] = [];

  if (selectedOrg) {
    spaces = selectedOrg.spaces
      .map((s) => state.spaces.details[s])
      .filter(Boolean);
  }

  return {
    loading: state.spaces.loading,
    spaces: spaces,
    total: spaces.length, // Add the total count based on the filtered spaces
  };
};
