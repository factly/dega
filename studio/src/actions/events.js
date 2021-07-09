import axios from 'axios';
import {
  ADD_EVENT,
  ADD_EVENTS,
  ADD_EVENTS_REQUEST,
  RESET_EVENTS,
  SET_EVENTS_LOADING,
  EVENTS_API,
} from '../constants/events';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

export const addDefaultEvents = (query) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .post(EVENTS_API + '/default')
      .then((response) => {
        dispatch(addEvents(response.data.nodes));
        dispatch(
          addEventsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEventsLoading()));
  };
};

export const getEvents = (query) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .get(EVENTS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addEvents(response.data.nodes));
        dispatch(
          addEventsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEventsLoading()));
  };
};

export const getEvent = (id) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .get(EVENTS_API + '/' + id)
      .then((response) => {
        dispatch(getEventByID(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEventsLoading()));
  };
};

export const addEvent = (data) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .post(EVENTS_API, data)
      .then(() => {
        dispatch(resetEvents());
        dispatch(addSuccessNotification('Event added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updateEvent = (data) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .put(EVENTS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getEventByID(response.data));
        dispatch(addSuccessNotification('Event updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEventsLoading()));
  };
};

export const deleteEvent = (id) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .delete(EVENTS_API + '/' + id)
      .then(() => {
        dispatch(resetEvents());
        dispatch(addSuccessNotification('Event deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingEvents = () => ({
  type: SET_EVENTS_LOADING,
  payload: true,
});

export const stopEventsLoading = () => ({
  type: SET_EVENTS_LOADING,
  payload: false,
});

export const getEventByID = (data) => ({
  type: ADD_EVENT,
  payload: data,
});

export const addEvents = (data) => ({
  type: ADD_EVENTS,
  payload: data,
});

export const addEventsRequest = (data) => ({
  type: ADD_EVENTS_REQUEST,
  payload: data,
});

export const resetEvents = () => ({
  type: RESET_EVENTS,
});
