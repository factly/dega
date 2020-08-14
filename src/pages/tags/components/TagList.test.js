import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import TagList from './TagList';
import { getTags, deleteTag } from '../../../actions/tags';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/tags', () => ({
  getTags: jest.fn(),
  deleteTag: jest.fn(),
}));

describe('Tags List component', () => {
  let store;
  let mockedDispatch;
  const tag = {
    id: 1,
    name: 'tag',
    slug: 'slug',
    description: 'description',
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
      const tree = renderer.create(<TagList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component when loading', () => {
      useSelector.mockImplementation((state) => ({
        tags: [],
        total: 0,
        loading: true,
      }));
      const tree = renderer.create(<TagList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component with tags', () => {
      useSelector.mockImplementation((state) => ({
        tags: [tag],
        total: 1,
        loading: false,
      }));

      let component;
      act(() => {
        component = renderer.create(
          <Router>
            <TagList />
          </Router>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      expect(useSelector).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(useSelector).toHaveReturnedWith({
        tags: [tag],
        total: 1,
        loading: false,
      });
      expect(getTags).toHaveBeenCalledWith({ page: 1 });
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

      const wrapper = shallow(<TagList />);
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(2);
    });
    it('should delete tag', () => {
      useSelector.mockImplementation((state) => ({
        tags: [tag],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <TagList />
        </Router>,
      );
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deleteTag).toHaveBeenCalled();
      expect(deleteTag).toHaveBeenCalledWith(1);
      expect(getTags).toHaveBeenCalledWith({ page: 1 });
    });
    it('should edit tag', () => {
      useSelector.mockImplementation((state) => ({
        tags: [tag],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <TagList />
        </Router>,
      );
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/tags/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = mount(
        <Router>
          <TagList />
        </Router>,
      );

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
