import axios from 'axios';
import {
  ADD_CLAIM,
  ADD_CLAIMS,
  ADD_CLAIMS_REQUEST,
  SET_CLAIMS_LOADING,
  RESET_CLAIMS,
  CLAIMS_API,
} from '../constants/claims';
import { addErrorNotification, addSuccessNotification } from './notifications';
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
              return { ...claim, claimant: claim.claimant?.id, rating: claim.rating?.id };
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
        dispatch(stopClaimsLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
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
        if (claim.claimant) dispatch(addClaimants([claim.claimant]));
        if (claim.rating) dispatch(addRatings([claim.rating]));

        dispatch(getClaimByID({ ...claim, claimant: claim.claimant.id, rating: claim.rating.id }));
        dispatch(stopClaimsLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addClaim = (data) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .post(CLAIMS_API, data)
      .then((response) => {
        let claim = response.data;
        if (claim.claimant) dispatch(addClaimants([claim.claimant]));
        if (claim.rating) dispatch(addRatings([claim.rating]));

        dispatch(resetClaims());
        dispatch(addSuccessNotification('Claim added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
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
        if (claim.claimant) dispatch(addClaimants([claim.claimant]));
        if (claim.rating) dispatch(addRatings([claim.rating]));

        dispatch(getClaimByID({ ...claim, claimant: claim.claimant.id, rating: claim.rating.id }));
        dispatch(stopClaimsLoading());
        dispatch(addSuccessNotification('Claim updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
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
        dispatch(addSuccessNotification('Claim deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
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
          return { ...claim, claimant: claim.claimant?.id, rating: claim.rating?.id };
        }),
      ),
    );
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
  payload: data,
});

const addClaimsList = (data) => ({
  type: ADD_CLAIMS,
  payload: data,
});

const addClaimsRequest = (data) => ({
  type: ADD_CLAIMS_REQUEST,
  payload: data,
});

const resetClaims = () => ({
  type: RESET_CLAIMS,
});
