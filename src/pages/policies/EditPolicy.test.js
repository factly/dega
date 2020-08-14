import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditPolicy from './EditPolicy';
import * as actions from '../../actions/policies';
import PolicyEditForm from './components/PolicyForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/policies', () => ({
  getPolicies: jest.fn(),
  addPolicy: jest.fn(),
  getPolicy: jest.fn(),
  updatePolicy: jest.fn(),
}));

describe('Policies edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    policies: {
      req: [],
      details: {
        '1': {
          id: 1,
          name: 'policy',
          description: 'description',
          permissions: [
            {
              resource: 'policy',
              actions: ['create'],
            },
          ],
        },
      },
      loading: false,
    },
    authors: {
      req: [{ query: { page: 1 }, total: 1, data: [1] }],
      details: { 1: { id: 1, name: 'Author', email: 'author@aut.co' } },
      loading: false,
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
            <EditPolicy />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      let tree;
      store = mockStore({
        policies: {
          req: [],
          details: {},
          loading: false,
        },
        authors: {
          req: [],
          details: {},
          loading: false,
        },
      });
      act(() => {
        tree = shallow(
          <Provider store={store}>
            <EditPolicy />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      let tree;
      store = mockStore({
        policies: {
          req: [],
          details: {},
          loading: true,
        },
        authors: {
          req: [],
          details: {},
          loading: false,
        },
      });
      act(() => {
        tree = shallow(
          <Provider store={store}>
            <EditPolicy />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        policies: {
          req: [],
          details: {
            '1': {
              id: 1,
              name: 'policy',
              description: 'description',
              permissions: [
                {
                  resource: 'policy',
                  actions: ['create'],
                },
              ],
            },
          },
          loading: false,
        },
        authors: {
          req: [{ query: { page: 1 }, total: 1, data: [1] }],
          details: { 1: { id: 1, name: 'Author', email: 'author@aut.co' } },
          loading: false,
        },
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getPolicy.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditPolicy />
          </Provider>,
        );
      });
      expect(actions.getPolicy).toHaveBeenCalledWith('1');
    });
    it('should call updatePolicy', (done) => {
      actions.updatePolicy.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditPolicy />
          </Provider>,
        );
      });
      wrapper.find(PolicyEditForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updatePolicy).toHaveBeenCalledWith({
          id: 1,
          name: 'policy',
          description: 'description',
          permissions: {
            policy: ['create'],
          },
          users: [],
          test: 'test',
        });
        expect(push).toHaveBeenCalledWith('/policies');
        done();
      }, 0);
    });
  });
});
