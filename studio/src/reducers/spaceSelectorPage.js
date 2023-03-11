import { SET_VISIBLE } from './../constants/spaceSelectorPage';

const initialState = {
  visible: true,
};

export default function spaceSelectorReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_VISIBLE: {
      return { visible: action.payload };
    }
    default:
      return state;
  }
}
