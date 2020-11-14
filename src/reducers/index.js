import { combineReducers } from 'redux';
import settings from './settingsReducer';
import spaces from './spacesReducer';
import categories from './categoriesReducer';
import tags from './tagsReducer';
import formats from './formatsReducer';
import googleFactChecks from './googleFactChecksReducer';
import media from './mediaReducer';
import authors from './authorsReducer';
import posts from './postsReducer';
import ratings from './ratingsReducer';
import claimants from './claimantsReducer';
import claims from './claimsReducer';
import notifications from './notificationsReducer';
import policies from './policiesReducer';
import permissions from './permissionsReducer';
import organisations from './organisationsReducer';
import admin from './adminReducer';
import users from './usersReducer';
import { SET_SELECTED_SPACE } from '../constants/spaces';

const appReducer = combineReducers({
  admin,
  settings,
  spaces,
  organisations,
  categories,
  tags,
  formats,
  googleFactChecks,
  media,
  authors,
  posts,
  ratings,
  claimants,
  claims,
  notifications,
  policies,
  permissions,
  users,
});

const rootReducer = (state, action) => {
  if (action.type === SET_SELECTED_SPACE) {
    const { spaces, settings } = state;

    state = { spaces, settings };
  }
  return appReducer(state, action);
};

export default rootReducer;
