import {
  ADD_MEDIA,
  ADD_MEDIA_REQUEST,
  SET_MEDIA_LOADING,
  RESET_MEDIA,
  GET_MEDIUM,
  UPDATE_MEDIUM,
} from "../constants/media";
import deepEqual from "deep-equal";

// Define interfaces for the state and actions
export interface Medium {
  id: string | number;
  [key: string]: any;
}

interface MediaRequest {
  query: Record<string, any>;
  data: (string | number)[];
  total: number;
}

export interface MediaState {
  req: MediaRequest[];
  details: Record<string | number, Medium>;
  loading: boolean;
}

interface ResetMediaAction {
  type: typeof RESET_MEDIA;
}

interface SetMediaLoadingAction {
  type: typeof SET_MEDIA_LOADING;
  payload: boolean;
}

interface AddMediaRequestAction {
  type: typeof ADD_MEDIA_REQUEST;
  payload: MediaRequest;
}

interface AddMediaAction {
  type: typeof ADD_MEDIA;
  payload: Medium[];
}

interface GetMediumAction {
  type: typeof GET_MEDIUM;
  payload: Medium;
}

interface UpdateMediumAction {
  type: typeof UPDATE_MEDIUM;
  payload: Medium;
}

type MediaActionTypes =
  | ResetMediaAction
  | SetMediaLoadingAction
  | AddMediaRequestAction
  | AddMediaAction
  | GetMediumAction
  | UpdateMediumAction;

const initialState: MediaState = {
  req: [],
  details: {},
  loading: true,
};

export default function mediaReducer(
  state: MediaState = initialState,
  action: MediaActionTypes = {} as MediaActionTypes
): MediaState {
  switch (action.type) {
    case RESET_MEDIA:
      return {
        ...state,
        req: [],
        loading: true,
      };
    case SET_MEDIA_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_MEDIA_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_MEDIA:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<Record<string | number, Medium>>(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    case GET_MEDIUM:
    case UPDATE_MEDIUM:
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
