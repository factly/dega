import { ADD_INFO, SET_INFO_LOADING } from "../constants/info";

// Define interfaces for the state structure
interface ArticleFactCheckState {
  draft: number;
  template: number;
  publish: number;
  ready?: number;
}

interface InfoState {
  categories: number;
  tag: number;
  article: ArticleFactCheckState;
  factCheck: ArticleFactCheckState;
  loading: boolean;
  [key: string]: any;
}

// Define interface for post objects in the payload
interface Post {
  slug: string;
  status: "draft" | "template" | "publish" | "ready";
  count: number;
}

// Define interface for action
interface InfoAction {
  type: string;
  payload?: {
    posts?: Post[];
    [key: string]: any;
  };
}

const initialState: InfoState = {
  categories: 0,
  tag: 0,
  article: {
    draft: 0,
    template: 0,
    publish: 0,
  },
  factCheck: {
    draft: 0,
    template: 0,
    publish: 0,
  },
  loading: true,
};

export default function infoReducer(
  state: InfoState = initialState,
  action: InfoAction = {}
): InfoState {
  if (!action.payload) {
    return state;
  }

  switch (action.type) {
    case SET_INFO_LOADING:
      return {
        ...state,
        loading: action.payload.loading,
      };

    case ADD_INFO:
      const posts = action.payload.posts || [];

      let article: ArticleFactCheckState = {
        draft: 0,
        template: 0,
        publish: 0,
        ready: 0,
      };

      let factCheck: ArticleFactCheckState = {
        draft: 0,
        template: 0,
        publish: 0,
        ready: 0,
      };

      posts.forEach((each) => {
        if (each.slug === "article") {
          article[each.status] = each.count;
        }
        if (each.slug === "fact-check") {
          factCheck[each.status] = each.count;
        }
      });

      return {
        ...action.payload,
        article,
        factCheck,
      };

    default:
      return state;
  }
}
