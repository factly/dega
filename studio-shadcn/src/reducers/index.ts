import { combineReducers, AnyAction } from "redux";
import { RootState } from "../types/index";
import posts from "../reducers/postReducer";
import ratings from "./ratingsReducer";
import spaceSelectorPage from "./spaceSelectorPage";
import spaceUsers from "./spaceUsersReducer";
import { spaces } from "./spacesReducer";
import usersReducer from "./usersReducer";
import sidebarReducer from "./sidebarReducer";
import { SET_SELECTED_SPACE } from "../constants/spaces";
import settingsReducer from "./settingsReducer";
import notificationsReducer from "./notificationsReducer";
import mediaReducer from "./mediaReducer";
import menuReducer from "./menuReducer";
import tokensReducer from "./tokensReducer";
import formatsReducer from "./formatsReducer";
import policiesReducer from "./policiesReducer";
import webhooklogsReducer from "./webhooklogsReducer";
import webhooksReducer from "./webhooksReducer";
import authorsReducer from "./authorsReducer";
import claimantsReducer from "./claimantsReducer";
import redirectReducer from "./redirectReducer";
import organisationsReducer from "./organisationsReducer";
import eventsReducer from "./eventsReducer";
import profileReducer from "./profileReducer";
import sessionReducer from "./sessionReducer";
import claimsReducer from "./claimsReducer";
import tagsReducer from "./tagsReducer";
import categoriesReducer from "./categoriesReducer";
import googleFactChecksReducer from "./googleFactChecksReducer";
import sachFactCheckReducer from "./sachFactChecksReducer";

const appReducer = combineReducers({
  posts,
  ratings,
  spaces,
  spaceSelectorPage,
  spaceUsers,
  users: usersReducer,
  sidebar: sidebarReducer,
  settings: settingsReducer,
  notifications: notificationsReducer,
  media: mediaReducer,
  menus: menuReducer,
  tokens: tokensReducer,
  formats: formatsReducer,
  policies: policiesReducer,
  webhooklogs: webhooklogsReducer,
  webhooks: webhooksReducer,
  authors: authorsReducer,
  claimants: claimantsReducer,
  redirect: redirectReducer,
  organisations: organisationsReducer,
  events: eventsReducer,
  profile: profileReducer,
  session: sessionReducer,
  claims: claimsReducer,
  tags: tagsReducer,
  categories: categoriesReducer,
  googleFactChecks: googleFactChecksReducer,
  sachFactChecks: sachFactCheckReducer,
});

const rootReducer = (state: RootState | undefined, action: AnyAction) => {
  if (action.type === SET_SELECTED_SPACE && state) {
    const { spaces, settings } = state;
    state = { spaces, settings } as RootState;
  }
  return appReducer(state, action);
};

export default rootReducer;
