import { ADD_ERRORS } from '../constants/notifications';

const initialState = {
  details: {},
  loading: true,
};

export default function notificationsReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    default:
      return state;
  }
}
