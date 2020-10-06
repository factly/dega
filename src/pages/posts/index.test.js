import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import Posts from './index';
import { shallow } from 'enzyme';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/posts', () => ({
  getPosts: jest.fn(),
  addPost: jest.fn(),
}));

describe('Posts List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    useSelector.mockImplementationOnce(() => ({}));
    const tree = shallow(
      <Provider store={store}>
        <Router>
          <Posts permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data', () => {
    useSelector.mockImplementationOnce(() => ({
      posts: [
        {
          id: 1,
          title: 'post',
          excerpt: 'excerpt',
          medium: { url: 'http://example.com' },
          alt_text: 'alt_text',
        },
      ],
      total: 1,
      loading: false,
    }));
    const tree = shallow(
      <Provider store={store}>
        <Router>
          <Posts permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
