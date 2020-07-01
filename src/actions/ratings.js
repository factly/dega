import axios from 'axios';
import {
  ADD_RATING,
  ADD_RATINGS,
  ADD_RATINGS_REQUEST,
  SET_RATINGS_LOADING,
  RESET_RATINGS,
  RATINGS_API,
} from '../constants/ratings';
import { addErrors } from './notifications';
import { addMediaList } from './media';

export const getRatings = (query) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API, {
        params: query,
      })
      .then((response) => {
        const media = [];
        const ratings = response.data.nodes.map((rating) => {
          if (rating.medium_id > 0) media.push(rating.medium);
          delete rating.medium;
          return rating;
        });
        dispatch(addMediaList(media));
        dispatch(addRatingsList(ratings));
        dispatch(
          addRatingsRequest({
            data: ratings.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopRatingsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const getRating = (id) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API + '/' + id)
      .then((response) => {
        const rating = response.data;
        if (rating.medium) dispatch(addMediaList([rating.medium]));
        delete rating.medium;

        dispatch(getRatingByID(rating));
        dispatch(stopRatingsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addRating = (data) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(RATINGS_API, data)
      .then(() => {
        dispatch(resetRatings());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
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
        if (rating.medium) dispatch(addMediaList([rating.medium]));
        delete rating.medium;

        dispatch(getRatingByID(rating));
        dispatch(stopRatingsLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
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
        dispatch(addErrors(error.message));
      });
  };
};

export const addRatings = (ratings) => {
  return (dispatch) => {
    const media = [];
    const ratingsList = ratings.map((rating) => {
      if (rating.medium_id > 0) media.push(rating.medium);
      delete rating.medium;
      return rating;
    });
    dispatch(addMediaList(media));
    return dispatch(addRatingsList(ratingsList));
  };
};

const loadingRatings = () => ({
  type: SET_RATINGS_LOADING,
  payload: true,
});

const stopRatingsLoading = () => ({
  type: SET_RATINGS_LOADING,
  payload: false,
});

const getRatingByID = (data) => ({
  type: ADD_RATING,
  payload: {
    ...data,
  },
});

const addRatingsList = (data) => ({
  type: ADD_RATINGS,
  payload: { data },
});

const addRatingsRequest = (data) => ({
  type: ADD_RATINGS_REQUEST,
  payload: {
    ...data,
  },
});

const resetRatings = () => ({
  type: RESET_RATINGS,
});
