import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Tags from './index';
import { getTags } from '../../actions/tags';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../../actions/tags', () => ({
  getTags: jest.fn(),
  createTag: jest.fn(),
}));
let state = {
  tags: {
    req: [
      {
        data: [1],
        query: {},
        total: 1,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-09T06:49:36.566567Z',
        updated_at: '2020-09-09T06:49:36.566567Z',
        deleted_at: null,
        name: 'Election',
        slug: 'election',
        description: {
          time: 1613561493761,
          blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
          version: '2.19.0',
        },
        medium_id: 0,
        space_id: 1,
        posts: null,
      },
    },
    loading: false,
  },
};
describe('Tags List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const state2 = {
        tags: {
          req: [],
          details: {},
          loading: false,
        },
      };
      store = mockStore(state2);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Tags permission={{ actions: ['create'] }} />
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
            <Tags permission={{ actions: ['create'] }} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should handle url search params', () => {
      store = mockStore(state);
      let wrapper;
      window.history.pushState({}, '', '/tags?limit=20&page=1&q=desc');
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Tags permission={{ actions: ['update', 'delete'] }} />
            </Router>
          </Provider>,
        );
      });
      expect(getTags).toHaveBeenCalledWith({ page: 1, limit: 20, q: 'desc' });
    });

    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Tags permission={{ actions: ['update', 'delete'] }} />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'tag' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: '' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getTags).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          q: 'tag',
        });
      }, 0);
    });
  });
});
