import {
  ADD_TAGS,
  ADD_TAGS_REQUEST,
  SET_TAGS_LOADING,
  RESET_TAGS,
  GET_TAG,
  UPDATE_TAG,
} from "../constants/tags";
import deepEqual from "deep-equal";

// Define interfaces for Tag, Query, and Request
interface Tag {
  id: string | number;
  [key: string]: any;
}

interface Query {
  [key: string]: any;
}

interface Request {
  query: Query;
  [key: string]: any;
}

// Define the state interface
interface TagsState {
  req: Request[];
  details: {
    [key: string]: Tag;
  };
  loading: boolean;
}

// Define action types
interface ResetTagsAction {
  type: typeof RESET_TAGS;
}

interface SetTagsLoadingAction {
  type: typeof SET_TAGS_LOADING;
  payload: boolean;
}

interface AddTagsRequestAction {
  type: typeof ADD_TAGS_REQUEST;
  payload: Request;
}

interface AddTagsAction {
  type: typeof ADD_TAGS;
  payload: Tag[];
}

interface GetTagAction {
  type: typeof GET_TAG;
  payload: Tag;
}

interface UpdateTagAction {
  type: typeof UPDATE_TAG;
  payload: Tag;
}

// Union type for all possible actions
type TagsActionTypes =
  | ResetTagsAction
  | SetTagsLoadingAction
  | AddTagsRequestAction
  | AddTagsAction
  | GetTagAction
  | UpdateTagAction;

const initialState: TagsState = {
  req: [],
  details: {},
  loading: true,
};

export default function tagsReducer(
  state: TagsState = initialState,
  action: TagsActionTypes = {} as TagsActionTypes
): TagsState {
  switch (action.type) {
    case RESET_TAGS:
      return {
        ...state,
        req: [],
        loading: true,
      };
    case SET_TAGS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_TAGS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_TAGS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<{ [key: string]: Tag }>(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    case GET_TAG:
    case UPDATE_TAG:
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
