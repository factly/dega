import axios from "axios";
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

// Define types
interface Rating {
  id: number;
  description: string;
  description_html?: string;
  medium?: {
    id: number;
  } | null;
  [key: string]: any;
}

interface RatingTransformed {
  id: number;
  description: {
    json: string;
    html: string;
  };
  medium?: number | null;
  [key: string]: any;
}

interface RatingsResponse {
  nodes: Rating[];
  total: number;
}

interface RatingsRequestPayload {
  data: number[];
  query: any;
  total: number;
}

interface ActionWithPayload<T, P> {
  type: T;
  payload: P;
}

type ThunkResult<R> = (dispatch: (action: any) => any) => R;

// action to create default ratings
export const addDefaultRatings = (query: any): ThunkResult<Promise<void>> => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(`${RATINGS_API}/default`)
      .then((response) => {
        const data: RatingsResponse = response.data;
        dispatch(
          addRatingsList(
            data.nodes.map((rating: Rating) => {
              const transformedRating: RatingTransformed = {
                ...rating,
                description: {
                  json: rating.description,
                  html: rating.description_html || "",
                },
                medium: rating.medium?.id || null,
              };
              return transformedRating;
            })
          )
        );
        dispatch(
          addRatingsRequest({
            data: data.nodes.map((item: Rating) => item.id),
            query: query,
            total: data.total,
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
export const getRatings = (query: any): ThunkResult<Promise<void>> => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API, {
        params: query,
      })
      .then((response) => {
        const data: RatingsResponse = response.data;
        dispatch(
          addMedia(
            data.nodes
              .filter((rating: Rating) => rating.medium)
              .map((rating: Rating) => rating.medium!)
          )
        );
        dispatch(
          addRatingsList(
            data.nodes.map((rating: Rating) => {
              const transformedRating: RatingTransformed = {
                ...rating,
                description: {
                  json: rating.description,
                  html: rating.description_html || "",
                },
                medium: rating.medium?.id || null,
              };
              return transformedRating;
            })
          )
        );
        dispatch(
          addRatingsRequest({
            data: data.nodes.map((item: Rating) => item.id),
            query: query,
            total: data.total,
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
export const getRating = (id: number): ThunkResult<Promise<void>> => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(`${RATINGS_API}/${id}`)
      .then((response) => {
        const data: Rating = response.data;
        if (data.medium) dispatch(addMedia([data.medium]));

        const transformedRating: RatingTransformed = {
          ...data,
          description: {
            json: data.description,
            html: data.description_html || "",
          },
          medium: data.medium?.id || null,
        };
        dispatch(addRating(GET_RATING, transformedRating));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

// action to create rating
export const createRating = (
  data: Omit<RatingTransformed, "id">
): ThunkResult<Promise<void>> => {
  return (dispatch) => {
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
export const updateRating = (
  data: RatingTransformed
): ThunkResult<Promise<void>> => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .put(`${RATINGS_API}/${data.id}`, data)
      .then((response) => {
        const rating: Rating = response.data;
        if (rating.medium) dispatch(addMedia([rating.medium]));

        const transformedRating: RatingTransformed = {
          ...rating,
          description: {
            json: rating.description,
            html: rating.description_html || "",
          },
          medium: rating.medium?.id || null,
        };
        dispatch(addRating(UPDATE_RATING, transformedRating));
        dispatch(addSuccessNotification("Rating updated"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopRatingsLoading()));
  };
};

// Fixed deleteRating action function
export const deleteRating = (
  id: string | number
): ThunkResult<Promise<void>> => {
  return (dispatch) => {
    // Validate ID to prevent NaN in URL
    if (id === undefined || id === null || id === "") {
      return Promise.reject(new Error("Invalid ID provided for deletion"));
    }

    dispatch(loadingRatings());

    // Use the ID as-is without conversion
    const url = `${RATINGS_API}/${id}`;

    return axios
      .delete(url)
      .then(() => {
        dispatch(resetRatings());
        dispatch(addSuccessNotification("Rating deleted successfully"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        throw error;
      })
      .finally(() => {
        dispatch(stopRatingsLoading());
      });
  };
};

export const addRatings = (ratings: Rating[]): ThunkResult<void> => {
  return (dispatch) => {
    dispatch(
      addMedia(
        ratings
          .filter((rating) => rating.medium)
          .map((rating) => rating.medium!)
      )
    );
    dispatch(
      addRatingsList(
        ratings.map((rating) => {
          return { ...rating, medium: rating.medium?.id || null };
        })
      )
    );
  };
};

export const loadingRatings = (): ActionWithPayload<
  typeof SET_RATINGS_LOADING,
  boolean
> => ({
  type: SET_RATINGS_LOADING,
  payload: true,
});

export const stopRatingsLoading = (): ActionWithPayload<
  typeof SET_RATINGS_LOADING,
  boolean
> => ({
  type: SET_RATINGS_LOADING,
  payload: false,
});

export const addRating = <T>(
  type: T,
  payload: RatingTransformed
): ActionWithPayload<T, RatingTransformed> => ({
  type,
  payload,
});

export const addRatingsList = (
  payload: RatingTransformed[]
): ActionWithPayload<typeof ADD_RATINGS, RatingTransformed[]> => ({
  type: ADD_RATINGS,
  payload,
});

export const addRatingsRequest = (
  payload: RatingsRequestPayload
): ActionWithPayload<typeof ADD_RATINGS_REQUEST, RatingsRequestPayload> => ({
  type: ADD_RATINGS_REQUEST,
  payload,
});

export const resetRatings = () => ({
  type: RESET_RATINGS,
});
