import {
  ADD_FORMATS,
  ADD_FORMATS_REQUEST,
  SET_FORMATS_LOADING,
  RESET_FORMATS,
  GET_FORMAT,
  UPDATE_FORMAT,
} from "../constants/formats";
import deepEqual from "deep-equal";

// Define interfaces for the state and format objects
interface Format {
  id: string;
  [key: string]: any;
}

interface FormatRequest {
  query: any;
  [key: string]: any;
}

interface FormatsState {
  req: FormatRequest[];
  details: {
    [key: string]: Format;
  };
  loading: boolean;
}

// Define action types
interface ResetFormatsAction {
  type: typeof RESET_FORMATS;
}

interface SetFormatsLoadingAction {
  type: typeof SET_FORMATS_LOADING;
  payload: boolean;
}

interface AddFormatsRequestAction {
  type: typeof ADD_FORMATS_REQUEST;
  payload: FormatRequest;
}

interface AddFormatsAction {
  type: typeof ADD_FORMATS;
  payload: Format[];
}

interface GetFormatAction {
  type: typeof GET_FORMAT;
  payload: Format;
}

interface UpdateFormatAction {
  type: typeof UPDATE_FORMAT;
  payload: Format;
}

// Union type for all possible actions
type FormatActionTypes =
  | ResetFormatsAction
  | SetFormatsLoadingAction
  | AddFormatsRequestAction
  | AddFormatsAction
  | GetFormatAction
  | UpdateFormatAction;

const initialState: FormatsState = {
  req: [],
  details: {},
  loading: true,
};

export default function formatsReducer(
  state: FormatsState = initialState,
  action: FormatActionTypes = {} as FormatActionTypes
): FormatsState {
  switch (action.type) {
    case RESET_FORMATS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_FORMATS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_FORMATS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_FORMATS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {} as { [key: string]: Format }
          ),
        },
      };
    case GET_FORMAT:
    case UPDATE_FORMAT:
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
