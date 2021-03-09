import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import Claims from './index';
import { shallow, mount } from 'enzyme';

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

jest.mock('../../actions/claims', () => ({
  getClaims: jest.fn(),
  addClaim: jest.fn(),
}));
let state = {
  claims: {
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
        created_at: '2020-07-17T10:14:44.251814Z',
        updated_at: '2020-07-17T10:14:44.251814Z',
        checked_date: '2020-07-17T10:14:44.251814Z',
        claim_date: '2020-07-17T10:14:44.251814Z',
        deleted_at: null,
        name: 'claim-1',
        slug: 'claim-1',
        description: '',
        claimant_id: 1,
        rating_id: 1,
        space_id: 1,
      },
    },
    loading: false,
  },
  claimants: {
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
      1: {
        id: 1,
        name: 'TOI',
        slug: 'toi',
        description: {"time":1613556798273,"blocks":[{"type":"header","data":{"text":"Description","level":2}}],"version":"2.19.0"},
        tag_line: 'tag line',
        claimant_date: '2017-12-12',
      },
    },
    loading: false,
  },
  ratings: {
    req: [],
    details: {
      1: {
        id: 1,
        name: 'True',
        slug: 'true',
        description: {time: 1613559903378, blocks: [{type: "paragraph", data: {text: "Description"}}], version: "2.19.0"},
        numeric_value: 5,
      },
    },
    loading: true,
  },
  media: {
    req: [],
    details: {},
    loading: true,
  },
  spaces: {
    orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11' },
    },
    loading: false,
    selected: 11,
  },
  sidebar: {
    collapsed: false,
  },
};
describe('Claims List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore(state);
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Claims permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data', () => {
    const tree = shallow(
      <Provider store={store}>
        <Router>
          <Claims permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
