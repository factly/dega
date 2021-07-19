import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Claimants from './index';
import { getClaimants } from '../../actions/claimants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;
let state = {
  claimants: {
    req: [
      {
        data: [1, 2],
        query: {},
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-09T06:51:15.770644Z',
        updated_at: '2020-09-09T06:51:15.770644Z',
        deleted_at: null,
        name: 'Whatsapp',
        slug: 'whatsapp',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
      2: {
        id: 2,
        created_at: '2020-09-09T06:51:22.237778Z',
        updated_at: '2020-09-09T06:51:22.237778Z',
        deleted_at: null,
        name: 'Facebook',
        slug: 'facebook',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
    },
    loading: false,
  },
};
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

jest.mock('../../actions/claimants', () => ({
  getClaimants: jest.fn(),
  addClaimant: jest.fn(),
}));

describe('Claimants List component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      let state2 = {
        claimants: {
          req: [],
          details: {},
          loading: false,
        },
      };
      store = mockStore(state2);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Claimants permission={{ actions: ['create'] }} />
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
            <Claimants permission={{ actions: ['create'] }} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getClaimants).toBeCalledWith({});
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should handle url search params', () => {
      let wrapper;
      window.history.pushState({}, '', '/claimants?limit=20&page=1&q=descri');
      const store2 = mockStore({
        claimants: {
          req: [
            {
              data: [1, 2],
              query: { page: 1, limit: 20 },
              total: 2,
            },
          ],
          details: {
            1: {
              id: 1,
              created_at: '2020-09-09T06:51:15.770644Z',
              updated_at: '2020-09-09T06:51:15.770644Z',
              deleted_at: null,
              name: 'Whatsapp',
              slug: 'whatsapp',
              description: 'description',
              tag_line: '',
              medium_id: 0,
              space_id: 1,
            },
            2: {
              id: 2,
              created_at: '2020-09-09T06:51:22.237778Z',
              updated_at: '2020-09-09T06:51:22.237778Z',
              deleted_at: null,
              name: 'Facebook',
              slug: 'facebook',
              description: 'description',
              tag_line: '',
              medium_id: 0,
              space_id: 1,
            },
          },
          loading: false,
        },
      });
      act(() => {
        wrapper = mount(
          <Provider store={store2}>
            <Router>
              <Claimants permission={{ actions: ['create'] }} />
            </Router>
          </Provider>,
        );
      });
      expect(getClaimants).toHaveBeenCalledWith({ page: 1, limit: 20, q: 'descri' });
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Claimants permission={{ actions: ['update', 'delete'] }} />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'claimant' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: '' } });

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Search');
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getClaimants).toHaveBeenCalledWith({
          page: 1,
          limit: 5,
          q: 'claimant',
          sort: '',
        });
      }, 0);
    });
  });
});
