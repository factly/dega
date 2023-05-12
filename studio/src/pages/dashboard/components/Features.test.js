import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { Button } from 'antd';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../../matchMedia.mock';
import Features from './Features';
import { addDefaultFormats, getFormats } from '../../../actions/formats';
import { addDefaultPolicies, getPolicies } from '../../../actions/policies';
import { addDefaultRatings, getRatings } from '../../../actions/ratings';
import { addDefaultEvents, getEvents } from '../../../actions/events';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/formats', () => ({
  getFormats: jest.fn(),
  addDefaultFormats: jest.fn(),
}));

jest.mock('../../../actions/ratings', () => ({
  getRatings: jest.fn(),
  addDefaultRatings: jest.fn(),
}));

jest.mock('../../../actions/policies', () => ({
  getPolicies: jest.fn(),
  addDefaultPolicies: jest.fn(),
}));

jest.mock('../../../actions/events', () => ({
  getEvents: jest.fn(),
  addDefaultEvents: jest.fn(),
}));

let store, mockedDispatch;
let state = {
  admin: {
    organisation: {
      id: 1,
      is_admin: true,
      space_permissions: [{ id: 11, fact_check: true }],
    },
  },
  spaces: {
    orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11', permissions: [{ resource: 'admin', actions: ['admin'] }] },
    },
    loading: false,
    selected: 11,
  },
  ratings: {
    details: {
      1: {
        id: 1,
      },
      2: {
        id: 2,
      },
    },
  },
  policies: {
    details: {
      1: {
        id: 1,
      },
      2: {
        id: 2,
      },
    },
  },
  events: {
    details: {
      1: {
        id: 1,
      },
      2: {
        id: 2,
      },
    },
  },
  formats: {
    details: {
      1: {
        id: 1,
      },
      2: {
        id: 2,
      },
    },
  },
};

describe('Dashboard feature component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Features />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getEvents).toHaveBeenCalled();
      expect(getFormats).toHaveBeenCalled();
      expect(getPolicies).toHaveBeenCalled();
      expect(getRatings).toHaveBeenCalled();
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should addDefaultRatings', () => {
      const state2 = { ...state };
      state2.ratings.details = {};
      const store2 = mockStore(state2);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store2}>
            <Router>
              <Features />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const addButton = wrapper.find('Button').at(0);
        expect(addButton.text()).toBe(' CREATE RATINGS');
        addButton.simulate('click');
      });
      wrapper.update();
      expect(addDefaultRatings).toHaveBeenCalled();
    });
    it('should addDefaultEvents', () => {
      const state2 = { ...state };
      state2.events.details = {};
      const store2 = mockStore(state2);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store2}>
            <Router>
              <Features />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const addButton = wrapper.find('Button').at(1);
        expect(addButton.text()).toBe(' CREATE EVENTS');
        addButton.simulate('click');
      });
      wrapper.update();
      expect(addDefaultEvents).toHaveBeenCalled();
    });
    it('should not display Events option if not super admin', () => {
      const state2 = { ...state };
      state2.admin = {
        organisation: {
          id: 1,
        },
      };
      const store2 = mockStore(state2);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store2}>
            <Router>
              <Features />
            </Router>
          </Provider>,
        );
      });
      expect(wrapper.find(Button).text()).not.toBe(' CREATE EVENTS');
    });
    it('should addDefaultPolicies', () => {
      const state2 = { ...state };
      state2.policies.details = {};
      const store2 = mockStore(state2);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store2}>
            <Router>
              <Features />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const addButton = wrapper.find('Button').at(1);
        expect(addButton.text()).toBe(' CREATE POLICIES');
        addButton.simulate('click');
      });
      wrapper.update();
      expect(addDefaultPolicies).toHaveBeenCalled();
    });
    it('should addDefaultFormats', () => {
      const state2 = { ...state };
      state2.formats.details = {};
      const store2 = mockStore(state2);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store2}>
            <Router>
              <Features />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const addButton = wrapper.find('Button').at(1);
        expect(addButton.text()).toBe(' CREATE FORMATS');
        addButton.simulate('click');
      });
      wrapper.update();
      expect(addDefaultFormats).toHaveBeenCalled();
    });
  });
});
