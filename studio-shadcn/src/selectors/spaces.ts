import { createSelector } from "reselect";

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
  hasAttemptedFetch: boolean;
}

interface RootState {
  spaces: SpacesState;
}

interface SelectorOutput {
  loading: boolean;
  spaces: Space[];
  total: number;
  hasAttemptedFetch: boolean;
}

const getSpacesState = (state: RootState) => state.spaces;

export const spaceSelector = createSelector(
  [getSpacesState],
  (spacesState): SelectorOutput => {
    if (!spacesState) {
      return {
        loading: false,
        spaces: [],
        total: 0,
        hasAttemptedFetch: false,
      };
    }

    // Find the organization that contains the selected space
    const selectedOrg = spacesState.orgs.find((item) =>
      item.spaces.includes(spacesState.selected)
    );

    let spaces: Space[] = [];

    if (selectedOrg) {
      spaces = selectedOrg.spaces
        .map((s) => spacesState.details[s])
        .filter(Boolean);
    }

    return {
      loading: spacesState.loading,
      spaces: spaces,
      total: spaces.length,
      hasAttemptedFetch: spacesState.hasAttemptedFetch || false,
    };
  }
);
