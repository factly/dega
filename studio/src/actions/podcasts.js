import axios from 'axios';
import {
  ADD_PODCAST,
  ADD_PODCASTS,
  ADD_PODCASTS_REQUEST,
  SET_PODCASTS_LOADING,
  RESET_PODCASTS,
  PODCASTS_API,
} from '../constants/podcasts';
import { addCategories } from './categories';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

export const getPodcasts = (query) => {
  const params = new URLSearchParams();
  if (query.category && query.category.length > 0) {
    query.category.map((each) => params.append('category', each));
  }
  if (query.language) {
    params.append('language', query.language);
  }
  if (query.sort) {
    params.append('sort', query.sort);
  }
  if (query.q) {
    params.append('q', query.q);
  }
  if (query.page) {
    params.append('page', query.page);
  }
  if (query.limit) {
    params.append('limit', query.limit);
  }
  return (dispatch) => {
    dispatch(loadingPodcasts());
    return axios
      .get(PODCASTS_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addCategories(
            response.data.nodes
              .filter((podcast) => podcast.categories.length > 0)
              .map((podcast) => {
                return podcast.categories;
              })
              .flat(1),
          ),
        );
        dispatch(
          addPodcastsList(
            response.data.nodes.map((podcast) => {
              podcast.description = { json: podcast.description, html: podcast.description_html };
              return {
                ...podcast,
                categories: podcast.categories?.map((category) => category.id),
              };
            }),
          ),
        );
        dispatch(
          addPodcastsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPodcastsLoading()));
  };
};

export const getPodcast = (id) => {
  return (dispatch) => {
    dispatch(loadingPodcasts());
    return axios
      .get(PODCASTS_API + '/' + id)
      .then((response) => {
        let podcast = response.data;
        podcast.description = { json: podcast.description, html: podcast.description_html };
        dispatch(addCategories(podcast.categories));
        dispatch(
          getPodcastByID({
            ...podcast,
            categories: podcast.categories.map((category) => category.id),
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPodcastsLoading()));
  };
};

export const addPodcast = (data) => {
  return (dispatch) => {
    dispatch(loadingPodcasts());
    return axios
      .post(PODCASTS_API, data)
      .then(() => {
        dispatch(resetPodcasts());
        dispatch(addSuccessNotification('Podcast added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updatePodcast = (data) => {
  return (dispatch) => {
    dispatch(loadingPodcasts());
    return axios
      .put(PODCASTS_API + '/' + data.id, data)
      .then((response) => {
        let podcast = response.data;
        podcast.description = { json: podcast.description, html: podcast.description_html };
        dispatch(addCategories(podcast.categories));
        dispatch(
          getPodcastByID({
            ...podcast,
            categories: podcast.categories && podcast.categories.map((category) => category.id),
          }),
        );
        dispatch(addSuccessNotification('Podcast updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopPodcastsLoading()));
  };
};

export const deletePodcast = (id) => {
  return (dispatch) => {
    dispatch(loadingPodcasts());
    return axios
      .delete(PODCASTS_API + '/' + id)
      .then(() => {
        dispatch(resetPodcasts());
        dispatch(addSuccessNotification('Podcast deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const addPodcasts = (podcasts) => {
  return (dispatch) => {
    dispatch(addPodcastsList(podcasts));
  };
};

export const loadingPodcasts = () => ({
  type: SET_PODCASTS_LOADING,
  payload: true,
});

export const stopPodcastsLoading = () => ({
  type: SET_PODCASTS_LOADING,
  payload: false,
});

export const getPodcastByID = (data) => ({
  type: ADD_PODCAST,
  payload: data,
});

export const addPodcastsList = (data) => ({
  type: ADD_PODCASTS,
  payload: data,
});

export const addPodcastsRequest = (data) => ({
  type: ADD_PODCASTS_REQUEST,
  payload: data,
});

export const resetPodcasts = () => ({
  type: RESET_PODCASTS,
});
