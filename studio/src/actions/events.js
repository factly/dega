import axios from 'axios';
import {
  ADD_EVENTS,
  ADD_EVENTS_REQUEST,
  RESET_EVENTS,
  SET_EVENTS_LOADING,
  EVENTS_API,
  GET_EVENT,
  UPDATE_EVENT,
} from '../constants/events';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

// action to fetch default events
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

// action to fetch all events
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

// action to fetch event by id
export const getEvent = (id) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .get(EVENTS_API + '/' + id)
      .then((response) => {
        dispatch(addEvent(GET_EVENT, response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEventsLoading()));
  };
};

// action to create event
export const createEvent = (data) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .post(EVENTS_API, data)
      .then(() => {
        dispatch(resetEvents());
        dispatch(addSuccessNotification('Event created'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

// action to update event by id
export const updateEvent = (data) => {
  return (dispatch) => {
    dispatch(loadingEvents());
    return axios
      .put(EVENTS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(addEvent(UPDATE_EVENT, response.data));
        dispatch(addSuccessNotification('Event updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopEventsLoading()));
  };
};

// action to delete event by id
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

export const addEvent = (type, payload) => ({
  type,
  payload,
});

export const addEvents = (payload) => ({
  type: ADD_EVENTS,
  payload,
});

export const addEventsRequest = (payload) => ({
  type: ADD_EVENTS_REQUEST,
  payload,
});

export const resetEvents = () => ({
  type: RESET_EVENTS,
});
