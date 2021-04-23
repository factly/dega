import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import Posts from './index';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
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

jest.mock('../../actions/posts', () => ({
  getPosts: jest.fn(),
  addPost: jest.fn(),
}));
const formats = {
  article: { id: 1, name: 'article', slug: 'article' },
  factcheck: { id: 2, name: 'factcheck', slug: 'fact-check' },
  loading: false,
};
let state = {
  posts: {
    req: [],
    details: {},
    loading: true,
  },
  authors: {
    req: [],
    details: {},
    loading: true,
  },
  tags: {
    req: [],
    details: {},
    loading: true,
  },
  categories: {
    req: [],
    details: {},
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
describe('Posts List component', () => {
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
          <Posts permission={{ actions: ['create'] }} formats={formats} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data', () => {
    const store2 = mockStore({
      posts: {
        req: [],
        details: {
          1: {
            id: 1,
            title: 'Post-1',
            slug: 'post-1',
            tag_line: 'tag_line',
            medium_id: 1,
            format_id: 1,
          },
        },
        loading: false,
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
    });
    const tree = shallow(
      <Provider store={store2}>
        <Router>
          <Posts permission={{ actions: ['create'] }} formats={formats} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should display FormatNotFound if format not found', () => {
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Posts
            permission={{ actions: ['create'] }}
            formats={{
              loading: false,
            }}
          />
        </Router>
      </Provider>,
    );
    expect(tree.find(FormatNotFound).length).toBe(1);
  });
});
