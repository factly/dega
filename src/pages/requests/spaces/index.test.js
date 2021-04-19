import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import SpaceRequests from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Space Request component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
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
      admin: {
        loading: false,
        organisation: {
          id: 1,
          is_admin: true,
        },
      },
    });
    store.dispatch = jest.fn(() => ({}));
  });
  it('should render the component', () => {
    const tree = mount(
        <Provider store={store}>
          <Router>
            <SpaceRequests />
          </Router>
        </Provider>,
      );
    expect(tree).toMatchSnapshot();
  });
  it('should render the with no spaceRequests', () => {
    store = mockStore({
      spaceRequests: {
        req: [],
        details: {},
        loading: false,
      },  
      admin: {
        loading: false,
        organisation: {
          id: 1,
          is_admin: true,
        },
      },
    })
    const tree = mount(
        <Provider store={store}>
          <Router>
            <SpaceRequests />
          </Router>
        </Provider>,
      );
    expect(tree).toMatchSnapshot();
  });
})