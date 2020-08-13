import React from 'react';
import { useHistory } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Header from './Header';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import * as actions from '../../actions/settings';

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

jest.mock('../../actions/settings', () => ({
  toggleSider: jest.fn(),
}));

describe('Header component', () => {
  let store;
  let mockedDispatch;

  let state = {
    settings: {
      navTheme: 'dark',
      title: 'Dega',
      sider: {
        collapsed: true,
      },
    },
    spaces: {
      orgs: [],
      details: {},
      loading: true,
      selected: 0,
    },
  };
  store = mockStore(() => state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = renderer
        .create(
          <Provider store={store}>
            <Header />
          </Provider>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should call MenuUnfoldOutlined', (done) => {
      actions.toggleSider.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });

      wrapper = mount(
        <Provider store={store}>
          <Header />
        </Provider>,
      );

      wrapper.find(MenuUnfoldOutlined).props().onClick();
      wrapper.update();

      expect(actions.toggleSider).toHaveBeenCalledWith();
      done();
    });
    it('should call MenuFoldOutlined', (done) => {
      actions.toggleSider.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });

      state.settings.sider.collapsed = false;
      store = mockStore(() => state);

      wrapper = mount(
        <Provider store={store}>
          <Header />
        </Provider>,
      );

      wrapper.find(MenuFoldOutlined).props().onClick();
      wrapper.update();

      expect(actions.toggleSider).toHaveBeenCalledWith();
      done();
    });
  });
});
