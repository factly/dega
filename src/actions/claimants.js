import axios from 'axios';
import {
  ADD_CLAIMANT,
  ADD_CLAIMANTS,
  ADD_CLAIMANTS_REQUEST,
  SET_CLAIMANTS_LOADING,
  RESET_CLAIMANTS,
  CLAIMANTS_API,
} from '../constants/claimants';
import { addErrors } from './notifications';
import { addMediaList } from './media';

export const getClaimants = (query) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .get(CLAIMANTS_API, {
        params: query,
      })
      .then((response) => {
        const media = [];
        const claimants = response.data.nodes.map((claimant) => {
          if (claimant.medium_id > 0) media.push(claimant.medium);
          delete claimant.medium;
          return claimant;
        });
        dispatch(addMediaList(media));
        dispatch(addClaimantsList(claimants));
        dispatch(
          addClaimantsRequest({
            data: claimants.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopClaimantsLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrors(error.message));
      });
  };
};

export const getClaimant = (id) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .get(CLAIMANTS_API + '/' + id)
      .then((response) => {
        const claimant = response.data;
        if (claimant.medium) dispatch(addMediaList([claimant.medium]));
        delete claimant.medium;

        dispatch(getClaimantByID(claimant));
        dispatch(stopClaimantsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addClaimant = (data) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .post(CLAIMANTS_API, data)
      .then(() => {
        dispatch(resetClaimants());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const updateClaimant = (data) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .put(CLAIMANTS_API + '/' + data.id, data)
      .then((response) => {
        const claimant = response.data;
        if (claimant.medium) dispatch(addMediaList([claimant.medium]));
        delete claimant.medium;

        dispatch(getClaimantByID(claimant));
        dispatch(stopClaimantsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const deleteClaimant = (id) => {
  return (dispatch) => {
    dispatch(loadingClaimants());
    return axios
      .delete(CLAIMANTS_API + '/' + id)
      .then(() => {
        dispatch(resetClaimants());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addClaimants = (claimants) => {
  return (dispatch) => {
    const media = [];
    const claimantsList = claimants.map((claimant) => {
      if (claimant.medium_id > 0) media.push(claimant.medium);
      delete claimant.medium;
      return claimant;
    });
    dispatch(addMediaList(media));
    return dispatch(addClaimantsList(claimants));
  };
};

const loadingClaimants = () => ({
  type: SET_CLAIMANTS_LOADING,
  payload: true,
});

const stopClaimantsLoading = () => ({
  type: SET_CLAIMANTS_LOADING,
  payload: false,
});

const getClaimantByID = (data) => ({
  type: ADD_CLAIMANT,
  payload: {
    ...data,
  },
});

const addClaimantsList = (data) => ({
  type: ADD_CLAIMANTS,
  payload: { data },
});

const addClaimantsRequest = (data) => ({
  type: ADD_CLAIMANTS_REQUEST,
  payload: {
    ...data,
  },
});

const resetClaimants = () => ({
  type: RESET_CLAIMANTS,
});
