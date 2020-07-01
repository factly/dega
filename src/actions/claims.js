import axios from 'axios';
import {
  ADD_CLAIM,
  ADD_CLAIMS,
  ADD_CLAIMS_REQUEST,
  SET_CLAIMS_LOADING,
  RESET_CLAIMS,
  CLAIMS_API,
} from '../constants/claims';
import { addErrors } from './notifications';
import { addRatings } from './ratings';
import { addClaimants } from './claimants';

export const getClaims = (query) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .get(CLAIMS_API, {
        params: query,
      })
      .then((response) => {
        let claimants = [];
        let ratings = [];
        let claims = response.data.nodes.map((claim) => {
          if (claim.claimant) claimants.push(claim.claimant);
          if (claim.rating) ratings.push(claim.rating);

          return {
            ...claim,
            claimant: claim.claimant.id,
            rating: claim.rating.id,
          };
        });
        dispatch(addClaimants(claimants));
        dispatch(addRatings(ratings));
        dispatch(addClaimsList(claims));
        dispatch(
          addClaimsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopClaimsLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrors(error.message));
      });
  };
};

export const getClaim = (id) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .get(CLAIMS_API + '/' + id)
      .then((response) => {
        let claim = response.data;
        if (claim.claimant) {
          dispatch(addClaimants([claim.claimant]));
          claim.claimant = claim.claimant.id;
        }
        if (claim.rating) {
          dispatch(addRatings([claim.rating]));
          claim.rating = claim.rating.id;
        }
        dispatch(getClaimByID(claim));
        dispatch(stopClaimsLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrors(error.message));
      });
  };
};

export const addClaim = (data) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .post(CLAIMS_API, data)
      .then(() => {
        let claim = response.data;
        if (claim.claimant) {
          dispatch(addClaimants([claim.claimant]));
          claim.claimant = claim.claimant.id;
        }
        if (claim.rating) {
          dispatch(addRatings([claim.rating]));
          claim.rating = claim.rating.id;
        }
        dispatch(resetClaims());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const updateClaim = (data) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .put(CLAIMS_API + '/' + data.id, data)
      .then((response) => {
        let claim = response.data;
        if (claim.claimant) {
          dispatch(addClaimants([claim.claimant]));
          claim.claimant = claim.claimant.id;
        }
        if (claim.rating) {
          dispatch(addRatings([claim.rating]));
          claim.rating = claim.rating.id;
        }
        dispatch(getClaimByID(claim));
        dispatch(stopClaimsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const deleteClaim = (id) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .delete(CLAIMS_API + '/' + id)
      .then(() => {
        dispatch(resetClaims());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addClaims = (claims) => {
  return (dispatch, getState) => {
    let claimants = [];
    let ratings = [];
    let claimsList = claims.map((claim) => {
      if (claim.claimant) claimants.push(claim.claimant);
      if (claim.rating) ratings.push(claim.rating);

      return {
        ...claim,
        claimant: claim.claimant.id,
        rating: claim.rating.id,
      };
    });
    dispatch(addClaimants(claimants));
    dispatch(addRatings(ratings));
    return dispatch(addClaimsList(claimsList));
  };
};

const loadingClaims = () => ({
  type: SET_CLAIMS_LOADING,
  payload: true,
});

const stopClaimsLoading = () => ({
  type: SET_CLAIMS_LOADING,
  payload: false,
});

const getClaimByID = (data) => ({
  type: ADD_CLAIM,
  payload: {
    ...data,
  },
});

const addClaimsList = (data) => ({
  type: ADD_CLAIMS,
  payload: { data },
});

const addClaimsRequest = (data) => ({
  type: ADD_CLAIMS_REQUEST,
  payload: {
    ...data,
  },
});

const resetClaims = () => ({
  type: RESET_CLAIMS,
});
