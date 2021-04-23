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
import * as actions from '../../actions/sidebar';

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

jest.mock('../../actions/sidebar', () => ({
  setCollapse: jest.fn(),
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
      orgs: [
        {
          id: 1,
          applications: [{ id: 1, name: 'App1', url: 'http://1233434/1323' }],
          spaces: [11],
        },
      ],
      details: {
        11: {
          id: 11,
          organisation_id: 1,
          name: 'Space 11',
        },
      },
      loading: true,
      selected: 11,
    },
    sidebar: {
      collapsed: true,
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
            <Header applications={[{ id: 1, name: 'App1', url: 'http://1233434/1323' }]} />
          </Provider>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with no applications', () => {
      const tree = renderer
        .create(
          <Provider store={store}>
            <Header applications={[]} />
          </Provider>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
