import React from 'react';
import { useHistory } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import SpaceSelector from './SpaceSelector';
import * as actions from '../../actions/spaces';
import { Select } from 'antd';

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

jest.mock('../../actions/spaces', () => ({
  setSelectedSpace: jest.fn(),
}));

describe('SpaceSelector component', () => {
  let store;
  let mockedDispatch;

  let state = {
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
    it('should render the component with empty data', () => {
      const tree = renderer
        .create(
          <Provider store={store}>
            <SpaceSelector />
          </Provider>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      state.spaces = {
        orgs: [
          {
            id: 1,
            title: 'TOI',
            spaces: [1],
          },
        ],
        details: {
          1: {
            id: 1,
            name: 'English',
            site_address: 'site_address',
            site_title: 'site_title',
            tag_line: 'tag_line',
          },
        },
        selected: 1,
      };
      store = mockStore(() => state);
      const tree = renderer
        .create(
          <Provider store={store}>
            <SpaceSelector />
          </Provider>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should call setSelectedSpace', (done) => {
      actions.setSelectedSpace.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      const state2 = { ...state };
      state2.spaces = {
        orgs: [
          {
            id: 1,
            title: 'TOI',
            spaces: [1],
          },
        ],
        details: {
          1: {
            id: 1,
            name: 'English',
            site_address: 'site_address',
            site_title: 'site_title',
            tag_line: 'tag_line',
            logo: {
              url: { proxy: 'imageproxyurl' },
            },
          },
        },
        selected: 1,
      };
      const store2 = mockStore(state2);
      wrapper = mount(
        <Provider store={store2}>
          <SpaceSelector />
        </Provider>,
      );

      wrapper.find(Select).props().onChange({ space: 1 });
      wrapper.update();

      expect(actions.setSelectedSpace).toHaveBeenCalledWith({ space: 1 });
      done();
    });
  });
});
