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
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      })
      .finally(() => dispatch(stopClaimsLoading()));
  };
};

export const getClaim = (id) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .get(CLAIMS_API + '/' + id)
      .then((response) => {
        let claim = response.data;
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(getClaimByID({ ...claim, claimant: claim.claimant.id, rating: claim.rating.id }));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      })
      .finally(() => dispatch(stopClaimsLoading()));
  };
};

export const addClaim = (data) => {
  return (dispatch) => {
    dispatch(loadingClaims());
    return axios
      .post(CLAIMS_API, data)
      .then((response) => {
        let claim = response.data;
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(resetClaims());
        dispatch(addSuccessNotification('Claim added'));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
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
        dispatch(addClaimants([claim.claimant]));
        dispatch(addRatings([claim.rating]));

        dispatch(getClaimByID({ ...claim, claimant: claim.claimant.id, rating: claim.rating.id }));
        dispatch(addSuccessNotification('Claim updated'));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
      })
      .finally(() => dispatch(stopClaimsLoading()));
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
        if (error.response && error.response.data && error.response.data.errors.length > 0) {
          dispatch(addErrorNotification(error.response.data.errors[0].message));
        } else {
          dispatch(addErrorNotification(error.message));
        }
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

export const getClaimByID = (data) => ({
  type: ADD_CLAIM,
  payload: data,
});

export const addClaimsList = (data) => ({
  type: ADD_CLAIMS,
  payload: data,
});

export const addClaimsRequest = (data) => ({
  type: ADD_CLAIMS_REQUEST,
  payload: data,
});

export const resetClaims = () => ({
  type: RESET_CLAIMS,
});
