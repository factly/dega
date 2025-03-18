import {
  ADD_RATINGS,
  ADD_RATINGS_REQUEST,
  SET_RATINGS_LOADING,
  RESET_RATINGS,
  GET_RATING,
  UPDATE_RATING,
} from "../constants/ratings";
import deepEqual from "deep-equal";

// Define interfaces for our state and actions
interface Rating {
  id: string;
  [key: string]: any; // Additional rating properties
}

interface RatingsRequest {
  query: any;
  [key: string]: any; // Additional request properties
}

export interface RatingsState {
  req: RatingsRequest[];
  details: Record<string, Rating>;
  loading: boolean;
}

// Define action types
interface ResetRatingsAction {
  type: typeof RESET_RATINGS;
}

interface SetRatingsLoadingAction {
  type: typeof SET_RATINGS_LOADING;
  payload: boolean;
}

interface AddRatingsRequestAction {
  type: typeof ADD_RATINGS_REQUEST;
  payload: RatingsRequest;
}

interface AddRatingsAction {
  type: typeof ADD_RATINGS;
  payload: Rating[];
}

interface GetRatingAction {
  type: typeof GET_RATING;
  payload: Rating;
}

interface UpdateRatingAction {
  type: typeof UPDATE_RATING;
  payload: Rating;
}

type RatingsActionTypes =
  | ResetRatingsAction
  | SetRatingsLoadingAction
  | AddRatingsRequestAction
  | AddRatingsAction
  | GetRatingAction
  | UpdateRatingAction;

const initialState: RatingsState = {
  req: [],
  details: {},
  loading: true,
};

export default function ratingsReducer(
  state: RatingsState = initialState,
  action: RatingsActionTypes = {} as RatingsActionTypes
): RatingsState {
  switch (action.type) {
    case RESET_RATINGS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_RATINGS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_RATINGS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_RATINGS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<Record<string, Rating>>(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    case GET_RATING:
    case UPDATE_RATING:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    default:
      return state;
  }
}
