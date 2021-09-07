import axios from 'axios';
import {
  ADD_RATINGS,
  ADD_RATINGS_REQUEST,
  SET_RATINGS_LOADING,
  RESET_RATINGS,
  RATINGS_API,
  GET_RATING,
  UPDATE_RATING,
} from '../constants/ratings';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addMedia } from './media';
import getError from '../utils/getError';

// action to create default ratings
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

// action to fetch all ratings
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

// action to fetch rating by id
export const getRating = (id) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API + '/' + id)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));

        dispatch(addRating(GET_RATING, { ...response.data, medium: response.data.medium?.id }));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

// action to create rating
export const createRating = (data) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(RATINGS_API, data)
      .then(() => {
        dispatch(resetRatings());
        dispatch(addSuccessNotification('Rating created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update rating by id
export const updateRating = (data) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .put(RATINGS_API + '/' + data.id, data)
      .then((response) => {
        const rating = response.data;
        if (rating.medium) dispatch(addMedia([rating.medium]));

        dispatch(addRating(UPDATE_RATING, { ...rating, medium: rating.medium?.id }));
        dispatch(addSuccessNotification('Rating updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

// action to delete rating by id
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

export const addRating = (type, payload) => ({
  type,
  payload,
});

export const addRatingsList = (payload) => ({
  type: ADD_RATINGS,
  payload,
});

export const addRatingsRequest = (payload) => ({
  type: ADD_RATINGS_REQUEST,
  payload,
});

export const resetRatings = () => ({
  type: RESET_RATINGS,
});
