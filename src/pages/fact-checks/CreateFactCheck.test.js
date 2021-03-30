import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';

import '../../matchMedia.mock';
import CreateFactCheck from './CreateFactCheck';
import * as actions from '../../actions/posts';
import FactCheckForm from './components/FactCheckForm';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';

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

describe('Fact check create component', () => {
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
            <CreateFactCheck formats={formats} />
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
              <CreateFactCheck formats={formats} />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(FactCheckForm).props().onCreate({ title: 'test', status: 'draft' });
      setTimeout(() => {
        expect(actions.addPost).toHaveBeenCalledWith({ title: 'test', status: 'draft' });
        expect(push).toHaveBeenCalledWith('/fact-checks');
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
            <Router>
              <CreateFactCheck formats={formats} />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(FactCheckForm).props().onCreate({ title: 'test', status: 'publish' });
      setTimeout(() => {
        expect(actions.publish).toHaveBeenCalledWith({ title: 'test', status: 'publish' });
        expect(push).toHaveBeenCalledWith('/fact-checks');
        done();
      }, 0);
    });
    it('should not display FactCheck form if fact-check format not found', () => {
      const format = {
        loading: false,
        article: { id: 1, name: 'Article', slug: 'article' },
      };
      actions.publish.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CreateFactCheck formats={format} />
            </Router>
          </Provider>,
        );
      });
      expect(wrapper.find(FactCheckForm).length).toBe(0);
      expect(wrapper.find(FormatNotFound).length).toBe(1);
    });
  });
});
