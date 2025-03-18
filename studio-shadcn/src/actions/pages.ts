import axios from "axios";
import {
  ADD_PAGE,
  ADD_PAGES,
  ADD_PAGES_REQUEST,
  RESET_PAGES,
  SET_PAGES_LOADING,
  PAGES_API,
} from "../constants/pages";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import { addMedia } from "./media";
import { addAuthors } from "./authors";
import { addTags } from "./tags";
import { addCategories } from "./categories";
import { addFormats } from "./formats";
import getError from "../utils/getError";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { RootState } from "../store/index";

// Define interfaces for the data structures
interface Author {
  id: number;
  [key: string]: any;
}

interface Tag {
  id: number;
  [key: string]: any;
}

interface Category {
  id: number;
  [key: string]: any;
}

interface Format {
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

interface Page {
  id: number;
  description: Description;
  description_html?: string;
  medium?: Medium | number;
  categories: Category[] | number[];
  tags: Tag[] | number[];
  authors: Author[] | number[];
  format: Format | number;
  status: "publish" | "future" | "draft" | string;
  [key: string]: any;
}

interface PagesResponse {
  nodes: Page[];
  total: number;
}

interface PageQuery {
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

interface PagesRequest {
  data: number[];
  query: PageQuery;
  total: number;
}

// Define action types
interface LoadingPagesAction {
  type: typeof SET_PAGES_LOADING;
  payload: boolean;
}

interface GetPageByIDAction {
  type: typeof ADD_PAGE;
  payload: Page;
}

interface AddPagesListAction {
  type: typeof ADD_PAGES;
  payload: Page[];
}

interface AddPagesRequestAction {
  type: typeof ADD_PAGES_REQUEST;
  payload: PagesRequest;
}

interface ResetPagesAction {
  type: typeof RESET_PAGES;
}

type PageActionTypes =
  | LoadingPagesAction
  | GetPageByIDAction
  | AddPagesListAction
  | AddPagesRequestAction
  | ResetPagesAction;

// Define ThunkResult type for our async actions
type ThunkResult<R> = ThunkAction<R, RootState, undefined, AnyAction>;

export const getPages = (query: PageQuery): ThunkResult<Promise<void>> => {
  return (
    dispatch: ThunkDispatch<RootState, undefined, AnyAction>,
    getState
  ): Promise<void> => {
    const currentSpaceID = getState().spaces?.selected;
    if (currentSpaceID === 0) {
      return Promise.resolve();
    }
    dispatch(loadingPages());
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
      .get<PagesResponse>(PAGES_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addAuthors(
            response.data.nodes
              .filter((page) => page.authors.length > 0)
              .map((page) => {
                return page.authors as Author[];
              })
              .flat(1)
          )
        );
        dispatch(
          addTags(
            response.data.nodes
              .filter((page) => page.tags.length > 0)
              .map((page) => {
                return page.tags as Tag[];
              })
              .flat(1)
          )
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter((page) => page.categories.length > 0)
              .map((page) => {
                return page.categories as Category[];
              })
              .flat(1)
          )
        );
        dispatch(
          addFormats(
            response.data.nodes
              .filter((page) => page.format)
              .map((page) => {
                return page.format as Format;
              })
              .flat(1)
          )
        );
        dispatch(
          addMedia(
            response.data.nodes
              .filter((page) => page.medium)
              .map((page) => page.medium as Medium)
          )
        );
        dispatch(
          addPagesList(
            response.data.nodes.map((page) => {
              const typedPage: Page = {
                ...page,
                description: {
                  json: page.description,
                  html: page.description_html as string,
                },
                medium: (page.medium as Medium)?.id,
                categories: (page.categories as Category[]).map(
                  (category) => category.id
                ),
                tags: (page.tags as Tag[]).map((tag) => tag.id),
                authors: (page.authors as Author[]).map((author) => author.id),
                format: (page.format as Format).id,
              };
              return typedPage;
            })
          )
        );
        dispatch(
          addPagesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const getPage = (id: number): ThunkResult<Promise<void>> => {
  return (
    dispatch: ThunkDispatch<RootState, undefined, AnyAction>
  ): Promise<void> => {
    dispatch(loadingPages());
    return axios
      .get<Page>(`${PAGES_API}/${id}`)
      .then((response) => {
        let page = response.data;
        page.description = {
          json: page.description,
          html: page.description_html as string,
        };
        dispatch(addTags(page.tags as Tag[]));
        dispatch(addAuthors(page.authors as Author[]));
        dispatch(addCategories(page.categories as Category[]));
        if (page.medium) dispatch(addMedia([page.medium as Medium]));

        dispatch(
          getPageByID({
            ...page,
            authors: (page.authors as Author[]).map((author) => author.id),
            categories: (page.categories as Category[]).map(
              (category) => category.id
            ),
            tags: (page.tags as Tag[]).map((tag) => tag.id),
            medium: (page.medium as Medium)?.id,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const addPage = (
  data: Omit<Page, "id">
): ThunkResult<Promise<Page | void>> => {
  return (
    dispatch: ThunkDispatch<RootState, undefined, AnyAction>
  ): Promise<Page | void> => {
    dispatch(loadingPages());
    return axios
      .post<Page>(PAGES_API, data)
      .then((response) => {
        let page = response.data;
        page.description = {
          json: page.description,
          html: page.description_html as string,
        };
        dispatch(addTags(page.tags as Tag[]));
        dispatch(addCategories(page.categories as Category[]));
        dispatch(addAuthors(page.authors as Author[]));
        if (page.medium) dispatch(addMedia([page.medium as Medium]));

        dispatch(resetPages());

        if (page.status === "publish") {
          dispatch(addSuccessNotification(`Page Published`));
        } else if (page.status === "future") {
          dispatch(
            addSuccessNotification("Page added & Scheduled for future publish")
          );
        } else if (page.status === "draft") {
          dispatch(addSuccessNotification("Page added"));
        } else {
          dispatch(addSuccessNotification("Page added & Ready to Publish"));
        }

        return page;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error);
      });
  };
};

export const updatePage = (data: Page): ThunkResult<Promise<void>> => {
  return (
    dispatch: ThunkDispatch<RootState, undefined, AnyAction>
  ): Promise<void> => {
    dispatch(loadingPages());
    return axios
      .put<Page>(`${PAGES_API}/${data.id}`, data)
      .then((response) => {
        let page = response.data;
        page.description = {
          json: page.description,
          html: page.description_html as string,
        };
        dispatch(addTags(page.tags as Tag[]));
        dispatch(addCategories(page.categories as Category[]));
        dispatch(addAuthors(page.authors as Author[]));
        if (page.medium) dispatch(addMedia([page.medium as Medium]));

        dispatch(
          getPageByID({
            ...page,
            authors: (page.authors as Author[]).map((author) => author.id),
            categories: (page.categories as Category[]).map(
              (category) => category.id
            ),
            tags: (page.tags as Tag[]).map((tag) => tag.id),
            medium: (page.medium as Medium)?.id,
          })
        );

        if (page.status === "publish") {
          dispatch(addSuccessNotification(`Page Published`));
        } else if (page.status === "future") {
          dispatch(
            addSuccessNotification("Page saved & Scheduled for future publish")
          );
        } else if (page.status === "draft") {
          dispatch(addSuccessNotification("Draft Saved"));
        } else {
          dispatch(addSuccessNotification("Draft saved & Ready to Publish"));
        }
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const deletePage = (id: number): ThunkResult<Promise<void>> => {
  return (
    dispatch: ThunkDispatch<RootState, undefined, AnyAction>
  ): Promise<void> => {
    dispatch(loadingPages());
    return axios
      .delete(`${PAGES_API}/${id}`)
      .then(() => {
        dispatch(resetPages());
        dispatch(addSuccessNotification("Page deleted"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingPages = (): LoadingPagesAction => ({
  type: SET_PAGES_LOADING,
  payload: true,
});

export const stopPagesLoading = (): LoadingPagesAction => ({
  type: SET_PAGES_LOADING,
  payload: false,
});

export const getPageByID = (data: Page): GetPageByIDAction => ({
  type: ADD_PAGE,
  payload: data,
});

export const addPagesList = (data: Page[]): AddPagesListAction => ({
  type: ADD_PAGES,
  payload: data,
});

export const addPagesRequest = (data: PagesRequest): AddPagesRequestAction => ({
  type: ADD_PAGES_REQUEST,
  payload: data,
});

export const resetPages = (): ResetPagesAction => ({
  type: RESET_PAGES,
});
