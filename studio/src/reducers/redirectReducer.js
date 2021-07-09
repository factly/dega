import { SET_REDIRECT } from '../constants/settings';

const initialState = {
  code: 200,
};

export default function redirectReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_REDIRECT:
      return {
        ...state,
        code: action.payload,
      };
    default:
      return state;
  }
}
