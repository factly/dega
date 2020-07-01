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
        dispatch(
          addMediaList(
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
        if (response.data.medium) dispatch(addMediaList([response.data.medium]));

        dispatch(getRatingByID({ ...response.data, medium: response.data.medium?.id }));
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
        if (response.data.medium) dispatch(addMediaList([response.data.medium]));

        dispatch(getRatingByID({ ...response.data, medium: response.data.medium?.id }));
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
    dispatch(
      addMediaList(ratings.filter((rating) => rating.medium).map((rating) => rating.medium)),
    );
    dispatch(
      addRatingsList(
        ratings.map((rating) => {
          return { ...rating, medium: rating.medium?.id };
        }),
      ),
    );
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
  payload: data,
});

const addRatingsList = (data) => ({
  type: ADD_RATINGS,
  payload: data,
});

const addRatingsRequest = (data) => ({
  type: ADD_RATINGS_REQUEST,
  payload: data,
});

const resetRatings = () => ({
  type: RESET_RATINGS,
});
