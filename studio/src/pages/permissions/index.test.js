import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Permission from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/admin/permissions',
  }),
}));

describe('Permission Component', () => {
  let store;
  let mockedDispatch;
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({
        admin: {
          organisation: {
            id: 2,
            spaces: 4,
            is_admin: true,
          },
          loading: false,
        },
        spacePermissions: {
          req: [
            {
              data: [1, 2],
              query: {
                page: 1,
                limit: 20,
              },
              total: 2,
            },
          ],
          details: {
            1: {
              id: 1,
              name: 'Space 1',
              organisation_id: 9,
              permission: {
                id: 1,
                fact_check: true,
                media: -1,
                posts: -1,
                episodes: -1,
              },
            },
            2: {
              id: 2,
              name: 'Space 2',
              organisation_id: 4,
              permission: {
                id: 2,
                fact_check: false,
                episodes: 20,
                podcast: true,
                media: 20,
                posts: 20,
              },
            },
          },
          loading: false,
        },
        organisations: {
          req: [
            {
              data: [1, 2],
              query: {
                page: 1,
                limit: 20,
              },
              total: 2,
            },
          ],
          details: {
            1: {
              id: 1,
              title: 'Org 1',
              permission: {
                id: 2,
                organisation_id: 1,
                spaces: -1,
              },
            },
            2: {
              id: 2,
              title: 'Org 2',
              permission: {
                id: 3,
                organisation_id: 2,
                spaces: 4,
              },
            },
          },
          loading: false,
        },
      });
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Permission />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
