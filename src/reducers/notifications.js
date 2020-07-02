import { ADD_NOTIFICATION } from '../constants/notifications';

const initialState = {
  type: null,
  message: null,
  description: null,
};

export default function notificationsReducer(state = initialState, action = {}) {
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
      };
    default:
      return state;
  }
}
