import rootReducer from '../../reducers';
import { SET_SELECTED_SPACE } from '../../constants/spaces';

const initialState = {
  admin: {
    organisation : {},
    loading: true,
  },
  settings: {
    navTheme: 'dark',
    primaryColor:'#1890ff',
    layout : 'sidemenu',
    contentWidth: 'Fluid',
    fixedHeader : false,
    fixSiderbar : false,
  },
  spaces: {
    orgs: [],
    details: {},
    loading: false,
    selected: 0
  },
  organisations: {
    req: [],
    details: {},
    loading: true,
  },
  redirect: {
    code: 200,
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
  ratings : {
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
  menu: {
    req: [],
    details: {},
    loading: true,
  },
  sidebar: {
    collapsed: false, 
  },
}
describe('root reducer', () => {
  it('should return combined state with selected space',() => {
    expect(
      rootReducer(initialState,{
      type: SET_SELECTED_SPACE,
      payload: 1,
      }),
    ).toEqual({
      ...initialState,
      spaces: {
        orgs: [],
        details: {},
        loading: false,
        selected: 1
      }
    });
  });
  it('should return combined state',() => {
    expect(
      rootReducer(initialState,{
      type: 'INCORRECT_ACTION_TYPE',
      payload: {},
      }),
    ).toEqual(
      initialState
    );
  });  
});