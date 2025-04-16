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
import { AppThunk } from "../store/types";

interface PageQueryParams {
  category?: string[];
  tag?: string[];
  format?: string[];
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  status?: string;
  author?: string[];
}

interface PageData {
  id: number;
  title: string;
  slug: string;
  description: any;
  description_html?: string;
  status: "publish" | "draft" | "future" | string;
  medium?: { id: number } | null;
  categories: Array<{ id: number }>;
  tags: Array<{ id: number }>;
  authors: Array<{ id: number }>;
  format: { id: number };
}

interface PageRequestData {
  data: number[];
  query: PageQueryParams;
  total: number;
}

interface PageFormData {
  id: number;
  title: string;
  slug: string;
  status?: "publish" | "draft" | "ready" | "future";
  featured_medium_id?: number;
  medium?: any;
  published_date: string | null;
  categories?: number[];
  tags?: number[];
  authors?: number[];
  claims?: number[];
  description?: any;
  format?: number;
  [key: string]: any;
}

export const getPages = (query: PageQueryParams): AppThunk => {
  return (dispatch, getState) => {
    const currentSpaceID = getState().spaces?.selected;
    if (currentSpaceID === "" || currentSpaceID === "0") {
      return;
    }
    dispatch(loadingPages());
    const params = new URLSearchParams();

    if (query.category && query.category.length > 0) {
      query.category.forEach((each) => params.append("category", each));
    }
    if (query.tag && query.tag.length > 0) {
      query.tag.forEach((each) => params.append("tag", each));
    }
    if (query.format && query.format.length > 0) {
      query.format.forEach((each) => params.append("format", each));
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
      query.author.forEach((each) => params.append("author", each));
    }

    return axios
      .get(PAGES_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addAuthors(
            response.data.nodes
              .filter((page: any) => page.authors.length > 0)
              .map((page: any) => {
                return page.authors;
              })
              .flat(1)
          )
        );
        dispatch(
          addTags(
            response.data.nodes
              .filter((page: any) => page.tags.length > 0)
              .map((page: any) => {
                return page.tags;
              })
              .flat(1)
          )
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter((page: any) => page.categories.length > 0)
              .map((page: any) => {
                return page.categories;
              })
              .flat(1)
          )
        );
        dispatch(
          addFormats(
            response.data.nodes
              .filter((page: any) => page.format)
              .map((page: any) => {
                return page.format;
              })
              .flat(1)
          )
        );
        dispatch(
          addMedia(
            response.data.nodes
              .filter((page: any) => page.medium)
              .map((page: any) => page.medium)
          )
        );
        dispatch(
          addPagesList(
            response.data.nodes.map((page: any) => {
              page.description = {
                json: page.description,
                html: page.description_html,
              };
              return {
                ...page,
                medium: page.medium?.id,
                categories: page.categories.map((category: any) => category.id),
                tags: page.tags.map((tag: any) => tag.id),
                authors: page.authors.map((author: any) => author.id),
                format: page.format.id,
              };
            })
          )
        );
        dispatch(
          addPagesRequest({
            data: response.data.nodes.map((item: any) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        dispatch(
          addPagesRequest({
            data: [],
            query: query,
            total: 0,
          })
        );
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const getPage = (id: number | string): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPages());
    return axios
      .get(`${PAGES_API}/${id}`)
      .then((response) => {
        const page = response.data;
        page.description = {
          json: page.description,
          html: page.description_html,
        };
        dispatch(addTags(page.tags));
        dispatch(addAuthors(page.authors));
        dispatch(addCategories(page.categories));
        if (page.medium) dispatch(addMedia([page.medium]));

        dispatch(
          getPageByID({
            ...page,
            authors: page.authors.map((author: any) => author.id),
            categories: page.categories.map((category: any) => category.id),
            tags: page.tags.map((tag: any) => tag.id),
            medium: page.medium?.id,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const addPage = (data: PageFormData): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPages());
    return axios
      .post(PAGES_API, data)
      .then((response) => {
        const page = response.data;
        page.description = {
          json: page.description,
          html: page.description_html,
        };
        dispatch(addTags(page.tags));
        dispatch(addCategories(page.categories));
        dispatch(addAuthors(page.authors));
        if (page.medium) dispatch(addMedia([page.medium]));

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
        throw error;
      });
  };
};

export const updatePage = (data: PageFormData): AppThunk => {
  return (dispatch) => {
    dispatch(loadingPages());
    return axios
      .put(`${PAGES_API}/${data.id}`, data)
      .then((response) => {
        const page = response.data;
        page.description = {
          json: page.description,
          html: page.description_html,
        };
        dispatch(addTags(page.tags));
        dispatch(addCategories(page.categories));
        dispatch(addAuthors(page.authors));
        if (page.medium) dispatch(addMedia([page.medium]));

        dispatch(
          getPageByID({
            ...page,
            authors: page.authors.map((author: any) => author.id),
            categories: page.categories.map((category: any) => category.id),
            tags: page.tags.map((tag: any) => tag.id),
            medium: page.medium?.id,
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

        return page;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        throw error; // Re-throw error to allow further catch handling
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const deletePage = (id: number): AppThunk => {
  return (dispatch) => {
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

export const loadingPages = () => ({
  type: SET_PAGES_LOADING,
  payload: true,
});

export const stopPagesLoading = () => ({
  type: SET_PAGES_LOADING,
  payload: false,
});

export const getPageByID = (data: PageData) => ({
  type: ADD_PAGE,
  payload: data,
});

export const addPagesList = (data: PageData[]) => ({
  type: ADD_PAGES,
  payload: data,
});

export const addPagesRequest = (data: PageRequestData) => ({
  type: ADD_PAGES_REQUEST,
  payload: data,
});

export const resetPages = () => ({
  type: RESET_PAGES,
});
