import axios from 'axios';
import {
  GET_RATINGS_SUCCESS,
  GET_RATINGS_FAILURE,
  ADD_RATING_FAILURE,
  ADD_RATING_SUCCESS,
  API_ADD_RATING,
  API_GET_RATINGS,
  UPDATE_RATING_SUCCESS,
  UPDATE_RATING_FAILURE,
  DELETE_RATING_SUCCESS,
  DELETE_RATING_FAILURE,
  LOADING_RATINGS,
  GET_RATING_SUCCESS,
  GET_RATING_FAILURE,
} from '../constants/ratings';

export const getRatings = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingRatings());
    return axios
      .get(API_GET_RATINGS, {
        params: query,
      })
      .then((response) => {
        dispatch(getRatingsSuccess(response.data, query));
      })
      .catch((error) => {
        dispatch(getRatingsFailure(error.message));
      });
  };
};

export const getRating = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingRatings());
    return axios
      .get(API_GET_RATINGS + '/' + id)
      .then((response) => {
        dispatch(getRatingSuccess(response.data));
      })
      .catch((error) => {
        dispatch(getRatingFailure(error.message));
      });
  };
};

export const addRating = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingRatings());
    return axios
      .post(API_ADD_RATING, data)
      .then((response) => {
        dispatch(addRatingSuccess(response.data));
      })
      .catch((error) => {
        dispatch(addRatingFailure(error.message));
      });
  };
};

export const updateRating = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingRatings());
    return axios
      .put(API_ADD_RATING + '/' + data.id, data)
      .then((response) => {
        dispatch(updateRatingSuccess(response.data));
      })
      .catch((error) => {
        dispatch(updateRatingFailure(error.message));
      });
  };
};

export const deleteRating = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingRatings());
    return axios
      .delete(API_ADD_RATING + '/' + id)
      .then(() => {
        dispatch(deleteRatingSuccess(id));
      })
      .catch((error) => {
        dispatch(deleteRatingFailure(error.message));
      });
  };
};

const loadingRatings = () => ({
  type: LOADING_RATINGS,
});

const getRatingsSuccess = (data, query) => ({
  type: GET_RATINGS_SUCCESS,
  payload: { data, query },
});

const getRatingsFailure = (error) => ({
  type: GET_RATINGS_FAILURE,
  payload: {
    error,
  },
});

const getRatingSuccess = (data) => ({
  type: GET_RATING_SUCCESS,
  payload: data,
});

const getRatingFailure = (error) => ({
  type: GET_RATING_FAILURE,
  payload: {
    error,
  },
});

const addRatingSuccess = (data) => ({
  type: ADD_RATING_SUCCESS,
  payload: {
    ...data,
  },
});

const addRatingFailure = (error) => ({
  type: ADD_RATING_FAILURE,
  payload: {
    error,
  },
});

const updateRatingSuccess = (data) => ({
  type: UPDATE_RATING_SUCCESS,
  payload: {
    ...data,
  },
});

const updateRatingFailure = (error) => ({
  type: UPDATE_RATING_FAILURE,
  payload: {
    error,
  },
});

const deleteRatingSuccess = (id) => ({
  type: DELETE_RATING_SUCCESS,
  payload: id,
});

const deleteRatingFailure = (error) => ({
  type: DELETE_RATING_FAILURE,
  payload: {
    error,
  },
});
