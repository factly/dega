import rootReducer from '../../reducers';
import { SET_SELECTED_SPACE } from '../../constants/spaces';

const initialState = {
  admin: {
    organisation: {},
    loading: true,
  },
  info: {
    categories: 0,
    tag: 0,
    article: {
      draft: 0,
      template: 0,
      publish: 0,
    },
    factCheck: {
      draft: 0,
      template: 0,
      publish: 0,
    },
    podcasts: 0,
  },
  settings: {
    navTheme: 'dark',
    primaryColor: '#1890ff',
    layout: 'sidemenu',
    contentWidth: 'Fluid',
    fixedHeader: false,
    fixSiderbar: false,
  },
  spaces: {
    orgs: [],
    details: {},
    loading: false,
    selected: 0,
  },
  organisations: {
    req: [],
    details: {},
    loading: true,
  },
  redirect: {
    code: 200,
  },
  search: {
    details: {
      articles: [],
      categories: [],
      claims: [],
      'fact-checks': [],
      media: [],
      pages: [],
      ratings: [],
      tags: [],
      total: 0,
    },
    loading: true,
    req: [],
  },
  episodes: {
    req: [],
    details: {},
    loading: true,
  },
  podcasts: {
    req: [],
    details: {},
    loading: true,
  },
  organisationRequests: {
    req: [],
    details: {},
    loading: true,
  },
  roles: {
    details: {},
    loading: true,
    req: [],
  },
  sachFactChecks: {
    details: [],
    loading: true,
  },
  spacePermissions: {
    req: [],
    details: {},
    loading: true,
  },
  spaceRequests: {
    req: [],
    details: {},
    loading: true,
  },
  categories: {
    req: [],
    details: {},
    loading: true,
  },
  tags: {
    req: [],
    details: {},
    loading: true,
  },
  formats: {
    req: [],
    details: {},
    loading: true,
  },
  googleFactChecks: {
    req: [],
    loading: true,
  },
  media: {
    req: [],
    details: {},
    loading: true,
  },
  authors: {
    req: [],
    details: {},
    loading: true,
  },
  posts: {
    req: [],
    details: {},
    loading: true,
  },
  pages: {
    req: [],
    details: {},
    loading: true,
  },
  ratings: {
    req: [],
    details: {},
    loading: true,
  },
  claimants: {
    req: [],
    details: {},
    loading: true,
  },
  claims: {
    req: [],
    details: {},
    loading: true,
  },
  notifications: {
    type: null,
    message: null,
    description: null,
  },
  policies: {
    req: [],
    details: {},
    loading: true,
  },
  permissions: {
    req: [],
    details: {},
    loading: true,
  },
  users: {
    details: [],
    loading: true,
  },
  menus: {
    req: [],
    details: {},
    loading: true,
  },
  sidebar: {
    collapsed: false,
  },
  events: {
    req: [],
    details: {},
    loading: true,
  },
  webhooks: {
    req: [],
    details: {},
    loading: true,
  },
  profile: {
    details: {},
    loading: true,
  },
};
describe('root reducer', () => {
  it('should return combined state with selected space', () => {
    expect(
      rootReducer(initialState, {
        type: SET_SELECTED_SPACE,
        payload: 1,
      }),
    ).toEqual({
      ...initialState,
      spaces: {
        orgs: [],
        details: {},
        loading: false,
        selected: 1,
      },
    });
  });
  it('should return combined state', () => {
    expect(
      rootReducer(initialState, {
        type: 'INCORRECT_ACTION_TYPE',
        payload: {},
      }),
    ).toEqual(initialState);
  });
});
