import { combineReducers } from 'redux';
import settings from './settingsReducer';
import spaces from './spacesReducer';
import categories from './categoriesReducer';
import tags from './tagsReducer';
import formats from './formatsReducer';
import factchecks from './factchecksReducer';
import media from './mediaReducer';
import authors from './authorsReducer';
import posts from './postsReducer';
import ratings from './ratingsReducer';
import claimants from './claimantsReducer';
import claims from './claimsReducer';
import notifications from './notificationsReducer';
import policies from './policiesReducer';
import { SET_SELECTED_SPACE } from '../constants/spaces';

const appReducer = combineReducers({
  settings,
  spaces,
  categories,
  tags,
  formats,
  factchecks,
  media,
  authors,
  posts,
  ratings,
  claimants,
  claims,
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
