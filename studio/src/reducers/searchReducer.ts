import {
  SET_SEARCH_DETAILS_LOADING,
  ADD_SEARCH_DETAIL,
} from "../constants/search";

// Define interfaces for our data structures
interface Format {
  slug: string;
  [key: string]: any;
}

interface Item {
  kind: string;
  is_page?: boolean;
  status?: string;
  format_id?: string;
  [key: string]: any;
}

interface SearchDetails {
  articles: Item[];
  "fact-checks": Item[];
  pages: Item[];
  claims: Item[];
  tags: Item[];
  categories: Item[];
  media: Item[];
  ratings: Item[];
  total: number;
}

interface SearchState {
  req: any[];
  details: SearchDetails;
  loading: boolean;
}

// Define action types
interface SetSearchDetailsLoadingAction {
  type: typeof SET_SEARCH_DETAILS_LOADING;
  payload: boolean;
}

interface AddSearchDetailAction {
  type: typeof ADD_SEARCH_DETAIL;
  payload: {
    data: Item[];
    formats: Record<string, Format>;
  };
}

type SearchActionTypes = SetSearchDetailsLoadingAction | AddSearchDetailAction;

const initialState: SearchState = {
  req: [],
  details: {
    articles: [],
    "fact-checks": [],
    pages: [],
    claims: [],
    tags: [],
    categories: [],
    media: [],
    ratings: [],
    total: 0,
  },
  loading: true,
};

export default function searchReducer(
  state: SearchState = initialState,
  action: SearchActionTypes = {} as SearchActionTypes
): SearchState {
  switch (action.type) {
    case SET_SEARCH_DETAILS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SEARCH_DETAIL:
      const { data, formats } = action.payload;
      if (data.length === 0) {
        return initialState;
      }

      const result: SearchDetails = {
        articles: [],
        "fact-checks": [],
        pages: [],
        claims: [],
        tags: [],
        categories: [],
        media: [],
        ratings: [],
        total: 0,
      };

      const kind: Record<string, keyof SearchDetails> = {
        category: "categories",
        tag: "tags",
        claim: "claims",
        rating: "ratings",
        medium: "media",
      };

      data.forEach((each: Item) => {
        if (each.kind === "post" && each.is_page) {
          if (each.status !== "template") result.pages.push(each);
        } else if (each.kind === "post") {
          if (
            formats[each.format_id as string].slug === "article" &&
            each.status !== "template"
          ) {
            result.articles.push(each);
          }
          if (
            formats[each.format_id as string].slug === "fact-check" &&
            each.status !== "template"
          ) {
            result["fact-checks"].push(each);
          }
        } else if (kind[each.kind]) {
          result[kind[each.kind]].push(each);
        }
      });

      return {
        ...state,
        details: result,
        total: data.length,
      };
    default:
      return state;
  }
}
