import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';

import '../../matchMedia.mock';
import CreatePost from './CreatePost';
import * as actions from '../../actions/posts';
import PostCreateForm from './components/PostForm';

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
  publish: jest.fn(),
}));

describe('Post create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
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
    formats: {
      req: [],
      details: {},
      loading: true,
    },

    claims: {
      req: [],
      details: {},
      loading: true,
    },
    claimants: {
      req: [],
      details: {},
      loading: true,
    },
    ratings: {
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
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = shallow(
          <Provider store={store}>
            <CreatePost />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
      tree.unmount();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addPost', (done) => {
      actions.addPost.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreatePost />
          </Provider>,
        );
      });
      wrapper.find(PostCreateForm).props().onCreate({ title: 'test', status: 'draft' });
      setTimeout(() => {
        expect(actions.addPost).toHaveBeenCalledWith({ title: 'test', status: 'draft' });
        expect(push).toHaveBeenCalledWith('/posts');
        done();
      }, 0);
    });
    it('should call publish', (done) => {
      actions.publish.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreatePost />
          </Provider>,
        );
      });
      wrapper.find(PostCreateForm).props().onCreate({ title: 'test', status: 'publish' });
      setTimeout(() => {
        expect(actions.publish).toHaveBeenCalledWith({ title: 'test', status: 'publish' });
        expect(push).toHaveBeenCalledWith('/posts');
        done();
      }, 0);
    });
  });
});
