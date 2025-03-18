import { ADD_NOTIFICATION } from "../constants/notifications";
import { NotificationAction } from "../actions/notifications";

interface NotificationState {
  type: string | null;
  message: string | null;
  description: string | null;
  time: number | null;
}

const initialState: NotificationState = {
  type: null,
  message: null,
  description: null,
  time: null,
};

export default function notificationsReducer(
  state: NotificationState = initialState,
  action: NotificationAction | { type: string }
): NotificationState {
  switch (action.type) {
    case ADD_NOTIFICATION:
      if ("payload" in action) {
        return {
          ...state,
          type: action.payload.type,
          message: action.payload.title,
          description: action.payload.message,
          time: action.payload.time,
        };
      }
      return state;
    default:
      return state;
  }
}
