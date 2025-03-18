import deepEqual from "deep-equal";

// Define interfaces for the data structures
interface Claim {
  claimant_id: string;
  rating_id: string;
  claimant?: string;
  rating?: string;
  [key: string]: any; // For other properties that might exist in a claim
}

interface Claimant {
  name: string;
  [key: string]: any;
}

interface Rating {
  name: string;
  [key: string]: any;
}

interface ClaimNode {
  query: { page: number };
  data: string[];
  total: number;
}

interface ClaimsState {
  req: ClaimNode[];
  details: { [key: string]: Claim };
  loading: boolean;
}

interface ClaimantsState {
  details: { [key: string]: Claimant };
}

interface RatingsState {
  details: { [key: string]: Rating };
}

interface StoreState {
  claims: ClaimsState;
  claimants: ClaimantsState;
  ratings: RatingsState;
}

interface ClaimSelectorResult {
  claims: Claim[];
  total: number;
  loading: boolean;
}

export const claimSelector = (
  state: StoreState,
  page: number
): ClaimSelectorResult => {
  const node = state.claims.req.find((item) => {
    return deepEqual(item.query, { page });
  });

  if (node) {
    const list = node.data.map((element) => {
      const claim = { ...state.claims.details[element] };
      claim.claimant = state.claimants.details[claim.claimant_id].name;
      claim.rating = state.ratings.details[claim.rating_id].name;
      return claim;
    });
    return {
      claims: list,
      total: node.total,
      loading: state.claims.loading,
    };
  }
  return { claims: [], total: 0, loading: state.claims.loading };
};
