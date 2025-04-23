import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

export interface Post {
  id: number;
  [key: string]: any;
}

export interface PostsState {
  req: Array<{
    query: any;
    [key: string]: any;
  }>;
  details: {
    [key: number]: Post;
  };
  loading: boolean;
}

export interface Rating {
  id?: number;
  name: string;
  slug: string;
  numeric_value: number;
  meta_fields?: string | object;
  background_colour?: ColorResult | null;
  text_colour?: ColorResult | null;
}

export interface RatingsState {
  loading: boolean;
  details: {
    [key: number]: Rating;
  };
}

export interface ColorResult {
  hex: string;
}

export interface RootState {
  admin: any;
  info: any;
  settings: any;
  spaces: any;
  session: any;
  organisations: any;
  redirect: any;
  organisationRequests: any;
  spacePermissions: any;
  spaceRequests: any;
  categories: any;
  tags: any;
  formats: any;
  googleFactChecks: any;
  media: any;
  authors: any;
  posts: PostsState;
  pages: any;
  ratings: RatingsState;
  claimants: any;
  claims: any;
  notifications: {
    type: string | null;
    message: string | null;
    description: string | null;
    time: number | null;
  };
  policies: any;
  permissions: any;
  users: any;
  menus: any;
  sidebar: any;
  spaceSelectorPage: any;
  events: any;
  webhooks: any;
  webhooklogs: any;
  profile: any;
  search: any;
  sachFactChecks: any;
  roles: any;
}

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
