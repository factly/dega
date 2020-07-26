import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import RatingsList from './RatingsList';
import { getRatings, deleteRating } from '../../../actions/ratings';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/ratings', () => ({
  getRatings: jest.fn(),
  deleteRating: jest.fn(),
}));

describe('Ratings List component', () => {
  let store;
  let mockedDispatch;
  const rating = {
    id: 1,
    name: 'rating',
    slug: 'slug',
    description: 'description',
    numeric_value: 2,
  };

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      useSelector.mockImplementation((state) => ({}));
      const tree = renderer.create(<RatingsList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component when loading', () => {
      useSelector.mockImplementation((state) => ({
        ratings: [],
        total: 0,
        loading: true,
      }));
      const tree = renderer.create(<RatingsList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component with ratings', () => {
      useSelector.mockImplementation((state) => ({
        ratings: [rating],
        total: 1,
        loading: false,
      }));

      let component;
      act(() => {
        component = renderer.create(
          <Router>
            <RatingsList />
          </Router>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      expect(useSelector).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(useSelector).toHaveReturnedWith({
        ratings: [rating],
        total: 1,
        loading: false,
      });
      expect(getRatings).toHaveBeenCalledWith({ page: 1 });
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = shallow(<RatingsList />);
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      setTimeout(() => expect(table.props().pagination.current).toEqual(2));
    });
    it('should delete rating', () => {
      useSelector.mockImplementation((state) => ({
        ratings: [rating],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <RatingsList />
        </Router>,
      );
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deleteRating).toHaveBeenCalled();
      expect(deleteRating).toHaveBeenCalledWith(1);
      expect(getRatings).toHaveBeenCalledWith({ page: 1 });
    });
    it('should edit rating', () => {
      useSelector.mockImplementation((state) => ({
        ratings: [rating],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <RatingsList />
        </Router>,
      );
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/ratings/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = mount(
        <Router>
          <RatingsList />
        </Router>,
      );

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
