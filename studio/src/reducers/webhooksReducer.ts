import {
  ADD_WEBHOOK,
  ADD_WEBHOOKS,
  ADD_WEBHOOKS_REQUEST,
  SET_WEBHOOKS_LOADING,
  RESET_WEBHOOKS,
} from "../constants/webhooks";
import deepEqual from "deep-equal";

// Define interfaces for the state and actions
interface Webhook {
  id: string;
  [key: string]: any;
}

interface WebhookRequest {
  query: any;
  [key: string]: any;
}

interface WebhooksState {
  req: WebhookRequest[];
  details: {
    [id: string]: Webhook;
  };
  loading: boolean;
}

// Define action types
interface ResetWebhooksAction {
  type: typeof RESET_WEBHOOKS;
}

interface SetWebhooksLoadingAction {
  type: typeof SET_WEBHOOKS_LOADING;
  payload: boolean;
}

interface AddWebhooksRequestAction {
  type: typeof ADD_WEBHOOKS_REQUEST;
  payload: WebhookRequest;
}

interface AddWebhooksAction {
  type: typeof ADD_WEBHOOKS;
  payload: Webhook[];
}

interface AddWebhookAction {
  type: typeof ADD_WEBHOOK;
  payload: Webhook;
}

type WebhooksActionTypes =
  | ResetWebhooksAction
  | SetWebhooksLoadingAction
  | AddWebhooksRequestAction
  | AddWebhooksAction
  | AddWebhookAction;

const initialState: WebhooksState = {
  req: [],
  details: {},
  loading: true,
};

export default function webhooksReducer(
  state: WebhooksState = initialState,
  action: WebhooksActionTypes = {} as WebhooksActionTypes
): WebhooksState {
  switch (action.type) {
    case RESET_WEBHOOKS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_WEBHOOKS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_WEBHOOKS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_WEBHOOKS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce(
            (obj, item) => Object.assign(obj, { [item.id]: item }),
            {} as { [id: string]: Webhook }
          ),
        },
      };
    case ADD_WEBHOOK:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    default:
      return state;
  }
}
