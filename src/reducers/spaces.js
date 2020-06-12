import {
  SET_SELECTED_SPACE,
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
} from '../constants/spaces';

const initialState = {
  orgs: [],
  details: {},
  list: [],
  loading: true,
  selected: null,
};

export default function spacesReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_SPACES:
      return {
        ...state,
        loading: true,
      };
    case GET_SPACES_SUCCESS:
      let space_details = {};
      let space_list = [];

      action.payload.forEach((element) => {
        element.spaces.forEach((s) => {
          space_details[s.id] = s;
          space_list.push(s.id);
        });
      });

      return {
        ...state,
        orgs: action.payload.map((each) => {
          return { ...each, spaces: each.spaces.map((e) => e.id) };
        }),
        details: space_details,
        list: space_list,
        loading: false,
        selected: action.payload[0].spaces.length > 0 ? action.payload[0].spaces[0].id : null,
      };
    case ADD_SPACE_SUCCESS:
      return {
        ...state,
        loading: false,
      };
    case SET_SELECTED_SPACE:
      return {
        ...state,
        selected: action.payload,
      };
    default:
      return state;
  }
}
