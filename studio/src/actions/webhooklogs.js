import axios from 'axios';
import {
  ADD_WEBHOOKLOGS,
  ADD_WEBHOOKLOGS_REQUEST,
  SET_WEBHOOKLOGS_LOADING,
  RESET_WEBHOOKLOGS,
} from '../constants/webhooklogs';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addEvents } from './events';
import getError from '../utils/getError';
import { WEBHOOKS_API } from '../constants/webhooks';

export const getWebhooklogs = (id, query) => {
  return (dispatch) => {
    dispatch(loadingWebhookLogs());
    return axios
      .get(WEBHOOKS_API + '/' + id + '/logs', {
        params: query,
      })
      .then((response) => {
        dispatch(addWebhooklogList(response.data.nodes));
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
      .finally(() => dispatch(stopWebhookLogsLoading()));
  };
};

export const loadingWebhookLogs = () => ({
  type: SET_WEBHOOKLOGS_LOADING,
  payload: true,
});
export const stopWebhookLogsLoading = () => ({
  type: SET_WEBHOOKLOGS_LOADING,
  payload: false,
});
export const addWebhooklogList = (data) => ({
  type: ADD_WEBHOOKLOGS,
  payload: data,
});
export const addWebhookRequest = (data) => ({
  type: ADD_WEBHOOKLOGS_REQUEST,
  payload: data,
});
export const resetWebhooks = () => ({
  type: RESET_WEBHOOKLOGS,
});
