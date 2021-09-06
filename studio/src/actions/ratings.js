import axios from 'axios';
import {
  ADD_RATING,
  ADD_RATINGS,
  ADD_RATINGS_REQUEST,
  SET_RATINGS_LOADING,
  RESET_RATINGS,
  RATINGS_API,
} from '../constants/ratings';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addMedia } from './media';
import getError from '../utils/getError';

export const addDefaultRatings = (query) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(RATINGS_API + '/default')
      .then((response) => {
        dispatch(
          addRatingsList(
            response.data.nodes.map((rating) => {
              return { ...rating, medium: rating.medium?.id };
            }),
          ),
        );
        dispatch(
          addRatingsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

export const getRatings = (query) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addMedia(
            response.data.nodes.filter((rating) => rating.medium).map((rating) => rating.medium),
          ),
        );
        dispatch(
          addRatingsList(
            response.data.nodes.map((rating) => {
              return { ...rating, medium: rating.medium?.id };
            }),
          ),
        );
        dispatch(
          addRatingsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

export const getRating = (id) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API + '/' + id)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));

        dispatch(getRatingByID({ ...response.data, medium: response.data.medium?.id }));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

export const addRating = (data) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(RATINGS_API, data)
      .then(() => {
        dispatch(resetRatings());
        dispatch(addSuccessNotification('Rating added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updateRating = (data) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .put(RATINGS_API + '/' + data.id, data)
      .then((response) => {
        const rating = response.data;
        if (rating.medium) dispatch(addMedia([rating.medium]));

        dispatch(getRatingByID({ ...rating, medium: rating.medium?.id }));
        dispatch(addSuccessNotification('Rating updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

export const deleteRating = (id) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .delete(RATINGS_API + '/' + id)
      .then(() => {
        dispatch(resetRatings());
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addRatings = (ratings) => {
  return (dispatch) => {
    dispatch(addMedia(ratings.filter((rating) => rating.medium).map((rating) => rating.medium)));
    dispatch(
      addRatingsList(
        ratings.map((rating) => {
          return { ...rating, medium: rating.medium?.id };
        }),
      ),
    );
  };
};

export const loadingRatings = () => ({
  type: SET_RATINGS_LOADING,
  payload: true,
});

export const stopRatingsLoading = () => ({
  type: SET_RATINGS_LOADING,
  payload: false,
});

export const getRatingByID = (data) => ({
  type: ADD_RATING,
  payload: data,
});

export const addRatingsList = (data) => ({
  type: ADD_RATINGS,
  payload: data,
});

export const addRatingsRequest = (data) => ({
  type: ADD_RATINGS_REQUEST,
  payload: data,
});

export const resetRatings = () => ({
  type: RESET_RATINGS,
});
