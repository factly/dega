import axios from 'axios';
import {
  ADD_CLAIMANT,
  ADD_CLAIMANTS,
  ADD_CLAIMANTS_REQUEST,
  SET_CLAIMANTS_LOADING,
  RESET_CLAIMANTS,
  CLAIMANTS_API,
} from '../constants/claimants';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addMedia } from './media';
import getError from '../utils/getError';

export const getClaimants = (query) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .get(CLAIMANTS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addMedia(
            response.data.nodes
              .filter((claimant) => claimant.medium)
              .map((claimant) => claimant.medium),
          ),
        );
        dispatch(
          addClaimantsList(
            response.data.nodes.map((claimant) => {
              return { ...claimant, medium: claimant.medium?.id };
            }),
          ),
        );
        dispatch(
          addClaimantsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

export const getClaimant = (id) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .get(CLAIMANTS_API + '/' + id)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));

        dispatch(getClaimantByID({ ...response.data, medium: response.data.medium?.id }));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

export const addClaimant = (data) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .post(CLAIMANTS_API, data)
      .then(() => {
        dispatch(resetClaimants());
        dispatch(addSuccessNotification('Claimant added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updateClaimant = (data) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .put(CLAIMANTS_API + '/' + data.id, data)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));

        dispatch(getClaimantByID({ ...response.data, medium: response.data.medium?.id }));
        dispatch(addSuccessNotification('Claimant updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

export const deleteClaimant = (id) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .delete(CLAIMANTS_API + '/' + id)
      .then(() => {
        dispatch(resetClaimants());
        dispatch(addSuccessNotification('Claimant deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addClaimants = (claimants) => {
  return (dispatch) => {
    dispatch(
      addMedia(claimants.filter((claimant) => claimant.medium).map((claimant) => claimant.medium)),
    );
    dispatch(
      addClaimantsList(
        claimants.map((claimant) => {
          return { ...claimant, medium: claimant.medium?.id };
        }),
      ),
    );
  };
};

export const loadingClaimants = () => ({
  type: SET_CLAIMANTS_LOADING,
  payload: true,
});

export const stopClaimantsLoading = () => ({
  type: SET_CLAIMANTS_LOADING,
  payload: false,
});

export const getClaimantByID = (data) => ({
  type: ADD_CLAIMANT,
  payload: data,
});

export const addClaimantsList = (data) => ({
  type: ADD_CLAIMANTS,
  payload: data,
});

export const addClaimantsRequest = (data) => ({
  type: ADD_CLAIMANTS_REQUEST,
  payload: data,
});

export const resetClaimants = () => ({
  type: RESET_CLAIMANTS,
});
