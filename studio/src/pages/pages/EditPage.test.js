import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { shallow, mount } from 'enzyme';

import '../../matchMedia.mock';
import EditPage from './EditPage';
import * as actions from '../../actions/pages';
import PageEditForm from '../posts/components/PostForm';

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

jest.mock('../../actions/pages', () => ({
  getPage: jest.fn(),
  updatePage: jest.fn(),
}));
const formats = {
  article: { id: 1, name: 'article', slug: 'article' },
  factcheck: { id: 2, name: 'factcheck', slug: 'fact-check' },
  loading: false,
};
let state = {
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
};

describe('Page Edit component', () => {
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
            <EditPage formats={formats} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      let tree;
      store = mockStore({
        pages: {
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
            <Router>
              <EditPage formats={formats} />
            </Router>
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    state.pages = {
      req: [],
      details: {
        1: {
          id: 1,
          title: 'Page-1',
          slug: 'page-1',
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
      actions.getPage.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditPage formats={formats} />
            </Router>
          </Provider>,
        );
      });
      expect(actions.getPage).toHaveBeenCalledWith('1');
    });
    it('should call updatePage', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      actions.updatePage.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditPage formats={formats} />
            </Router>
          </Provider>,
        );
      });

      wrapper.find(PageEditForm).props().onCreate({ status: 'draft' });
      setTimeout(() => {
        expect(actions.updatePage).toHaveBeenCalledWith({
          id: 1,
          title: 'Page-1',
          slug: 'page-1',
          tag_line: 'tag_line',
          medium_id: 1,
          format_id: 1,
          published_date: null,
          status: 'draft',
        });
        expect(push).toHaveBeenCalledWith('/pages/1/edit');
        done();
      }, 0);
    });
    it('should display RecordNotFound if page not found', () => {
      state.pages = {
        req: [],
        details: {
          2: {
            id: 2,
            title: 'Page-2',
            slug: 'page-2',
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
            <Router>
              <EditPage formats={formats} />
            </Router>
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
      expect(wrapper.find(PageEditForm).length).toBe(0);
    });
  });
});
