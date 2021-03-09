import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { shallow, mount } from 'enzyme';

import '../../matchMedia.mock';
import EditPost from './EditPost';
import * as actions from '../../actions/posts';
import PostEditForm from './components/PostForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/posts', () => ({
  getPosts: jest.fn(),
  getPost: jest.fn(),
  updatePost: jest.fn(),
  addPost: jest.fn(),
  publishPost: jest.fn(),
  addTemplate: jest.fn(),
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
};

describe('Posts List component', () => {
  let store;
  let mockedDispatch;
  store = mockStore(state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = shallow(
          <Provider store={store}>
            <EditPost formats={formats} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      let tree;
      store = mockStore({
        posts: {
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
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EditPost formats={formats} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    state.posts = {
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
    };
    beforeEach(() => {
      store = mockStore(state);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getPost.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditPost formats={formats} />
          </Provider>,
        );
      });
      expect(actions.getPost).toHaveBeenCalledWith('1');
    });
    it('should call updatePost', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      actions.updatePost.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditPost formats={formats} />
          </Provider>,
        );
      });

      wrapper.find(PostEditForm).props().onCreate({ status: 'draft' });
      setTimeout(() => {
        expect(actions.updatePost).toHaveBeenCalledWith({
          id: 1,
          title: 'Post-1',
          slug: 'post-1',
          tag_line: 'tag_line',
          medium_id: 1,
          format_id: 1,
          status: 'draft',
        });
        expect(push).toHaveBeenCalledWith('/posts');
        done();
      }, 0);
    });
    it('should call publishPost', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      actions.publishPost.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditPost formats={formats} />
          </Provider>,
        );
      });

      wrapper.find(PostEditForm).props().onCreate({ status: 'publish' });
      setTimeout(() => {
        expect(actions.publishPost).toHaveBeenCalledWith({
          id: 1,
          title: 'Post-1',
          slug: 'post-1',
          tag_line: 'tag_line',
          medium_id: 1,
          format_id: 1,
          status: 'publish',
        });
        expect(push).toHaveBeenCalledWith('/posts');
        done();
      }, 0);
    });
    it('should display RecordNotFound if post not found', () => {
      state.posts = {
        req: [],
        details: {
          2: {
            id: 2,
            title: 'Post-2',
            slug: 'post-2',
            tag_line: 'tag_line',
            medium_id: 1,
            format_id: 1,
          },
        },
        loading: false,
      };
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditPost formats={formats} />
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
      expect(wrapper.find(PostEditForm).length).toBe(0);
    });
  });
});
