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
import { Dispatch, AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../store/index";

// Define types for our data structures
interface Category {
  id: number;
  name?: string;
}

interface Tag {
  id: number;
  name?: string;
}

interface Author {
  id: number;
  name?: string;
}

interface Format {
  id: number;
  name: string;
}

interface Claim {
  id: number;
  name?: string;
}

interface Medium {
  id: number;
  name?: string;
}

interface Description {
  json: any;
  html: string;
}

interface Post {
  updated_at?: string;
  created_at?: string;
  published_date?: string;
  tag_ids?: number[];
  category_ids?: number[];
  author_ids?: number[];
  authors?: number[] | Array<{ id: number; display_name: string }>;
  id: number;
  title: string;
  slug: string;
  status: "publish" | "draft" | "ready";
  categories?: number[];
  tags?: number[];
  claims?: number[];
  [key: string]: any;
}

interface PostResponse {
  nodes: Post[];
  total: number;
}

interface PostsQueryParams {
  category?: number[];
  tag?: number[];
  format?: number[];
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  status?: string;
  author?: number[];
}

interface PostsRequestAction {
  data: number[];
  query: PostsQueryParams;
  total: number;
}

type ThunkResult<R> = ThunkAction<R, RootState, undefined, AnyAction>;

export const getPosts = (
  query: PostsQueryParams
): ThunkResult<Promise<void> | void> => {
  return (
    dispatch: Dispatch,
    getState: () => RootState
  ): Promise<void> | void => {
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
      .get<PostResponse>(POSTS_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addAuthors(
            response.data.nodes
              .filter(
                (post) => Array.isArray(post.authors) && post.authors.length > 0
              )
              .map((post) => {
                return post.authors as Author[];
              })
              .flat(1)
          )
        );
        dispatch(
          addTags(
            response.data.nodes
              .filter(
                (post) => Array.isArray(post.tags) && post.tags.length > 0
              )
              .map((post) => {
                return post.tags as Tag[];
              })
              .flat(1)
          )
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter(
                (post) =>
                  Array.isArray(post.categories) && post.categories.length > 0
              )
              .map((post) => {
                return post.categories as Category[];
              })
              .flat(1)
          )
        );
        dispatch(
          addFormats(
            response.data.nodes
              .filter((post) => post.format)
              .map((post) => {
                return post.format as Format;
              })
              .flat(1)
          )
        );
        dispatch(
          addClaims(
            response.data.nodes
              .filter(
                (post) => Array.isArray(post.claims) && post.claims.length > 0
              )
              .map((post) => {
                return post.claims as Claim[];
              })
              .flat(1)
          )
        );
        dispatch(
          addMedia(
            response.data.nodes
              .filter((post) => post.medium)
              .map((post) => {
                return post.medium as Medium;
              })
          )
        );
        dispatch(
          addPostsList(
            response.data.nodes.map((post) => {
              const postWithDescription = {
                ...post,
                description: {
                  json: post.description,
                  html: post.description_html,
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
              return postWithDescription;
            })
          )
        );
        dispatch(
          addPostsRequest({
            data: response.data.nodes.map((item) => item.id),
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

export const getPost = (id: number): ThunkResult<Promise<void>> => {
  return (dispatch: Dispatch): Promise<void> => {
    dispatch(loadingPosts());
    return axios
      .get<Post>(`${POSTS_API}/${id}`)
      .then((response) => {
        let post = response.data;
        post.description = {
          json: post.description,
          html: post.description_html as string,
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: (post.authors as Author[]).map((author) => author.id),
            categories: (post.categories as Category[]).map(
              (category) => category.id
            ),
            claims: (post.claims as Claim[]).map((claim) => claim.id),
            tags: (post.tags as Tag[]).map((tag) => tag.id),
            format: (post.format as Format).id,
            medium: post.medium ? (post.medium as Medium).id : undefined,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const addPost = (
  data: Partial<Post>
): ThunkResult<Promise<Post | void>> => {
  return (dispatch: Dispatch): Promise<Post | void> => {
    dispatch(loadingPosts());
    return axios
      .post<Post>(POSTS_API, data)
      .then((response) => {
        const post = response.data;
        post.description = {
          json: post.description,
          html: post.description_html as string,
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        dispatch(resetPosts());
        post.status === "publish"
          ? dispatch(
              addSuccessNotification(
                `${(post.format as Format).name} Published`
              )
            )
          : post.status === "future"
          ? dispatch(
              addSuccessNotification(
                "Post added & Scheduled for future publish"
              )
            )
          : post.status === "draft"
          ? dispatch(addSuccessNotification("Post added"))
          : dispatch(addSuccessNotification("Post added & Ready to Publish"));
        return post;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const publish = (data: Partial<Post>): ThunkResult<Promise<void>> => {
  return (dispatch: Dispatch): Promise<void> => {
    dispatch(loadingPosts());
    return axios
      .post<Post>(`${POSTS_API}/publish`, data)
      .then((response) => {
        let post = response.data;
        post.description = {
          json: post.description,
          html: post.description_html as string,
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: (post.authors as Author[]).map((author) => author.id),
            categories: (post.categories as Category[]).map(
              (category) => category.id
            ),
            tags: (post.tags as Tag[]).map((tag) => tag.id),
            format: (post.format as Format).id,
            claims: (post.claims as Claim[]).map((claim) => claim.id),
            medium: post.medium ? (post.medium as Medium).id : undefined,
          })
        );
        dispatch(addSuccessNotification("Post published"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const addTemplate = (
  data: Partial<Post>
): ThunkResult<Promise<void>> => {
  return (dispatch: Dispatch): Promise<void> => {
    dispatch(loadingPosts());
    return axios
      .post<Post>(`${POSTS_API}/templates`, data)
      .then((response) => {
        let post = response.data;
        post.description = {
          json: post.description,
          html: post.description_html as string,
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors((post.authors || []) as Author[]));
        dispatch(addClaims((post.claims || []) as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        dispatch(
          getPostByID({
            ...post,
            authors:
              (post.authors &&
                (post.authors as Author[]).map((author) => author.id)) ||
              [],
            categories: (post.categories as Category[]).map(
              (category) => category.id
            ),
            tags: (post.tags as Tag[]).map((tag) => tag.id),
            format: (post.format as Format).id,
            claims:
              (post.claims &&
                (post.claims as Claim[]).map((claim) => claim.id)) ||
              [],
            medium: post.medium ? (post.medium as Medium).id : undefined,
          })
        );
        dispatch(addSuccessNotification("Template created"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const publishPost = (data: Post): ThunkResult<Promise<void>> => {
  return (dispatch: Dispatch): Promise<void> => {
    dispatch(loadingPosts());
    return axios
      .put<Post>(`${POSTS_API}/${data.id}/publish`, data)
      .then((response) => {
        let post = response.data;
        post.description = {
          json: post.description,
          html: post.description_html as string,
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: (post.authors as Author[]).map((author) => author.id),
            categories: (post.categories as Category[]).map(
              (category) => category.id
            ),
            tags: (post.tags as Tag[]).map((tag) => tag.id),
            format: (post.format as Format).id,
            claims: (post.claims as Claim[]).map((claim) => claim.id),
            medium: post.medium ? (post.medium as Medium).id : undefined,
          })
        );
        dispatch(addSuccessNotification("Post published"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const updatePost = (data: Post): ThunkResult<Promise<void>> => {
  return (dispatch: Dispatch): Promise<void> => {
    dispatch(loadingPosts());
    return axios
      .put<Post>(`${POSTS_API}/${data.id}`, data)
      .then((response) => {
        let post = response.data;
        post.description = {
          json: post.description,
          html: post.description_html as string,
        };
        dispatch(addTags(post.tags as Tag[]));
        dispatch(addCategories(post.categories as Category[]));
        dispatch(addAuthors(post.authors as Author[]));
        dispatch(addClaims(post.claims as Claim[]));
        dispatch(addFormats([post.format as Format]));
        if (post.medium) dispatch(addMedia([post.medium as Medium]));

        dispatch(
          getPostByID({
            ...post,
            authors: (post.authors as Author[]).map((author) => author.id),
            categories: (post.categories as Category[]).map(
              (category) => category.id
            ),
            tags: (post.tags as Tag[]).map((tag) => tag.id),
            format: (post.format as Format).id,
            claims: (post.claims as Claim[]).map((claim) => claim.id),
            medium: post.medium ? (post.medium as Medium).id : undefined,
          })
        );
        data.status === "publish"
          ? dispatch(
              addSuccessNotification(
                `${(post.format as Format).name} Published`
              )
            )
          : post.status === "future"
          ? dispatch(
              addSuccessNotification(
                "Post saved & Scheduled for future publish"
              )
            )
          : data.status === "draft"
          ? dispatch(addSuccessNotification("Draft Saved"))
          : dispatch(addSuccessNotification("Draft saved & Ready to Publish"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const deletePost = (id: number): ThunkResult<Promise<void>> => {
  return (dispatch: Dispatch): Promise<void> => {
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

export const getPostByID = (data: Post) => ({
  type: ADD_POST,
  payload: data,
});

export const addPostsList = (data: Post[]) => ({
  type: ADD_POSTS,
  payload: data,
});

export const addPostsRequest = (data: PostsRequestAction) => ({
  type: ADD_POSTS_REQUEST,
  payload: data,
});

export const resetPosts = () => ({
  type: RESET_POSTS,
});
