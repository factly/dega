import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';

import '../../matchMedia.mock';
import Sidebar from './Sidebar';
import * as actions from '../../actions/sidebar';
import { Layout } from 'antd';

const { Sider } = Layout;

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

describe('Sidebar component', () => {
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
    sidebar: {
      collapsed: true,
    },
    spaces: {
      orgs: [{ id: 1, spaces: [1]}],
      details: {
        '1': {
          id: 1,
          created_at: '2020-09-23T06:11:32.986694Z',
          updated_at: '2020-09-23T06:11:32.986694Z',
          name: 'English',
          slug: 'english',
          organisation_id: 1,
          permissions: [
            {
              resource: 'posts',
              actions: ['create'],
            },
          ],
        },
      },
      loading: false,
      selected: 1,
    },
    admin: {
      organisation: {
        id: 1,
        is_admin: true,
      }
    }
  };
  store = mockStore(() => state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = shallow(
          <Provider store={store}>
            <Router>
              <Sidebar 
              permission= {[ {resource: 'posts', actions: ['create']} ]}
              orgs= {[{ id: 1, spaces: [1], permission: { role: 'owner'} }]}
              superOrg= { {id: 1, is_admin: true,} }
              />
           </Router>
          </Provider>,
        );
      expect(tree).toMatchSnapshot();
    });
    it('should not render the component when no space', () => {
      store = mockStore({ settings: state.settings,sidebar: {collapsed: true}, spaces: { selected: 0 } });
      const tree = shallow(
          <Provider store={store}>
            <Router>
              <Sidebar 
              permission= {[ {resource: 'posts', actions: ['create']} ]}
              orgs= {[{ id: 1, spaces: [], permission: { role: 'owner'} }]}
              superOrg= { {id: 1, is_admin: true,} }
              />
            </Router>
          </Provider>,
        );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should call toggleSider', (done) => {
      actions.setCollapse.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      store = mockStore(state);

      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Sidebar 
            permission= {[ {resource: 'posts', actions: ['create']} ]}
            orgs= {[{ id: 1, spaces: [1], permission: { role: 'owner'} }]}
            superOrg= { {id: 1, is_admin: true,} }
            />
          </Router>
        </Provider>,
      );

      wrapper.find(Sider).props().onCollapse();
      wrapper.update();

      expect(actions.setCollapse).toHaveBeenCalled();
      done();
    });
    it('should work alos when resource is admin', (done) => {
      actions.setCollapse.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      store = mockStore(state);

      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Sidebar 
            permission= {[ {resource: 'admin'} ]}
            orgs= {[{ id: 1, spaces: [1], permission: { role: 'owner'} }]}
            superOrg= { {id: 1, is_admin: true,} }
            />
          </Router>
        </Provider>,
      );

      wrapper.find(Sider).props().onCollapse();
      wrapper.update();

      expect(actions.setCollapse).toHaveBeenCalled();
      done();
    });
    it('should not display when loading', (done) => {
      actions.setCollapse.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      store = mockStore(state);

      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Sidebar 
            loading = {true}
            permission= {[ {resource: 'admin'} ]}
            orgs= {[{ id: 1, spaces: [1], permission: { role: 'owner'} }]}
            superOrg= { {id: 1, is_admin: true,} }
            />
          </Router>
        </Provider>,
      );
      expect(wrapper.find(Sider).length).toBe(0);
      expect(actions.setCollapse).not.toHaveBeenCalled();
      done();
    });
  });
});
