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
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

// Define types for state
interface RootState {
  spaces?: {
    selected: number;
  };
}

// Define types for API responses and entities
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

interface Description {
  json: any;
  html: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  description: Description;
  description_html?: string;
  categories: Category[] | number[];
  tags: Tag[] | number[];
  authors: Author[] | number[];
  format: Format | number;
  claims: Claim[] | number[];
  medium?: Medium | number;
  published_date?: string;
  [key: string]: any;
}

interface PostNode extends Omit<Post, "description"> {
  description: any;
  description_html: string;
  categories: Category[];
  tags: Tag[];
  authors: Author[];
  format: Format;
  claims: Claim[];
  medium?: Medium;
  published_date?: string;
}

interface PostsResponse {
  nodes: PostNode[];
  total: number;
}

// Define types for action parameters
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

interface PublishData {
  id: number;
  [key: string]: any;
}

// Define return types for actions
type AppThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType> | void,
  RootState,
  unknown,
  AnyAction
>;

export const getPosts = (query: PostsQueryParams): AppThunk => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>, getState) => {
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
      .get<PostsResponse>(POSTS_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addAuthors(
            response.data.nodes
              .filter((post) => post.authors.length > 0)
              .map((post) => {
                return post.authors;
              })
              .flat(1)
          )
        );
        dispatch(
          addTags(
            response.data.nodes
              .filter((post) => post.tags.length > 0)
              .map((post) => {
                return post.tags;
              })
              .flat(1)
          )
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter((post) => post.categories.length > 0)
              .map((post) => {
                return post.categories;
              })
              .flat(1)
          )
        );
        dispatch(
          addFormats(
            response.data.nodes
              .filter((post) => post.format)
              .map((post) => {
                return post.format;
              })
              .flat(1)
          )
        );
        dispatch(
          addClaims(
            response.data.nodes
              .filter((post) => post.claims.length > 0)
              .map((post) => {
                return post.claims;
              })
              .flat(1)
          )
        );
        dispatch(
          addMedia(
            response.data.nodes
              .filter((post) => post.medium)
              .map((post) => {
                return post.medium;
              })
          )
        );
        dispatch(
          addPostsList(
            response.data.nodes.map((post) => {
              // Ensure status is properly preserved
              const postWithDescription = {
                ...post,
                description: {
                  json: post.description,
                  html: post.description_html,
                },
                categories: post.categories.map((category) => category.id),
                tags: post.tags.map((tag) => tag.id),
                authors: post.authors.map((author) => author.id),
                format: post.format.id,
                claims: post.claims.map((claim) => claim.id),
                medium: post.medium?.id,
                status: post.status, // Explicitly set status
                published_date: post.published_date, // Ensure published_date is included
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

export const getPost = (id: number): AppThunk => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(loadingPosts());
    return axios
      .get<PostNode>(POSTS_API + "/" + id)
      .then((response) => {
        let post = response.data;
        const postWithDescription = {
          ...post,
          description: { json: post.description, html: post.description_html },
          status: post.status, // Explicitly include status
        };
        dispatch(addTags(post.tags));
        dispatch(addAuthors(post.authors));
        dispatch(addCategories(post.categories));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMedia([post.medium]));

        dispatch(
          getPostByID({
            ...postWithDescription,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            claims: post.claims.map((claim) => claim.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            medium: post.medium?.id,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPostsLoading()));
  };
};

export const addPost = (data: Partial<Post>): AppThunk<Post | undefined> => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(loadingPosts());
    return axios
      .post<PostNode>(POSTS_API, data)
      .then((response) => {
        let post = response.data;
        const postWithDescription = {
          ...post,
          description: { json: post.description, html: post.description_html },
          status: post.status, // Explicitly include status
        };
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMedia([post.medium]));

        dispatch(resetPosts());
        post.status === "publish"
          ? dispatch(addSuccessNotification(`${post.format.name} Published`))
          : post.status === "future"
          ? dispatch(
              addSuccessNotification(
                "Post added & Scheduled for future publish"
              )
            )
          : post.status === "draft"
          ? dispatch(addSuccessNotification("Post added"))
          : dispatch(addSuccessNotification("Post added & Ready to Publish"));
        return postWithDescription;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const publish = (data: PublishData): AppThunk => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(loadingPosts());
    return axios
      .post<PostNode>(POSTS_API + "/publish", data)
      .then((response) => {
        let post = response.data;
        const postWithDescription = {
          ...post,
          description: { json: post.description, html: post.description_html },
          status: post.status, // Explicitly include status
        };
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMedia([post.medium]));

        dispatch(
          getPostByID({
            ...postWithDescription,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            claims: post.claims.map((claim) => claim.id),
            medium: post.medium?.id,
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

export const addTemplate = (data: Partial<Post>): AppThunk => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(loadingPosts());
    return axios
      .post<PostNode>(POSTS_API + "/templates", data)
      .then((response) => {
        let post = response.data;
        const postWithDescription = {
          ...post,
          description: { json: post.description, html: post.description_html },
          status: post.status, // Explicitly include status
        };
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors || []));
        dispatch(addClaims(post.claims || []));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMedia([post.medium]));

        dispatch(
          getPostByID({
            ...postWithDescription,
            authors:
              (post.authors && post.authors.map((author) => author.id)) || [],
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            claims: (post.claims && post.claims.map((claim) => claim.id)) || [],
            medium: post.medium?.id,
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

export const publishPost = (data: PublishData): AppThunk => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(loadingPosts());
    return axios
      .put<PostNode>(POSTS_API + "/" + data.id + "/publish", data)
      .then((response) => {
        let post = response.data;
        const postWithDescription = {
          ...post,
          description: { json: post.description, html: post.description_html },
          status: post.status, // Explicitly include status
        };
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMedia([post.medium]));

        dispatch(
          getPostByID({
            ...postWithDescription,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            claims: post.claims.map((claim) => claim.id),
            medium: post.medium?.id,
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

export const updatePost = (data: Post): AppThunk => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(loadingPosts());
    return axios
      .put<PostNode>(POSTS_API + "/" + data.id, data)
      .then((response) => {
        let post = response.data;
        const postWithDescription = {
          ...post,
          description: { json: post.description, html: post.description_html },
          status: post.status, // Explicitly include status
        };
        dispatch(addTags(post.tags));
        dispatch(addCategories(post.categories));
        dispatch(addAuthors(post.authors));
        dispatch(addClaims(post.claims));
        dispatch(addFormats([post.format]));
        if (post.medium) dispatch(addMedia([post.medium]));

        dispatch(
          getPostByID({
            ...postWithDescription,
            authors: post.authors.map((author) => author.id),
            categories: post.categories.map((category) => category.id),
            tags: post.tags.map((tag) => tag.id),
            format: post.format.id,
            claims: post.claims.map((claim) => claim.id),
            medium: post.medium?.id,
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

export const deletePost = (id: number): AppThunk => {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch(loadingPosts());
    return axios
      .delete(POSTS_API + "/" + id)
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

export const addPostsRequest = (data: {
  data: number[];
  query: PostsQueryParams;
  total: number;
}) => ({
  type: ADD_POSTS_REQUEST,
  payload: data,
});

export const resetPosts = () => ({
  type: RESET_POSTS,
});
