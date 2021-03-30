import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import ClaimantList from './ClaimantList';
import { getClaimants, deleteClaimant } from '../../../actions/claimants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  claimants: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 20,
        },
        total: 2,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-09-09T06:51:15.770644Z',
        updated_at: '2020-09-09T06:51:15.770644Z',
        deleted_at: null,
        name: 'Whatsapp',
        slug: 'whatsapp',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
      '2': {
        id: 2,
        created_at: '2020-09-09T06:51:22.237778Z',
        updated_at: '2020-09-09T06:51:22.237778Z',
        deleted_at: null,
        name: 'Facebook',
        slug: 'facebook',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
    },
    loading: false,
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/claimants', () => ({
  getClaimants: jest.fn(),
  deleteClaimant: jest.fn(),
}));

describe('Claimants List component', () => {
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
            <ClaimantList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.claimants.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ClaimantList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with claimants', () => {
      state.claimants.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ClaimantList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);

      expect(getClaimants).toHaveBeenCalledWith({ page: 1, limit: 20 });
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
              <ClaimantList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(2);
    });
    it('should delete claimant', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimantList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(2);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      setTimeout(() => {
        expect(deleteClaimant).toHaveBeenCalled();
        expect(deleteClaimant).toHaveBeenCalledWith(1);
        expect(getClaimants).toHaveBeenCalledWith({ page: 1, limit: 20 });
      });
    });
    it('should edit claimant', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimantList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/claimants/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        claimants: {
          req: [],
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimantList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button);
      expect(button.length).toEqual(1);
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimantList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'claimant' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'asc' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getPosts).toHaveBeenCalledWith({
          page: 1,
          limit: 5,
          q: 'claimant',
          sort_by: 'asc',
        });
      }, 0);
    });
  });
});
