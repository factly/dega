import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Ratings from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/ratings', () => ({
  getRatings: jest.fn(),
  addRating: jest.fn(),
}));
let state = {
  ratings: {
    req: [
      {
        data: [7],
        query: {
          page: 1,
          limit: 20,
        },
        total: 1,
      },
    ],
    details: {
      '7': {
        id: 7,
        created_at: '2022-05-05T06:31:22.492Z',
        updated_at: '2022-05-05T06:57:13.091323Z',
        deleted_at: null,
        created_by_id: 34,
        updated_by_id: 34,
        name: 'verygood',
        slug: 'verygoo',
        description: {
          time: 1651732083960,
          blocks: [
            {
              id: '84XfO28Gol',
              type: 'paragraph',
              data: {
                text: 'verygood',
              },
            },
          ],
          version: '2.22.1',
        },
        html_description: '<p>verygood</p>',
        numeric_value: 35,
        medium_id: null,
        meta_fields: null,
        space_id: 2,
        meta: null,
        header_code: '',
        footer_code: '',
      },
    },
    loading: false,
  },
};
describe('Ratings List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    const state2 = {
      ratings: {
        req: [],
        details: {},
        loading: false,
      },
    };
    store = mockStore(state2);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Ratings permission={{ actions: ['create'] }} />
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
          <Ratings permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render loader component', () => {
    const loadingState = {
      ratings: {
        req: [],
        details: {},
        loading: true,
      },
    };
    let store2 = mockStore(loadingState);
    const tree = mount(
      <Provider store={store2}>
        <Router>
          <Ratings permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
