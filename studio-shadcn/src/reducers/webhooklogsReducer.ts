import {
  ADD_WEBHOOKLOGS,
  ADD_WEBHOOKLOGS_REQUEST,
  SET_WEBHOOKLOGS_LOADING,
  RESET_WEBHOOKLOGS,
} from "../constants/webhooklogs";
import deepEqual from "deep-equal";

// Define interfaces for the state and actions
interface WebhookLog {
  id: string;
  [key: string]: any;
}

interface WebhookLogRequest {
  query: any;
  [key: string]: any;
}

interface WebhookLogsState {
  req: WebhookLogRequest[];
  details: {
    [id: string]: WebhookLog;
  };
  loading: boolean;
}

// Define action types
interface ResetWebhookLogsAction {
  type: typeof RESET_WEBHOOKLOGS;
}

interface SetWebhookLogsLoadingAction {
  type: typeof SET_WEBHOOKLOGS_LOADING;
  payload: boolean;
}

interface AddWebhookLogsRequestAction {
  type: typeof ADD_WEBHOOKLOGS_REQUEST;
  payload: WebhookLogRequest;
}

interface AddWebhookLogsAction {
  type: typeof ADD_WEBHOOKLOGS;
  payload: WebhookLog[];
}

type WebhookLogsActionTypes =
  | ResetWebhookLogsAction
  | SetWebhookLogsLoadingAction
  | AddWebhookLogsRequestAction
  | AddWebhookLogsAction;

const initialState: WebhookLogsState = {
  req: [],
  details: {},
  loading: true,
};

export default function webhooklogsReducer(
  state: WebhookLogsState = initialState,
  action: WebhookLogsActionTypes = {} as WebhookLogsActionTypes
): WebhookLogsState {
  switch (action.type) {
    case RESET_WEBHOOKLOGS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_WEBHOOKLOGS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_WEBHOOKLOGS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_WEBHOOKLOGS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {} as { [id: string]: WebhookLog }
          ),
        },
      };
    default:
      return state;
  }
}
