import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';

import '../../matchMedia.mock';
import CreatePost from './CreatePost';
import * as actions from '../../actions/posts';
import PostCreateForm from './components/PostForm';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
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
const formats = {
  article: { id: 1, name: 'article', slug: 'article' },
  factcheck: { id: 2, name: 'factcheck', slug: 'fact-check' },
  loading: false,
};
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
    sidebar: {
      collapsed: false,
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
            <CreatePost formats={formats} />
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
            <Router>
              <CreatePost formats={formats} />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(PostCreateForm).props().onCreate({ id: 1, title: 'test', status: 'draft' });
      setTimeout(() => {
        expect(actions.addPost).toHaveBeenCalledWith({ id: 1, title: 'test', status: 'draft' });
        done();
      }, 0);
    });
    it('should not display Post form if no article format found', () => {
      const format = {
        loading: false,
        factcheck: { id: 2, name: 'factcheck', slug: 'fact-check' },
      };
      actions.publish.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CreatePost formats={format} />
            </Router>
          </Provider>,
        );
      });
      expect(wrapper.find(PostCreateForm).length).toBe(0);
      expect(wrapper.find(FormatNotFound).length).toBe(1);
    });
  });
});
