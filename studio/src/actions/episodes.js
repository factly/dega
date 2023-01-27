import axios from 'axios';
import {
  ADD_EPISODES,
  ADD_EPISODES_REQUEST,
  SET_EPISODES_LOADING,
  RESET_EPISODES,
  EPISODES_API,
  UPDATE_EPISODE,
  GET_EPISODE,
} from '../constants/episodes';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';
import { addPodcasts } from './podcasts';

// action to fetch all episodes
export const getEpisodes = (query) => {
  const params = new URLSearchParams();
  if (query.podcast && query.podcast.length > 0) {
    query.podcast.map((each) => params.append('podcast', each));
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
  return (dispatch) => {
    dispatch(loadingEpisodes());
    return axios
      .get(EPISODES_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addPodcasts(
            response.data.nodes
              .filter((episode) => episode.podcast.id > 0)
              .map((episode) => {
                return episode.podcast;
              })
              .flat(1),
          ),
        );
        dispatch(
          addEpisodes(
            response.data.nodes.map((episode) => {
              episode.description = { json: episode.description, html: episode.description_html };
              // !here we need to delete the description_html field
              delete episode.description_html;
              return { ...episode, podcast: episode.podcast.id };
            }),
          ),
        );
        dispatch(
          addEpisodesRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEpisodesLoading()));
  };
};

// action to fetch episode by id
export const getEpisode = (id) => {
  return (dispatch) => {
    dispatch(loadingEpisodes());
    return axios
      .get(EPISODES_API + '/' + id)
      .then((response) => {
        let episode = response.data;
        episode.description = { json: episode.description, html: episode.description_html };
        // ! here we need to delete the description_html field also
        delete episode.description_html;
        if (episode.podcast.id > 0) dispatch(addPodcasts([episode.podcast]));
        dispatch(addEpisode(GET_EPISODE, { ...episode, podcast: episode.podcast.id }));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEpisodesLoading()));
  };
};

// action to create episode
export const createEpisode = (data) => {
  return (dispatch) => {
    dispatch(loadingEpisodes());
    return axios
      .post(EPISODES_API, data)
      .then(() => {
        dispatch(resetEpisodes());
        dispatch(addSuccessNotification('Episode created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update episode by id
export const updateEpisode = (data) => {
  return (dispatch) => {
    dispatch(loadingEpisodes());
    return axios
      .put(EPISODES_API + '/' + data.id, data)
      .then((response) => {
        let episode = response.data;
        if ((!response.data.description)
          ||(response.data.hasOwnProperty('description_html'))
          || (!response.data.description.hasOwnProperty('json') && !response.data.description.hasOwnProperty('html'))) {
          response.data.description = {
            json: response.data.description,
            html: response.data.description_html,
          };
          delete response.data.description_html
        }
        if (episode.podcast.id > 0) dispatch(addPodcasts([episode.podcast]));
        dispatch(addEpisode(UPDATE_EPISODE, { ...episode, podcast: episode.podcast.id }));
        dispatch(addSuccessNotification('Episode updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEpisodesLoading()));
  };
};

// action to delete episode by id
export const deleteEpisode = (id) => {
  return (dispatch) => {
    dispatch(loadingEpisodes());
    return axios
      .delete(EPISODES_API + '/' + id)
      .then(() => {
        dispatch(resetEpisodes());
        dispatch(addSuccessNotification('Episode deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingEpisodes = () => ({
  type: SET_EPISODES_LOADING,
  payload: true,
});

export const stopEpisodesLoading = () => ({
  type: SET_EPISODES_LOADING,
  payload: false,
});

export const addEpisode = (type, payload) => ({
  type,
  payload,
});

export const addEpisodes = (payload) => ({
  type: ADD_EPISODES,
  payload,
});

export const addEpisodesRequest = (payload) => ({
  type: ADD_EPISODES_REQUEST,
  payload,
});

export const resetEpisodes = () => ({
  type: RESET_EPISODES,
});
