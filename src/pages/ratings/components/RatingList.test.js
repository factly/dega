import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import RatingList from './RatingList';
import { getRatings, deleteRating } from '../../../actions/ratings';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  ratings: {
    req: [
      {
        data: [2, 1],
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
        created_at: '2020-10-01T06:25:37.717922Z',
        updated_at: '2020-10-01T06:25:37.717922Z',
        deleted_at: null,
        name: 'True',
        slug: 'true',
        description: '',
        numeric_value: 5,
        medium_id: 0,
        space_id: 1,
        background_colour: { hex : '#108040'}
      },
      '2': {
        id: 2,
        created_at: '2020-10-01T06:25:47.227933Z',
        updated_at: '2020-10-01T06:25:47.227933Z',
        deleted_at: null,
        name: 'False',
        slug: 'false',
        description: '',
        numeric_value: 1,
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
jest.mock('../../../actions/ratings', () => ({
  getRatings: jest.fn(),
  deleteRating: jest.fn(),
}));

describe('Ratings List component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      store = mockStore(state);
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <RatingList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.ratings.loading = true;
      store = mockStore(state);
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <RatingList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with ratings', () => {
      state.ratings.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <RatingList actions={['update', 'delete']} />
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
    it('should change the page', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <RatingList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      setTimeout(() => expect(table.props().pagination.current).toEqual(2));
    });
    it('should delete rating', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <RatingList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deleteRating).toHaveBeenCalled();
      expect(deleteRating).toHaveBeenCalledWith(2);
      expect(getRatings).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
    it('should edit rating', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <RatingList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/ratings/2/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        ratings: {
          req: [],
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <RatingList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
