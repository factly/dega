import axios from "axios";
import {
  ADD_POST,
  ADD_POSTS,
  ADD_POSTS_REQUEST,
  SET_POSTS_LOADING,
  RESET_POSTS,
  POSTS_API,
} from "../constants/posts";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import { addCategories } from "./categories";
import { addTags } from "./tags";
import { addFormats } from "./formats";
import { addMedia } from "./media";
import { addAuthors } from "./authors";
import { addClaims } from "./claims";
import getError from "../utils/getError";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { RootState } from "../store/index";

// Type definitions
interface Author {
  id: number;
  [key: string]: any;
}

interface Category {
  id: number;
  [key: string]: any;
}

interface Tag {
  id: number;
  [key: string]: any;
}

interface Format {
  id: number;
  name: string;
  [key: string]: any;
}

interface Claim {
  id: number;
  [key: string]: any;
}

interface Medium {
  id: number;
  [key: string]: any;
}

interface PostDescription {
  json: any;
  html: string;
}

interface PostData {
  id: number;
  title?: string;
  slug?: string;
  description?: any;
  description_html?: string;
  status?: string;
  categories: Category[] | number[];
  tags: Tag[] | number[];
  authors: Author[] | number[];
  format: Format | number;
  claims: Claim[] | number[];
  medium?: Medium | number | null;
  [key: string]: any;
}

interface ProcessedPost
  extends Omit<
    PostData,
    "categories" | "tags" | "authors" | "format" | "claims" | "medium"
  > {
  categories: number[];
  tags: number[];
  authors: number[];
  format: number;
  claims: number[];
  medium?: number | null;
  description: PostDescription;
}

interface PostsRequestData {
  data: number[];
  query: QueryParams;
  total: number;
}

interface QueryParams {
  category?: number[];
  tag?: number[];
  format?: number[];
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  status?: string;
  author?: number[];
  [key: string]: any;
}

type AppThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType> | void,
  RootState,
  unknown,
  AnyAction
>;

export const getPosts = (query: QueryParams): AppThunk => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    if (currentSpaceID === 0) {
      return;
    }
    dispatch(loadingPosts());

    const params = new URLSearchParams();
    if (query.category && query.category.length > 0) {
      query.category.forEach((each) =>
        params.append("category", each.toString())
      );
    }
    if (query.tag && query.tag.length > 0) {
      query.tag.forEach((each) => params.append("tag", each.toString()));
    }
    if (query.format && query.format.length > 0) {
      query.format.forEach((each) => params.append("format", each.toString()));
    }
    if (query.page) {
      params.append("page", query.page.toString());
    }
    if (query.limit) {
      params.append("limit", query.limit.toString());
    }
    if (query.sort) {
      params.append("sort", query.sort);
    }
    if (query.q) {
      params.append("q", query.q);
    }
    if (query.status) {
      params.append("status", query.status);
    }
    if (query.author) {
      query.author.forEach((each) => params.append("author", each.toString()));
    }
    return axios
      .get(POSTS_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addAuthors(
            response.data.nodes
              .filter((post: PostData) => post.authors.length > 0)
              .map((post: PostData) => {
                return post.authors;
              })
              .flat(1)
          )
        );
        dispatch(
          addTags(
            response.data.nodes
              .filter((post: PostData) => post.tags.length > 0)
              .map((post: PostData) => {
                return post.tags;
              })
              .flat(1)
          )
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter((post: PostData) => post.categories.length > 0)
              .map((post: PostData) => {
                return post.categories;
              })
              .flat(1)
          )
        );
        dispatch(
          addFormats(
            response.data.nodes
              .filter((post: PostData) => post.format)
              .map((post: PostData) => {
                return post.format;
              })
              .flat(1)
          )
        );
        dispatch(
          addClaims(
            response.data.nodes
              .filter((post: PostData) => post.claims.length > 0)
              .map((post: PostData) => {
                return post.claims;
              })
              .flat(1)
          )
        );
        dispatch(
          addMedia(
            response.data.nodes
              .filter((post: PostData) => post.medium)
              .map((post: PostData) => {
                return post.medium;
              })
          )
        );
        dispatch(
          addPostsList(
            response.data.nodes.map((post: PostData) => {
              const processedPost: ProcessedPost = {
                ...post,
                description: {
                  json: post.description,
                  html: post.description_html || "",
                },
                categories: (post.categories as Category[]).map(
                  (category) => category.id
                ),
                tags: (post.tags as Tag[]).map((tag) => tag.id),
                authors: (post.authors as Author[]).map((author) => author.id),
                format: (post.format as Format).id,
                claims: (post.claims as Claim[]).map((claim) => claim.id),
                medium: post.medium ? (post.medium as Medium).id : undefined,
              };
              return processedPost;
            })
          )
        );
        dispatch(
          addPostsRequest({
            data: response.data.nodes.map((item: PostData) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const getPost = (id: number): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .get(`${POSTS_API}/${id}`)
      .then((response) => {
        let post: PostData = response.data;
        const processedPost: ProcessedPost = {
          ...post,
          description: {
            json: post.description,
            html: post.description_html || "",
          },
          authors: (post.authors as Author[]).map((author) => author.id),
          categories: (post.categories as Category[]).map(
            (category) => category.id
          ),
          claims: (post.claims as Claim[]).map((claim) => claim.id),
          tags: (post.tags as Tag[]).map((tag) => tag.id),
          format: (post.format as Format).id,
          medium: post.medium ? (post.medium as Medium).id : undefined,
        };

        dispatch(addTags(post.tags as Tag[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        dispatch(getPostByID(processedPost));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const addPost = (
  data: PostData
): AppThunk<Promise<PostData | undefined>> => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .post(POSTS_API, data)
      .then((response) => {
        let post: PostData = response.data;
        post.description = {
          json: post.description,
          html: post.description_html || "",
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        dispatch(resetPosts());

        const format = post.format as Format;
        if (post.status === "publish") {
          dispatch(addSuccessNotification(`${format.name} Published`));
        } else if (post.status === "future") {
          dispatch(
            addSuccessNotification("Post added & Scheduled for future publish")
          );
        } else if (post.status === "draft") {
          dispatch(addSuccessNotification("Post added"));
        } else {
          dispatch(addSuccessNotification("Post added & Ready to Publish"));
        }

        return post;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return undefined;
      });
  };
};

export const publish = (data: PostData): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .post(`${POSTS_API}/publish`, data)
      .then((response) => {
        let post: PostData = response.data;
        post.description = {
          json: post.description,
          html: post.description_html || "",
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        const processedPost: ProcessedPost = {
          ...post,
          authors: (post.authors as Author[]).map((author) => author.id),
          categories: (post.categories as Category[]).map(
            (category) => category.id
          ),
          tags: (post.tags as Tag[]).map((tag) => tag.id),
          format: (post.format as Format).id,
          claims: (post.claims as Claim[]).map((claim) => claim.id),
          medium: post.medium ? (post.medium as Medium).id : undefined,
        };

        dispatch(getPostByID(processedPost));
        dispatch(addSuccessNotification("Post published"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const addTemplate = (data: PostData): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .post(`${POSTS_API}/templates`, data)
      .then((response) => {
        let post: PostData = response.data;
        post.description = {
          json: post.description,
          html: post.description_html || "",
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));

        const authors = (post.authors as Author[]) || [];
        const claims = (post.claims as Claim[]) || [];

        dispatch(addAuthors(authors));
        dispatch(addClaims(claims));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        const processedPost: ProcessedPost = {
          ...post,
          authors: authors.map((author) => author.id),
          categories: (post.categories as Category[]).map(
            (category) => category.id
          ),
          tags: (post.tags as Tag[]).map((tag) => tag.id),
          format: (post.format as Format).id,
          claims: claims.map((claim) => claim.id),
          medium: post.medium ? (post.medium as Medium).id : undefined,
        };

        dispatch(getPostByID(processedPost));
        dispatch(addSuccessNotification("Template created"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const publishPost = (data: PostData): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .put(`${POSTS_API}/${data.id}/publish`, data)
      .then((response) => {
        let post: PostData = response.data;
        post.description = {
          json: post.description,
          html: post.description_html || "",
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        const processedPost: ProcessedPost = {
          ...post,
          authors: (post.authors as Author[]).map((author) => author.id),
          categories: (post.categories as Category[]).map(
            (category) => category.id
          ),
          tags: (post.tags as Tag[]).map((tag) => tag.id),
          format: (post.format as Format).id,
          claims: (post.claims as Claim[]).map((claim) => claim.id),
          medium: post.medium ? (post.medium as Medium).id : undefined,
        };

        dispatch(getPostByID(processedPost));
        dispatch(addSuccessNotification("Post published"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const updatePost = (data: PostData): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .put(`${POSTS_API}/${data.id}`, data)
      .then((response) => {
        let post: PostData = response.data;
        post.description = {
          json: post.description,
          html: post.description_html || "",
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        const processedPost: ProcessedPost = {
          ...post,
          authors: (post.authors as Author[]).map((author) => author.id),
          categories: (post.categories as Category[]).map(
            (category) => category.id
          ),
          tags: (post.tags as Tag[]).map((tag) => tag.id),
          format: (post.format as Format).id,
          claims: (post.claims as Claim[]).map((claim) => claim.id),
          medium: post.medium ? (post.medium as Medium).id : undefined,
        };

        dispatch(getPostByID(processedPost));

        const format = post.format as Format;
        if (data.status === "publish") {
          dispatch(addSuccessNotification(`${format.name} Published`));
        } else if (post.status === "future") {
          dispatch(
            addSuccessNotification("Post saved & Scheduled for future publish")
          );
        } else if (data.status === "draft") {
          dispatch(addSuccessNotification("Draft Saved"));
        } else {
          dispatch(addSuccessNotification("Draft saved & Ready to Publish"));
        }
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const deletePost = (id: number): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPosts());
    return axios
      .delete(`${POSTS_API}/${id}`)
      .then(() => {
        dispatch(resetPosts());
        dispatch(addSuccessNotification("Post deleted"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingPosts = () => ({
  type: SET_POSTS_LOADING,
  payload: true,
});

export const stopPostsLoading = () => ({
  type: SET_POSTS_LOADING,
  payload: false,
});

export const getPostByID = (data: ProcessedPost) => ({
  type: ADD_POST,
  payload: data,
});

export const addPostsList = (data: ProcessedPost[]) => ({
  type: ADD_POSTS,
  payload: data,
});

export const addPostsRequest = (data: PostsRequestData) => ({
  type: ADD_POSTS_REQUEST,
  payload: data,
});

export const resetPosts = () => ({
  type: RESET_POSTS,
});
