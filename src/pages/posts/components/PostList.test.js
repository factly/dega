import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { Popconfirm, Button, List } from 'antd';

import '../../../matchMedia.mock';
import PostList from './PostList';
import { getPosts, deletePost } from '../../../actions/posts';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/posts', () => ({
  getPosts: jest.fn(),
  deletePost: jest.fn(),
}));

describe('Posts List component', () => {
  let store;
  let mockedDispatch;
  describe('snapshot component', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      useSelector.mockImplementation((state) => ({}));
      const tree = renderer.create(<PostList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component when loading', () => {
      useSelector.mockImplementation((state) => ({
        posts: [],
        total: 0,
        loading: true,
      }));
      const tree = renderer.create(<PostList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component with posts', () => {
      useSelector.mockImplementation((state) => ({
        posts: [{ id: 1, name: 'post' }],
        total: 1,
        loading: false,
      }));

      let component;
      act(() => {
        component = renderer.create(
          <Router>
            <PostList />
          </Router>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      expect(useSelector).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(useSelector).toHaveReturnedWith({
        posts: [{ id: 1, name: 'post' }],
        total: 1,
        loading: false,
      });
      expect(getPosts).toHaveBeenCalledWith({ page: 1 });
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

      const wrapper = shallow(<PostList />);
      const list = wrapper.find(List);
      list.props().pagination.onChange(2);
      wrapper.update();
      const updatedList = wrapper.find(List);
      expect(updatedList.props().pagination.current).toEqual(2);
    });
    it('should delete post', () => {
      useSelector.mockImplementation((state) => ({
        posts: [
          {
            id: 1,
            name: 'name',
            slug: 'slug',
            description: 'description',
            tag_line: 'tag_line',
            medium_id: 1,
          },
        ],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <PostList />
        </Router>,
      );
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deletePost).toHaveBeenCalled();
      expect(deletePost).toHaveBeenCalledWith(1);
      expect(getPosts).toHaveBeenCalledWith({ page: 1 });
    });
    it('should edit post', () => {
      useSelector.mockImplementation((state) => ({
        posts: [
          {
            id: 1,
            title: 'title',
            excerpt: 'excerpt',
            medium: { url: 'http://example.com', alt_text: 'example' },
          },
        ],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <PostList />
        </Router>,
      );
      const link = wrapper.find(Link).at(1);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/posts/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = mount(
        <Router>
          <PostList />
        </Router>,
      );

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
    it('should check image url and alt_text', () => {
      useSelector.mockImplementation((state) => ({
        posts: [
          {
            id: 1,
            title: 'title',
            excerpt: 'excerpt',
            medium: { url: 'http://example.com', alt_text: 'example' },
          },
        ],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <PostList />
        </Router>,
      );

      const image = wrapper.find('img');
      expect(image.length).toEqual(1);
      expect(image.props().src).toEqual('http://example.com');
      expect(image.props().alt).toEqual('example');
    });
  });
});
