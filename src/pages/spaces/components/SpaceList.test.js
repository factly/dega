import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { Popconfirm, Button } from 'antd';

import '../../../matchMedia.mock';
import SpaceList from './SpaceList';
import { getSpaces, deleteSpace } from '../../../actions/spaces';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/spaces', () => ({
  getSpaces: jest.fn(),
  deleteSpace: jest.fn(),
}));

describe('Spaces List component', () => {
  let store;
  let mockedDispatch;
  const space = {
    id: 1,
    name: 'space',
    site_address: 'site_address',
    site_title: 'site_title',
    tag_line: 'tag_line',
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
      const tree = renderer.create(<SpaceList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component when loading', () => {
      useSelector.mockImplementation((state) => ({
        spaces: [],
        loading: true,
      }));
      const tree = renderer.create(<SpaceList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component with spaces', () => {
      useSelector.mockImplementation((state) => ({
        spaces: [space],
        loading: false,
      }));

      let component;
      act(() => {
        component = renderer.create(
          <Router>
            <SpaceList />
          </Router>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      expect(useSelector).toHaveBeenCalled();
      expect(useSelector).toHaveReturnedWith({
        spaces: [space],
        loading: false,
      });
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should delete space', () => {
      useSelector.mockImplementation((state) => ({
        spaces: [space],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <SpaceList />
        </Router>,
      );
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      setTimeout(() => {
        expect(deleteSpace).toHaveBeenCalled();
        expect(deleteSpace).toHaveBeenCalledWith(1);
        expect(getSpaces).toHaveBeenCalledWith({ page: 1 });
      });
    });
    it('should edit space', () => {
      useSelector.mockImplementation((state) => ({
        spaces: [space],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <SpaceList />
        </Router>,
      );
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/spaces/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = mount(
        <Router>
          <SpaceList />
        </Router>,
      );

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
