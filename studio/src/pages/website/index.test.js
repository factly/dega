import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Website from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

describe('Website Settings Component', () => {
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
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Website />
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
    it('should link to general settings', () => {
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Website />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.text()).toEqual('GeneralBasic Site Details and Site Meta Data');
      expect(link.prop('to')).toEqual('/website/general');
    });
    it('should link to branding', () => {
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Website />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(1);
      expect(link.text()).toEqual('BrandingUpdate site logos, icons and design tokens');
      expect(link.prop('to')).toEqual('/website/branding');
    });
    it('should link to menus', () => {
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Website />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(2);
      expect(link.text()).toEqual('NavigationSetup Menus');
      expect(link.prop('to')).toEqual('/website/menus');
    });
    it('should link to code injection', () => {
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Website />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(3);
      expect(link.text()).toEqual('Code InjectionAdd code to your site');
      expect(link.prop('to')).toEqual('/website/code-injection');
    });
    it('should link to analytics', () => {
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Website />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(4);
      expect(link.text()).toEqual('AnalyticsView Analytics for your site');
      expect(link.prop('to')).toEqual('/website/analytics');
    });
  });
});
