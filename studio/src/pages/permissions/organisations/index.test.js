import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import OrganisationPermission from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../../actions/organisations', () => ({
  getOrganisations: jest.fn(),
}));
let state = {
  organisations: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
          limit: 20,
        },
        total: 1,
      },
    ],
    details: {
      1: {
        id: 1,
        title: 'Super Org',
        slug: 'super-org',
        permission: {
          id: 2,
          organisation_id: 1,
          spaces: 2,
        },
      },
    },
    loading: false,
  },
  spaces: {
    orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11' },
    },
    loading: false,
    selected: 11,
  },
  admin: {
    organisation: {
      id: 2,
      spaces: 4,
      is_admin: true,
    },
    loading: false,
  },
};
describe('Organisation Permission component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn();
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const state2 = {
        organisations: {
          req: [],
          details: {},
          loading: false,
        },
        admin: {
          organisation: {
            id: 2,
            spaces: 4,
            is_admin: true,
          },
          loading: false,
        },
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
      };
      store = mockStore(state2);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationPermission />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationPermission />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data when not super admin', () => {
      const state2 = {
        organisations: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
                limit: 20,
              },
              total: 1,
            },
          ],
          details: {
            1: {
              id: 1,
              title: 'Super Org',
              slug: 'super-org',
              permission: {
                id: 2,
                organisation_id: 1,
                spaces: 2,
              },
            },
          },
          loading: false,
        },
        admin: {
          organisation: {
            id: 2,
            spaces: 4,
          },
          loading: false,
        },
      };
      store = mockStore(state2);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationPermission />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
