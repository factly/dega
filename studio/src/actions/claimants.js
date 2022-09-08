import axios from 'axios';
import {
  ADD_CLAIMANTS,
  ADD_CLAIMANTS_REQUEST,
  SET_CLAIMANTS_LOADING,
  RESET_CLAIMANTS,
  CLAIMANTS_API,
  UPDATE_CLAIMANT,
  GET_CLAIMANT,
} from '../constants/claimants';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addMedia } from './media';
import getError from '../utils/getError';

// action to fetch all claimants
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
              claimant.description = {
                json: claimant.description,
                html: claimant.html_description,
              };
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

// action to fetch claimant by id
export const getClaimant = (id) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .get(CLAIMANTS_API + '/' + id)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));
        response.data.description = {
          json: response.data.description,
          html: response.data.html_description,
        };
        dispatch(addClaimant(GET_CLAIMANT, { ...response.data, medium: response.data.medium?.id }));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

// action to create claimant
export const createClaimant = (data) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .post(CLAIMANTS_API, data)
      .then(() => {
        dispatch(resetClaimants());
        dispatch(addSuccessNotification('Claimant created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update claimant by id
export const updateClaimant = (data) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .put(CLAIMANTS_API + '/' + data.id, data)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));
        response.data.description = {
          json: response.data.description,
          html: response.data.html_description,
        };
        dispatch(
          addClaimant(UPDATE_CLAIMANT, { ...response.data, medium: response.data.medium?.id }),
        );
        dispatch(addSuccessNotification('Claimant updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

// action to delete claimant by id
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

export const addClaimant = (type, payload) => ({
  type,
  payload,
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
