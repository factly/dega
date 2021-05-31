import axios from 'axios';
import {
  ADD_PAGE,
  ADD_PAGES,
  ADD_PAGES_REQUEST,
  RESET_PAGES,
  SET_PAGES_LOADING,
  PAGES_API,
} from '../constants/pages';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addMediaList } from './media';
import { addAuthors } from './authors';
import { addTags } from './tags';
import { addCategories } from './categories';
import { addFormats } from './formats';
import getError from '../utils/getError';

export const getPages = (query) => {
  return (dispatch) => {
    dispatch(loadingPages());
    const params = new URLSearchParams();

    if (query.category && query.category.length > 0) {
      query.category.map((each) => params.append('category', each));
    }
    if (query.tag && query.tag.length > 0) {
      query.tag.map((each) => params.append('tag', each));
    }
    if (query.format && query.format.length > 0) {
      query.format.map((each) => params.append('format', each));
    }
    if (query.page) {
      params.append('page', query.page);
    }
    if (query.limit) {
      params.append('limit', query.limit);
    }
    if (query.sort) {
      params.append('sort', query.sort);
    }
    if (query.q) {
      params.append('q', query.q);
    }
    if (query.status) {
      params.append('status', query.status);
    }
    if (query.author) {
      query.author.map((each) => params.append('author', each));
    }

    return axios
      .get(PAGES_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addAuthors(
            response.data.nodes
              .filter((page) => page.authors.length > 0)
              .map((page) => {
                return page.authors;
              })
              .flat(1),
          ),
        );
        dispatch(
          addTags(
            response.data.nodes
              .filter((page) => page.tags.length > 0)
              .map((page) => {
                return page.tags;
              })
              .flat(1),
          ),
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter((page) => page.categories.length > 0)
              .map((page) => {
                return page.categories;
              })
              .flat(1),
          ),
        );
        dispatch(
          addFormats(
            response.data.nodes
              .filter((page) => page.format)
              .map((page) => {
                return page.format;
              })
              .flat(1),
          ),
        );
        dispatch(
          addMediaList(
            response.data.nodes.filter((page) => page.medium).map((page) => page.medium),
          ),
        );
        dispatch(
          addPagesList(
            response.data.nodes.map((page) => {
              return {
                ...page,
                medium: page.medium?.id,
                categories: page.categories.map((category) => category.id),
                tags: page.tags.map((tag) => tag.id),
                authors: page.authors.map((author) => author.id),
                format: page.format.id,
              };
            }),
          ),
        );
        dispatch(
          addPagesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const getPage = (id) => {
  return (dispatch) => {
    dispatch(loadingPages());
    return axios
      .get(PAGES_API + '/' + id)
      .then((response) => {
        let page = response.data;

        dispatch(addTags(page.tags));
        dispatch(addAuthors(page.authors));
        dispatch(addCategories(page.categories));
        if (page.medium) dispatch(addMediaList([page.medium]));

        dispatch(
          getPageByID({
            ...page,
            authors: page.authors.map((author) => author.id),
            categories: page.categories.map((category) => category.id),
            tags: page.tags.map((tag) => tag.id),
            medium: page.medium?.id,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const addPage = (data) => {
  return (dispatch) => {
    dispatch(loadingPages());
    return axios
      .post(PAGES_API, data)
      .then((response) => {
        let page = response.data;
        dispatch(addTags(page.tags));
        dispatch(addCategories(page.categories));
        dispatch(addAuthors(page.authors));
        if (page.medium) dispatch(addMediaList([page.medium]));

        dispatch(resetPages());
        data.status === 'publish'
          ? dispatch(addSuccessNotification(`Page Published`))
          : data.status === 'draft'
          ? dispatch(addSuccessNotification('Page added'))
          : dispatch(addSuccessNotification('Page added & Ready to Publish'));
        return page;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updatePage = (data) => {
  return (dispatch) => {
    dispatch(loadingPages());
    return axios
      .put(PAGES_API + '/' + data.id, data)
      .then((response) => {
        let page = response.data;
        dispatch(addTags(page.tags));
        dispatch(addCategories(page.categories));
        dispatch(addAuthors(page.authors));
        if (page.medium) dispatch(addMediaList([page.medium]));

        dispatch(
          getPageByID({
            ...page,
            authors: page.authors.map((author) => author.id),
            categories: page.categories.map((category) => category.id),
            tags: page.tags.map((tag) => tag.id),
            medium: page.medium?.id,
          }),
        );
        data.status === 'publish'
          ? dispatch(addSuccessNotification(`Page Published`))
          : data.status === 'draft'
          ? dispatch(addSuccessNotification('Draft Saved'))
          : dispatch(addSuccessNotification('Draft saved & Ready to Publish'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPagesLoading()));
  };
};

export const deletePage = (id) => {
  return (dispatch) => {
    dispatch(loadingPages());
    return axios
      .delete(PAGES_API + '/' + id)
      .then(() => {
        dispatch(resetPages());
        dispatch(addSuccessNotification('Page deleted'));
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

export const getPageByID = (data) => ({
  type: ADD_PAGE,
  payload: data,
});

export const addPagesList = (data) => ({
  type: ADD_PAGES,
  payload: data,
});

export const addPagesRequest = (data) => ({
  type: ADD_PAGES_REQUEST,
  payload: data,
});

export const resetPages = () => ({
  type: RESET_PAGES,
});
