import axios from 'axios';
import {
  ADD_CLAIMS,
  ADD_CLAIMS_REQUEST,
  SET_CLAIMS_LOADING,
  RESET_CLAIMS,
  CLAIMS_API,
  GET_CLAIM,
  UPDATE_CLAIM,
} from '../constants/claims';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addRatings } from './ratings';
import { addClaimants } from './claimants';
import getError from '../utils/getError';

// action to fetch all claims
export const getClaims = (query) => {
  const params = new URLSearchParams();
  if (query.claimant && query.claimant.length > 0) {
    query.claimant.map((each) => params.append('claimant', each));
  }
  if (query.rating && query.rating.length > 0) {
    query.rating.map((each) => params.append('rating', each));
  }
  if (query.page) {
    params.append('page', query.page);
  }
  if (query.limit) {
    params.append('limit', query.limit);
  }
  if (query.sort) {
    params.append('sort', query.sort);
  }
  if (query.q) {
    params.append('q', query.q);
  }
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .get(CLAIMS_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addClaimants(
            response.data.nodes.filter((claim) => claim.claimant).map((claim) => claim.claimant),
          ),
        );
        dispatch(
          addRatings(
            response.data.nodes.filter((claim) => claim.rating).map((claim) => claim.rating),
          ),
        );
        dispatch(
          addClaimsList(
            response.data.nodes.map((claim) => {
              return { ...claim, claimant: claim.claimant.id, rating: claim.rating.id };
            }),
          ),
        );
        dispatch(
          addClaimsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimsLoading()));
  };
};

// action to fetch claim by id
export const getClaim = (id) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .get(CLAIMS_API + '/' + id)
      .then((response) => {
        let claim = response.data;
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(
          addClaim(GET_CLAIM, { ...claim, claimant: claim.claimant.id, rating: claim.rating.id }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimsLoading()));
  };
};

// action to create claim
export const createClaim = (data) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .post(CLAIMS_API, data)
      .then((response) => {
        let claim = response.data;
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(resetClaims());
        dispatch(addSuccessNotification('Claim created'));
        return claim;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update claim by id
export const updateClaim = (data) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .put(CLAIMS_API + '/' + data.id, data)
      .then((response) => {
        let claim = response.data;
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(
          addClaim(UPDATE_CLAIM, {
            ...claim,
            claimant: claim.claimant.id,
            rating: claim.rating.id,
          }),
        );
        dispatch(addSuccessNotification('Claim updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimsLoading()));
  };
};

// action to delete claim by id
export const deleteClaim = (id) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .delete(CLAIMS_API + '/' + id)
      .then(() => {
        dispatch(resetClaims());
        dispatch(addSuccessNotification('Claim deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addClaims = (claims) => {
  return (dispatch) => {
    dispatch(addClaimants(claims.filter((claim) => claim.claimant).map((claim) => claim.claimant)));
    dispatch(addRatings(claims.filter((claim) => claim.rating).map((claim) => claim.rating)));
    dispatch(
      addClaimsList(
        claims.map((claim) => {
          return { ...claim, claimant: claim.claimant.id, rating: claim.rating.id };
        }),
      ),
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

export const addClaim = (type, payload) => ({
  type,
  payload,
});

export const addClaimsList = (payload) => ({
  type: ADD_CLAIMS,
  payload,
});

export const addClaimsRequest = (payload) => ({
  type: ADD_CLAIMS_REQUEST,
  payload,
});

export const resetClaims = () => ({
  type: RESET_CLAIMS,
});
