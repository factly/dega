import { combineReducers } from 'redux';
import settings from './settings';
import spaces from './spaces';
import categories from './categories';
import tags from './tags';
import formats from './formats';
import media from './media';
import authors from './authors';
import posts from './posts';
import ratings from './ratings';
import claimants from './claimants';
import claims from './claims';
import factChecks from './factChecks';
import notifications from './notifications';
import policies from './policies';
import { SET_SELECTED_SPACE } from '../constants/spaces';

const appReducer = combineReducers({
  settings,
  spaces,
  categories,
  tags,
  formats,
  media,
  authors,
  posts,
  ratings,
  claimants,
  claims,
  factChecks,
  notifications,
  policies,
});

const rootReducer = (state, action) => {
  if (action.type === SET_SELECTED_SPACE) {
    const { spaces, settings } = state;

    state = { spaces, settings };
  }
  return appReducer(state, action);
};

export default rootReducer;
