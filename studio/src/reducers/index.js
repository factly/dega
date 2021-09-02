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
import organisationRequests from './organisationRequestsReducer';
import spacePermissions from './spacePermissionsReducer';
import spaceRequests from './spaceRequestsReducer';
import admin from './adminReducer';
import users from './usersReducer';
import { SET_SELECTED_SPACE } from '../constants/spaces';
import menus from './menuReducer';
import sidebar from './sidebarReducer';
import episodes from './episodesReducer';
import podcasts from './podcastReducer';
import redirect from './redirectReducer';
import events from './eventsReducer';
import info from './infoReducer';
import pages from './pagesReducer';
import webhooks from './webhooksReducer';
import profile from './profileReducer';
import search from './searchReducer';

const appReducer = combineReducers({
  admin,
  info,
  settings,
  spaces,
  organisations,
  redirect,
  episodes,
  podcasts,
  organisationRequests,
  spacePermissions,
  spaceRequests,
  categories,
  tags,
  formats,
  googleFactChecks,
  media,
  authors,
  posts,
  pages,
  ratings,
  claimants,
  claims,
  notifications,
  policies,
  permissions,
  users,
  menus,
  sidebar,
  events,
  webhooks,
  profile,
  search,
});

const rootReducer = (state, action) => {
  if (action.type === SET_SELECTED_SPACE) {
    const { spaces, settings } = state;

    state = { spaces, settings };
  }
  return appReducer(state, action);
};

export default rootReducer;
