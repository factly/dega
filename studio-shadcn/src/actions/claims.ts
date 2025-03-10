import axios from "axios";
import {
  ADD_CLAIMS,
  ADD_CLAIMS_REQUEST,
  SET_CLAIMS_LOADING,
  RESET_CLAIMS,
  CLAIMS_API,
  GET_CLAIM,
  UPDATE_CLAIM,
} from "../constants/claims";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import { addRatings } from "./ratings";
import { addClaimants } from "./claimants";
import getError from "../utils/getError";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

// Types
interface Claimant {
  id: string;
  [key: string]: any;
}

interface Rating {
  id: string;
  [key: string]: any;
}

interface Description {
  json: any;
  html: string;
}

interface Claim {
  id: string;
  description?: Description;
  description_html?: string;
  claimant: string | Claimant;
  rating: string | Rating;
  [key: string]: any;
}

interface ClaimNode {
  id: string;
  description: any;
  description_html: string;
  claimant: Claimant;
  rating: Rating;
  [key: string]: any;
}

interface ClaimsResponse {
  nodes: ClaimNode[];
  total: number;
}

interface ClaimsQuery {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  q?: string;
  claimant?: string[] | string;
  rating?: string[] | string;
  [key: string]: any;
}

interface ClaimsRequest {
  data: string[];
  query: ClaimsQuery;
  total: number;
}

type AppThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType> | void,
  unknown,
  unknown,
  AnyAction
>;

// action to fetch all claims
export const getClaims = (query: ClaimsQuery): AppThunk => {
  const params = new URLSearchParams();

  // Handle claimant filter - could be array or single string
  if (query.claimant) {
    if (Array.isArray(query.claimant)) {
      query.claimant.forEach((each) => {
        if (each) params.append("claimant", each);
      });
    } else if (typeof query.claimant === "string") {
      params.append("claimant", query.claimant);
    }
  }

  // Handle rating filter - could be array or single string
  if (query.rating) {
    if (Array.isArray(query.rating)) {
      query.rating.forEach((each) => {
        if (each) params.append("rating", each);
      });
    } else if (typeof query.rating === "string") {
      params.append("rating", query.rating);
    }
  }

  // Handle other parameters
  if (query.page) {
    params.append("page", query.page.toString());
  }
  if (query.limit) {
    params.append("limit", query.limit.toString());
  }
  if (query.sort) {
    params.append("sort", query.sort);
  }
  if (query.q) {
    params.append("q", query.q);
  }

  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .get<ClaimsResponse>(CLAIMS_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addClaimants(
            response.data.nodes
              .filter((claim) => claim.claimant)
              .map((claim) => claim.claimant)
          )
        );
        dispatch(
          addRatings(
            response.data.nodes
              .filter((claim) => claim.rating)
              .map((claim) => claim.rating)
          )
        );
        dispatch(
          addClaimsList(
            response.data.nodes.map((claim) => {
              return {
                ...claim,
                description: {
                  json: claim.description,
                  html: claim.description_html,
                },
                claimant: claim.claimant.id,
                rating: claim.rating.id,
              };
            })
          )
        );
        dispatch(
          addClaimsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimsLoading()));
  };
};

// action to fetch claim by id
export const getClaim = (id: string): AppThunk => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .get<ClaimNode>(`${CLAIMS_API}/${id}`)
      .then((response) => {
        const claim = response.data;
        const description = {
          json: claim.description,
          html: claim.description_html,
        };
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(
          addClaim(GET_CLAIM, {
            ...claim,
            description,
            claimant: claim.claimant.id,
            rating: claim.rating.id,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimsLoading()));
  };
};

// action to create claim
export const createClaim = (
  data: Omit<Claim, "id">
): AppThunk<Promise<Claim | undefined>> => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .post<ClaimNode>(CLAIMS_API, data)
      .then((response) => {
        const claim = response.data;
        const description = {
          json: claim.description,
          html: claim.description_html,
        };
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(resetClaims());
        dispatch(addSuccessNotification("Claim created"));
        return {
          ...claim,
          description,
          claimant:
            typeof claim.claimant === "object"
              ? claim.claimant.id
              : claim.claimant,
          rating:
            typeof claim.rating === "object" ? claim.rating.id : claim.rating,
        };
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return undefined;
      });
  };
};

// action to update claim by id
export const updateClaim = (data: Claim): AppThunk => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .put<ClaimNode>(`${CLAIMS_API}/${data.id}`, data)
      .then((response) => {
        const claim = response.data;
        const description = {
          json: claim.description,
          html: claim.description_html,
        };
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(
          addClaim(UPDATE_CLAIM, {
            ...claim,
            description,
            claimant: claim.claimant.id,
            rating: claim.rating.id,
          })
        );
        dispatch(addSuccessNotification("Claim updated"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimsLoading()));
  };
};

// action to delete claim by id
export const deleteClaim = (id: string): AppThunk => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .delete(`${CLAIMS_API}/${id}`)
      .then(() => {
        dispatch(resetClaims());
        dispatch(addSuccessNotification("Claim deleted"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addClaims = (claims: ClaimNode[]): AppThunk => {
  return (dispatch) => {
    dispatch(
      addClaimants(
        claims.filter((claim) => claim.claimant).map((claim) => claim.claimant)
      )
    );
    dispatch(
      addRatings(
        claims.filter((claim) => claim.rating).map((claim) => claim.rating)
      )
    );
    dispatch(
      addClaimsList(
        claims.map((claim) => {
          return {
            ...claim,
            claimant:
              typeof claim.claimant === "object"
                ? claim.claimant.id
                : claim.claimant,
            rating:
              typeof claim.rating === "object" ? claim.rating.id : claim.rating,
          };
        })
      )
    );
  };
};

export const loadingClaims = () => ({
  type: SET_CLAIMS_LOADING,
  payload: true,
});

export const stopClaimsLoading = () => ({
  type: SET_CLAIMS_LOADING,
  payload: false,
});

export const addClaim = (
  type: typeof GET_CLAIM | typeof UPDATE_CLAIM,
  payload: Claim
) => ({
  type,
  payload,
});

export const addClaimsList = (payload: Claim[]) => ({
  type: ADD_CLAIMS,
  payload,
});

export const addClaimsRequest = (payload: ClaimsRequest) => ({
  type: ADD_CLAIMS_REQUEST,
  payload,
});

export const resetClaims = () => ({
  type: RESET_CLAIMS,
});
