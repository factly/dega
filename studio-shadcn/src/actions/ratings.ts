import axios from "axios";
import { Dispatch } from "redux";
import {
  ADD_RATINGS,
  ADD_RATINGS_REQUEST,
  SET_RATINGS_LOADING,
  RESET_RATINGS,
  RATINGS_API,
  GET_RATING,
  UPDATE_RATING,
} from "../constants/ratings";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import { addMedia } from "./media";
import getError from "../utils/getError";
import { Rating, RatingsRequest, RatingsAction } from "./types";

// action to create default ratings
export const addDefaultRatings = (query: any) => {
  return (dispatch: Dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(`${RATINGS_API}/default`)
      .then((response) => {
        const ratings: Rating[] = response.data.nodes.map((rating: Rating) => ({
          ...rating,
          description: {
            json: rating.description,
            html: rating.description_html,
          },
          medium: rating.medium?.id,
        }));

        dispatch(addRatingsList(ratings));
        dispatch(
          addRatingsRequest({
            data: response.data.nodes.map((item: Rating) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

// action to fetch all ratings
export const getRatings = (query: any) => {
  return (dispatch: Dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API, {
        params: query,
      })
      .then((response) => {
        const mediaItems = response.data.nodes
          .filter((rating: Rating) => rating.medium)
          .map((rating: Rating) => rating.medium);

        dispatch(addMedia(mediaItems));

        const ratings: Rating[] = response.data.nodes.map((rating: Rating) => ({
          ...rating,
          description: {
            json: rating.description,
            html: rating.description_html,
          },
          medium: rating.medium?.id,
        }));

        dispatch(addRatingsList(ratings));
        dispatch(
          addRatingsRequest({
            data: response.data.nodes.map((item: Rating) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

// action to fetch rating by id
export const getRating = (id: number) => {
  return (dispatch: Dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(`${RATINGS_API}/${id}`)
      .then((response) => {
        const rating: Rating = response.data;
        if (rating.medium) dispatch(addMedia([rating.medium]));

        rating.description = {
          json: rating.description,
          html: rating.description_html || "",
        };

        dispatch(
          addRating(GET_RATING, { ...rating, medium: rating.medium?.id })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

// action to create rating
export const createRating = (data: Partial<Rating>) => {
  return (dispatch: Dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(RATINGS_API, data)
      .then(() => {
        dispatch(resetRatings());
        dispatch(addSuccessNotification("Rating created"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update rating by id
export const updateRating = (data: Rating) => {
  return (dispatch: Dispatch) => {
    dispatch(loadingRatings());
    return axios
      .put(`${RATINGS_API}/${data.id}`, data)
      .then((response) => {
        const rating: Rating = response.data;
        if (rating.medium) dispatch(addMedia([rating.medium]));

        rating.description = {
          json: rating.description,
          html: rating.description_html || "",
        };

        dispatch(
          addRating(UPDATE_RATING, { ...rating, medium: rating.medium?.id })
        );
        dispatch(addSuccessNotification("Rating updated"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

// action to delete rating by id
export const deleteRating = (id: number) => {
  return (dispatch: Dispatch) => {
    dispatch(loadingRatings());
    return axios
      .delete(`${RATINGS_API}/${id}`)
      .then(() => {
        dispatch(resetRatings());
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addRatings = (ratings: Rating[]) => {
  return (dispatch: Dispatch) => {
    const mediaItems = ratings
      .filter((rating) => rating.medium)
      .map((rating) => rating.medium);

    dispatch(addMedia(mediaItems));
    dispatch(
      addRatingsList(
        ratings.map((rating) => ({
          ...rating,
          medium: rating.medium?.id,
        }))
      )
    );
  };
};

export const loadingRatings = (): RatingsAction => ({
  type: SET_RATINGS_LOADING,
  payload: true,
});

export const stopRatingsLoading = (): RatingsAction => ({
  type: SET_RATINGS_LOADING,
  payload: false,
});

export const addRating = (type: string, payload: Rating): RatingsAction => ({
  type,
  payload,
});

export const addRatingsList = (payload: Rating[]): RatingsAction => ({
  type: ADD_RATINGS,
  payload,
});

export const addRatingsRequest = (payload: RatingsRequest): RatingsAction => ({
  type: ADD_RATINGS_REQUEST,
  payload,
});

export const resetRatings = (): RatingsAction => ({
  type: RESET_RATINGS,
  payload: undefined,
});
