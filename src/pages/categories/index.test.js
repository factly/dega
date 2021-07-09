import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Categories from './index';

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

jest.mock('../../actions/categories', () => ({
  getCategories: jest.fn(),
  addCategory: jest.fn(),
}));

let state = {
  categories: {
    req: [],
    details: {},
    loading: false,
  },
  media: {
    req: [],
    details: {},
    loading: true,
  },
};
describe('Categories component', () => {
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
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Categories
              permission={{
                actions: ['create'],
              }}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      const store2 = mockStore({
        categories: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
                limit: 20,
              },
              total: 1,
            },
          ],
          details: {
            1: {
              id: 1,
              name: 'category',
              slug: 'slug',
              description: 'description',
              parent_id: 1,
              category_date: '2017-12-12',
            },
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store2}>
          <Router>
            <Categories
              permission={{
                actions: ['create'],
              }}
            />
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
    it('should submit filters', () => {
      store = mockStore({
        categories: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
                limit: 20,
              },
              total: 1,
            },
          ],
          details: {
            1: {
              id: 1,
              name: 'category',
              slug: 'slug',
              description: 'description',
              parent_id: 1,
              category_date: '2017-12-12',
            },
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Categories permission={{ actions: ['create'] }} />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'Explainer' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Select')
          .props()
          .onChange({ target: { value: 'asc' } });
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Search');
        submitButtom.simulate('submit');
      });
      setTimeout(() => {
        expect(getCategories).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          sort: 'asc',
          format: [1],
          q: 'Explainer',
          tag: [2],
          category: [2],
        });
      }, 0);
    });
  });
});
