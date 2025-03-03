import { ADD_NOTIFICATION } from "../constants/notifications";

// Define interfaces for state and action
interface NotificationState {
  type: string | null;
  message: string | null;
  description: string | null;
  time?: string | number | null;
}

interface NotificationAction {
  type: string;
  payload?: {
    type: string;
    title: string;
    message: string;
    time?: string | number;
  };
}

const initialState: NotificationState = {
  type: null,
  message: null,
  description: null,
};

export default function notificationsReducer(
  state: NotificationState = initialState,
  action: NotificationAction = { type: "" }
): NotificationState {
  if (!action.payload) {
    return state;
  }

  switch (action.type) {
    case ADD_NOTIFICATION:
      return {
        ...state,
        type: action.payload.type,
        message: action.payload.title,
        description: action.payload.message,
        time: action.payload.time,
      };
    default:
      return state;
  }
}
