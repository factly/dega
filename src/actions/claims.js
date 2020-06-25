import axios from 'axios';
import {
  GET_CLAIMS_SUCCESS,
  GET_CLAIMS_FAILURE,
  GET_CLAIM_SUCCESS,
  GET_CLAIM_FAILURE,
  ADD_CLAIM_FAILURE,
  ADD_CLAIM_SUCCESS,
  API_ADD_CLAIM,
  API_GET_CLAIMS,
  UPDATE_CLAIM_FAILURE,
  UPDATE_CLAIM_SUCCESS,
  DELETE_CLAIM_SUCCESS,
  DELETE_CLAIM_FAILURE,
} from '../constants/claims';
import { LOADING_SPACES } from '../constants/spaces';
import { ADD_CLAIMANTS } from '../constants/claimants';
import { ADD_RATINGS } from '../constants/ratings';

export const getClaims = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingClaims());
    return axios
      .get(API_GET_CLAIMS, {
        params: query,
      })
      .then((response) => {
        let claims = response.data.nodes
          ? response.data.nodes.map((claim) => {
              if (claim.claimant) dispatch(addClaimant(claim.claimant));
              if (claim.rating) dispatch(addRating(claim.rating));

              return {
                ...claim,
                claimant: claim.claimant.id,
                rating: claim.rating.id,
              };
            })
          : [];

        dispatch(getClaimsSuccess({ ...response.data, nodes: claims }, query));
      })
      .catch((error) => {
        dispatch(getClaimsFailure(error.message));
      });
  };
};
export const getClaim = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingClaims());
    return axios
      .get(API_GET_CLAIMS + '/' + id)
      .then((response) => {
        let claim = response.data;
        if (claim.claimant) dispatch(addClaimant(claim.claimant));
        if (claim.rating) dispatch(addRating(claim.rating));

        claim.claimant = claim.claimant.id;
        claim.rating = claim.rating.id;
        dispatch(getClaimSuccess(claim));
      })
      .catch((error) => {
        dispatch(getClaimFailure(error.message));
      });
  };
};

export const addClaim = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingClaims());
    return axios
      .post(API_ADD_CLAIM, data)
      .then((response) => {
        let claim = response.data;
        if (claim.claimant) dispatch(addClaimant(claim.claimant));
        if (claim.rating) dispatch(addRating(claim.rating));

        claim.claimant = claim.claimant.id;
        claim.rating = claim.rating.id;
        dispatch(addClaimSuccess(claim));
      })
      .catch((error) => {
        dispatch(addClaimFailure(error.message));
      });
  };
};

export const updateClaim = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingClaims());
    return axios
      .put(API_ADD_CLAIM + '/' + data.id, data)
      .then((response) => {
        let claim = response.data;
        if (claim.claimant) dispatch(addClaimant(claim.claimant));
        if (claim.rating) dispatch(addRating(claim.rating));

        claim.claimant = claim.claimant.id;
        claim.rating = claim.rating.id;
        dispatch(updateClaimSuccess(claim));
      })
      .catch((error) => {
        dispatch(updateClaimFailure(error.message));
      });
  };
};

export const deleteClaim = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingClaims());
    return axios
      .delete(API_ADD_CLAIM + '/' + id)
      .then(() => {
        dispatch(deleteClaimSuccess(id));
      })
      .catch((error) => {
        dispatch(deleteClaimFailure(error.message));
      });
  };
};

const loadingClaims = () => ({
  type: LOADING_SPACES,
});

const getClaimsSuccess = (data, query) => ({
  type: GET_CLAIMS_SUCCESS,
  payload: { data, query },
});

const getClaimsFailure = (error) => ({
  type: GET_CLAIMS_FAILURE,
  payload: {
    error,
  },
});

const getClaimSuccess = (data) => ({
  type: GET_CLAIM_SUCCESS,
  payload: { ...data },
});

const getClaimFailure = (error) => ({
  type: GET_CLAIM_FAILURE,
  payload: {
    error,
  },
});

const addClaimSuccess = (data) => ({
  type: ADD_CLAIM_SUCCESS,
  payload: {
    ...data,
  },
});

const addClaimFailure = (error) => ({
  type: ADD_CLAIM_FAILURE,
  payload: {
    error,
  },
});

const updateClaimSuccess = (data) => ({
  type: UPDATE_CLAIM_SUCCESS,
  payload: {
    ...data,
  },
});

const updateClaimFailure = (error) => ({
  type: UPDATE_CLAIM_FAILURE,
  payload: {
    error,
  },
});

const deleteClaimSuccess = (id) => ({
  type: DELETE_CLAIM_SUCCESS,
  payload: id,
});

const deleteClaimFailure = (error) => ({
  type: DELETE_CLAIM_FAILURE,
  payload: {
    error,
  },
});

const addClaimant = (data) => ({
  type: ADD_CLAIMANTS,
  payload: [data],
});

const addRating = (data) => ({
  type: ADD_RATINGS,
  payload: [data],
});
