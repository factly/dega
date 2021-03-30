import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../../matchMedia.mock';
import SpaceRequestList from './RequestList';
import { getSpaces, approveSpaceRequest } from '../../../../actions/spaceRequests';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  spaceRequests: {
    req: [
      {
        data: [1, 2, 3],
        query: {
          page: 1,
          limit: 20,
        },
        total: 3,
      },
    ],
    details: {
      '1': {
        id: 1,
        title: 'Request 1',
        description: 'Description',
        status: 'pending',
        media: -1,
        posts: -1,
        fact_check: true,
        space_id: 1,
        episodes: -1,
        podcast: true
      },
      '2': {
        id: 2,
        title: 'Request 2',
        description: 'Description',
        status: 'pending',
        media: 5,
        posts: 5,
        fact_check: false,
        space_id: 2,
        episodes: 10,
        podcast: true
      },
      '3': {
        id: 3,
        title: 'Request 3',
        description: 'Description',
        status: 'pending',
        fact_check: false,
        space_id: 2,
      },
    },
    loading: false,
  },
  admin: {
    loading: false,
    organisation: {
      id: 1,
      is_admin: true,
    },
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../../actions/spaceRequests', () => ({
  getSpaces: jest.fn(),
  approveSpaceRequest: jest.fn(),
}));

describe('Space Request List component', () => {
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
            <SpaceRequestList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component when not admin', () => {
      store = mockStore({
        spaceRequests: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
                limit: 20,
              },
              total: 1,
            },
          ],
          details: {
            1: {
              id: 1,
              title: 'Request 1',
              description: 'Description',
              status: 'pending',
              media: -1,
              posts: -1,
              fact_check: true,
              space_id: 1,
              episodes: -1,
              podcast: true,
            },
          },
          loading: false,
        },
        admin: {
          loading: false,
          organisation: {
            id: 1,
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <SpaceRequestList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match the component when loading', () => {
      state.spaceRequests.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <SpaceRequestList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match the component with space requests', () => {
      state.spaceRequests.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <SpaceRequestList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(getSpaces).toHaveBeenCalledWith({ page: 1, limit: 20}, true);
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <SpaceRequestList />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(Table).props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(2);
    });
    it('should approve request', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <SpaceRequestList />
            </Router>
          </Provider>,
        );
      });
      const approveButton = wrapper.find(Button).at(0);
      expect(approveButton.text()).toEqual('Approve');
      approveButton.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      expect(approveSpaceRequest).toHaveBeenCalled();
      expect(approveSpaceRequest).toHaveBeenCalledWith(1,'approve');
      expect(getSpaces).toHaveBeenCalledWith({ page: 1, limit: 20}, true);
    });
    it('should reject request', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <SpaceRequestList />
            </Router>
          </Provider>,
        );
      });
      const rejectButton = wrapper.find(Button).at(1);
      expect(rejectButton.text()).toEqual('Reject');
      rejectButton.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      expect(approveSpaceRequest).toHaveBeenCalled();
      expect(approveSpaceRequest).toHaveBeenCalledWith(1,'reject');
      expect(getSpaces).toHaveBeenCalledWith({ page: 1, limit: 20}, true);
    });
  });
})