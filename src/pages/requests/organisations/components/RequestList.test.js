import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../../matchMedia.mock';
import OrganisationRequestList from './RequestList';
import {
  getOrganisations,
  approveOrganisationRequest,
} from '../../../../actions/organisationRequests';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  organisationRequests: {
    req : [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 5,
        },
        total: 2,
      },
    ],
    details: {
      '1' : {
        id: 1,
        title: 'Request',
        spaces: 4,
        organisation_id: 10,
        status: 'pending',
      },
      '2' : {
        id: 2,
        title: 'Request 2',
        spaces: 5,
        organisation_id: 11,
        status: 'pending',
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
jest.mock('../../../../actions/organisationRequests', () => ({
  getOrganisations: jest.fn(),
  approveOrganisationRequest: jest.fn(),
}));

describe('Organisation Request List component', () => {
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
            <OrganisationRequestList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match the component when loading', () => {
      state.organisationRequests.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationRequestList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match the component with organisation requests', () => {
      state.organisationRequests.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationRequestList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(getOrganisations).toHaveBeenCalledWith({ page: 1, limit: 5 }, true);
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
              <OrganisationRequestList />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(Table).props().pagination.onChange(3);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(3);
    });
    it('should approve request', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <OrganisationRequestList />
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
      expect(approveOrganisationRequest).toHaveBeenCalled();
      expect(approveOrganisationRequest).toHaveBeenCalledWith(1,'approve');
      expect(getOrganisations).toHaveBeenCalledWith({ page: 1, limit: 5 }, true);
    });
    it('should reject request', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <OrganisationRequestList />
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
      expect(approveOrganisationRequest).toHaveBeenCalled();
      expect(approveOrganisationRequest).toHaveBeenCalledWith(1,'reject');
      expect(getOrganisations).toHaveBeenCalledWith({ page: 1, limit: 5 }, true);
    });
  });
})