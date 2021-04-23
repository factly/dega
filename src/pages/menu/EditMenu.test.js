import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditMenu from './EditMenu';
import * as actions from '../../actions/menu';
import MenuEditForm from './components/MenuForm';

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
jest.mock('../../actions/menu', () => ({
  updateMenu: jest.fn(),
  getMenu: jest.fn(),
}));

describe('Menu Edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    menu: {
      req: [
        {
          data: [1],
          query: {
            page: 1,
            limit: 5,
          },
          total: 1,
        },
      ],
      details: {
        '1': {
          id: 1,
          name: 'Menu 1',
        },
      },
      loading: false,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <EditMenu />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        menu: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditMenu />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        menu: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditMenu />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        menu: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
                limit: 5,
              },
              total: 1,
            },
          ],
          details: {
            '1': {
              id: 1,
              name: 'Menu 1',
            },
          },
          loading: false,
        },
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getMenu.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditMenu />
          </Provider>,
        );
      });
      expect(actions.getMenu).toHaveBeenCalledWith('1');
    });
    it('should call updateMenu', (done) => {
      actions.updateMenu.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditMenu />
          </Provider>,
        );
      });
      wrapper.find(MenuEditForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateMenu).toHaveBeenCalledWith({
          id: 1,
          name: 'Menu 1',
          test: 'test',
        });
        expect(push).toHaveBeenCalledWith('/menu/1/edit');
        done();
      }, 0);
    });
  });
});
