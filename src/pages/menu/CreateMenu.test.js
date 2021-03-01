import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateMenu from './CreateMenu';
import * as actions from '../../actions/menu';
import MenuCreateForm from './components/MenuForm';

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
jest.mock('../../actions/menu', () => ({
  addMenu: jest.fn(),
}));

describe('Menus create component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    menu: [],
    details:{},
    loading: false,
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the componet', () => {
      const tree = mount(
        <Provider store={store}>
          <CreateMenu />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addMenu', (done) => {
      actions.addMenu.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateMenu />
          </Provider>,
        );
      });
      wrapper.find(MenuCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.addMenu).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/menu');
        done();
      }, 0);
    });
  })
});