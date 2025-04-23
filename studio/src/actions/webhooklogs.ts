import axios from "axios";
import {
  ADD_WEBHOOKLOGS,
  ADD_WEBHOOKLOGS_REQUEST,
  SET_WEBHOOKLOGS_LOADING,
  RESET_WEBHOOKLOGS,
} from "../constants/webhooklogs";
import { addErrorNotification } from "./notifications";
import getError from "../utils/getError";
import { WEBHOOKS_API } from "../constants/webhooks";

// Define interfaces
interface WebhookLog {
  id: string;
  [key: string]: any; // For any additional properties
}

interface WebhookLogAction {
  type: string;
  payload: any;
}

interface WebhookLogRequestData {
  data: string[];
  query: any;
  total: number;
}

export const getWebhooklogs = (id: string, query: any) => {
  return (dispatch: (action: any) => void) => {
    dispatch(loadingWebhookLogs());
    return axios
      .get(`${WEBHOOKS_API}/${id}/logs`, {
        params: query,
      })
      .then((response) => {
        dispatch(addWebhooklogList(response.data.nodes));
        dispatch(
          addWebhookRequest({
            data: response.data.nodes.map((item: WebhookLog) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopWebhookLogsLoading()));
  };
};

export const loadingWebhookLogs = (): WebhookLogAction => ({
  type: SET_WEBHOOKLOGS_LOADING,
  payload: true,
});

export const stopWebhookLogsLoading = (): WebhookLogAction => ({
  type: SET_WEBHOOKLOGS_LOADING,
  payload: false,
});

export const addWebhooklogList = (data: WebhookLog[]): WebhookLogAction => ({
  type: ADD_WEBHOOKLOGS,
  payload: data,
});

export const addWebhookRequest = (
  data: WebhookLogRequestData
): WebhookLogAction => ({
  type: ADD_WEBHOOKLOGS_REQUEST,
  payload: data,
});

export const resetWebhooks = (): WebhookLogAction => ({
  type: RESET_WEBHOOKLOGS,
  payload: null,
});
