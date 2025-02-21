import {
    ADD_RATINGS,
    ADD_RATINGS_REQUEST,
    SET_RATINGS_LOADING,
    RESET_RATINGS,
    GET_RATING,
    UPDATE_RATING,
  } from '../constants/ratings';
  import deepEqual from 'deep-equal';
  
  // Define interfaces for the rating object
  interface Rating {
    id: string | number;
    [key: string]: any; // Additional rating properties
  }
  
  // Define interface for the request query
  interface RatingRequest {
    query: {
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  // Define interface for the state
  interface RatingsState {
    req: RatingRequest[];
    details: {
      [key: string]: Rating;
    };
    loading: boolean;
  }
  
  // Define type for all possible actions
  type RatingsAction = 
    | { type: typeof RESET_RATINGS }
    | { type: typeof SET_RATINGS_LOADING; payload: boolean }
    | { type: typeof ADD_RATINGS_REQUEST; payload: RatingRequest }
    | { type: typeof ADD_RATINGS; payload: Rating[] }
    | { type: typeof GET_RATING; payload: Rating }
    | { type: typeof UPDATE_RATING; payload: Rating };
  
  const initialState: RatingsState = {
    req: [],
    details: {},
    loading: true,
  };
  
  export default function ratingsReducer(
    state: RatingsState = initialState,
    action: RatingsAction = { type: RESET_RATINGS }
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
            ...action.payload.reduce<{ [key: string]: Rating }>(
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