import axios from 'axios';
import {
  ADD_WEBHOOK,
  ADD_WEBHOOKS,
  ADD_WEBHOOKS_REQUEST,
  SET_WEBHOOKS_LOADING,
  RESET_WEBHOOKS,
  WEBHOOKS_API,
} from '../constants/webhooks';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addEvents } from './events';
import getError from '../utils/getError';

export const getWebhooks = (query) => {
  return (dispatch) => {
    dispatch(loadingWebhooks());
    return axios
      .get(WEBHOOKS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addEvents(
            response.data.nodes
              .filter((webhook) => webhook.events.length > 0)
              .map((webhook) => {
                return webhook.events;
              })
              .flat(1),
          ),
        );
        dispatch(
          addWebhookList(
            response.data.nodes.map((webhook) => {
              return { ...webhook, events: webhook.events.map((event) => event.id) };
            }),
          ),
        );
        dispatch(
          addWebhookRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopWebhooksLoading()));
  };
};

export const getWebhook = (id) => {
  return (dispatch) => {
    dispatch(loadingWebhooks());
    return axios
      .get(WEBHOOKS_API + '/' + id)
      .then((response) => {
        let webhook = response.data;
        dispatch(addEvents(webhook.events));
        dispatch(
          getWebhookByID({
            ...webhook,
            events: webhook.events.map((event) => event.id),
          }),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopWebhooksLoading()));
  };
};

export const addWebhook = (data) => {
  return (dispatch) => {
    dispatch(loadingWebhooks());
    return axios
      .post(WEBHOOKS_API, data)
      .then((response) => {
        let webhook = response.data;
        dispatch(addEvents(webhook.events));
        dispatch(resetWebhooks());
        dispatch(addSuccessNotification('Webhook added'));
        return webhook;
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const updateWebhook = (data) => {
  return (dispatch) => {
    dispatch(loadingWebhooks());
    return axios
      .put(WEBHOOKS_API + '/' + data.id, data)
      .then((response) => {
        let webhook = response.data;
        dispatch(addEvents(webhook.events));
        dispatch(
          getWebhookByID({
            ...webhook,
            events: webhook.events.map((event) => event.id),
          }),
        );
        dispatch(addSuccessNotification('Webhook updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopWebhooksLoading()));
  };
};

export const deleteWebhook = (id) => {
  return (dispatch) => {
    dispatch(loadingWebhooks());
    return axios
      .delete(WEBHOOKS_API + '/' + id)
      .then(() => {
        dispatch(resetWebhooks());
        dispatch(addSuccessNotification('Webhook deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const loadingWebhooks = () => ({
  type: SET_WEBHOOKS_LOADING,
  payload: true,
});
export const stopWebhooksLoading = () => ({
  type: SET_WEBHOOKS_LOADING,
  payload: false,
});
export const getWebhookByID = (data) => ({
  type: ADD_WEBHOOK,
  payload: data,
});
export const addWebhookList = (data) => ({
  type: ADD_WEBHOOKS,
  payload: data,
});
export const addWebhookRequest = (data) => ({
  type: ADD_WEBHOOKS_REQUEST,
  payload: data,
});
export const resetWebhooks = () => ({
  type: RESET_WEBHOOKS,
});
