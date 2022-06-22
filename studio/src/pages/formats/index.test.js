import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Formats from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  // useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/formats', () => ({
  getFormats: jest.fn(),
  addFormat: jest.fn(),
}));

let state = {
  formats: {
    req: [
      {
        data: [4, 3],
        total: 2,
      },
      {
        data: [4, 3],
        query: {
          space_id: 2,
        },
        total: 2,
      },
      {
        data: [4, 3],
        query: {
          page: 1,
          limit: 20,
        },
        total: 2,
      },
    ],
    details: {
      '3': {
        id: 3,
        created_at: '2022-04-29T11:35:30.459425Z',
        updated_at: '2022-04-29T11:35:30.459425Z',
        deleted_at: null,
        created_by_id: 34,
        updated_by_id: 34,
        name: 'Article',
        slug: 'article',
        description: 'Article',
        medium_id: null,
        medium: null,
        meta_fields: null,
        meta: null,
        header_code: '',
        footer_code: '',
        space_id: 2,
      },
      '4': {
        id: 4,
        created_at: '2022-04-29T11:35:30.469094Z',
        updated_at: '2022-04-29T11:35:30.469094Z',
        deleted_at: null,
        created_by_id: 34,
        updated_by_id: 34,
        name: 'Fact Check',
        slug: 'fact-check',
        description: 'Fact Check',
        medium_id: null,
        medium: null,
        meta_fields: null,
        meta: null,
        header_code: '',
        footer_code: '',
        space_id: 2,
      },
    },
    loading: false,
  },
};

describe('Formats List component', () => {
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
      formats: {
        req: [],
        details: {},
        loading: false,
      },
    };
    store = mockStore(state2);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Formats permission={{ actions: ['create'] }} />
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
          <Formats permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render loader component', () => {
    const loadingState = {
      formats: {
        req: [],
        details: {},
        loading: true,
      },
    };
    store = mockStore(loadingState);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Formats permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
