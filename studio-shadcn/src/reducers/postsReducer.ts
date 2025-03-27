import {
  ADD_POST,
  ADD_POSTS,
  ADD_POSTS_REQUEST,
  SET_POSTS_LOADING,
  RESET_POSTS,
} from "../constants/posts";
import deepEqual from "deep-equal";

// Define interfaces for the state and actions
interface Post {
  id: string | number;
  [key: string]: any;
}

interface PostsState {
  req: RequestItem[];
  details: Record<string | number, Post>;
  loading: boolean;
}

interface RequestItem {
  query: any;
  [key: string]: any;
}

// Action interfaces
interface ResetPostsAction {
  type: typeof RESET_POSTS;
}

interface SetPostsLoadingAction {
  type: typeof SET_POSTS_LOADING;
  payload: boolean;
}

interface AddPostsRequestAction {
  type: typeof ADD_POSTS_REQUEST;
  payload: RequestItem;
}

interface AddPostsAction {
  type: typeof ADD_POSTS;
  payload: Post[];
}

interface AddPostAction {
  type: typeof ADD_POST;
  payload: Post;
}

// Union type for all possible action types
type PostAction =
  | ResetPostsAction
  | SetPostsLoadingAction
  | AddPostsRequestAction
  | AddPostsAction
  | AddPostAction;

const initialState: PostsState = {
  req: [],
  details: {},
  loading: true,
};

export default function postsReducer(
  state: PostsState = initialState,
  action: PostAction = {} as PostAction
): PostsState {
  switch (action.type) {
    case RESET_POSTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_POSTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_POSTS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_POSTS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<Record<string | number, Post>>(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {}
          ),
        },
      };
    case ADD_POST:
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
