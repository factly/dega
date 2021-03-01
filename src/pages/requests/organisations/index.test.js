import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import OrganisationRequest from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let state = {
  organisationRequests: {
    req : [
      {
        data: [1],
        query: {
          page: 1,
        },
        total: 1,
      },
    ],
    details: {
      '1' : {
        id: 1,
        title: 'Request',
        spaces: 4,
        organisation_id: 10,
        status: 'pending',
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
};
describe('Organisation Request list', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      organisationRequests: {
        req : [
          {
            data: [1],
            query: {
              page: 1,
            },
            total: 1,
          },
        ],
        details: {
          '1' : {
            id: 1,
            title: 'Request',
            spaces: 4,
            organisation_id: 10,
            status: 'pending',
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
    store=mockStore({
      organisationRequests: {
        req : [],
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
          <OrganisationRequest />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data',() => {
    const tree = mount(
      <Provider store={store}>
        <Router>
          <OrganisationRequest />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
}); 