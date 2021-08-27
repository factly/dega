import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Request from './index';

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
    pathname: '/admin/requests',
  }),
}));

describe('Request Component', () => {
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
        organisationRequests: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
              },
              total: 1,
            },
          ],
          details: {
            '1': {
              id: 1,
              title: 'Request',
              spaces: 4,
              organisation_id: 10,
              status: 'pending',
            },
          },
          loading: false,
        },
        spaceRequests: {
          req: [
            {
              data: [1, 2],
              query: {
                page: 1,
                limit: 5,
              },
              total: 2,
            },
          ],
          details: {
            '1': {
              id: 1,
              title: 'Request 1',
              description: 'Description',
              status: 'pending',
              media: -1,
              posts: -1,
              fact_check: true,
              space_id: 1,
            },
            '2': {
              id: 2,
              title: 'Request 2',
              description: 'Description',
              status: 'pending',
              media: 5,
              posts: 5,
              fact_check: false,
              space_id: 2,
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
            <Request />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
