import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';

import '../../matchMedia.mock';
import CreatePage from './CreatePage';
import * as actions from '../../actions/pages';
import PageCreateForm from '../posts/components/PostForm';
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

jest.mock('../../actions/pages', () => ({
  getPages: jest.fn(),
  addPage: jest.fn(),
}));
const formats = {
  article: { id: 1, name: 'article', slug: 'article' },
  factcheck: { id: 2, name: 'factcheck', slug: 'fact-check' },
  loading: false,
};
describe('Page create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    pages: {
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
            <CreatePage formats={formats} />
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
    it('should call addPage', (done) => {
      actions.addPage.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CreatePage formats={formats} />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(PageCreateForm).props().onCreate({ id: 1, title: 'test', status: 'draft' });
      setTimeout(() => {
        expect(actions.addPage).toHaveBeenCalledWith({ id: 1, title: 'test', status: 'draft' });
        done();
      }, 0);
    });
    it('should not display Page form if format found', () => {
      const format = {
        loading: false,
        factcheck: { id: 2, name: 'factcheck', slug: 'fact-check' },
      };
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CreatePage formats={format} />
            </Router>
          </Provider>,
        );
      });
      expect(wrapper.find(PageCreateForm).length).toBe(0);
      expect(wrapper.find(FormatNotFound).length).toBe(1);
    });
  });
});
