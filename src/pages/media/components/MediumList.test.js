import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import MediumList from './MediumList';
import * as actions from '../../../actions/media';
import { mount, shallow } from 'enzyme';
import { Button, Table, Popconfirm } from 'antd';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/media', () => ({
  getMedia: jest.fn(),
  deleteMedium: jest.fn(),
}));

describe('Media List component', () => {
  let store;
  let mockedDispatch;
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      useSelector.mockImplementation(() => ({}));
      const tree = renderer.create(<MediumList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component when loading', () => {
      useSelector.mockImplementation(() => ({
        media: [],
        total: 0,
        loading: true,
      }));
      const tree = renderer.create(<MediumList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component with media', () => {
      useSelector.mockImplementation(() => ({
        media: [{ id: 1, name: 'medium' }],
        total: 1,
        loading: false,
      }));

      let component;
      act(() => {
        component = renderer.create(
          <Router>
            <MediumList />
          </Router>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      expect(useSelector).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(useSelector).toHaveReturnedWith({
        media: [{ id: 1, name: 'medium' }],
        total: 1,
        loading: false,
      });
      expect(actions.getMedia).toHaveBeenCalledWith({ page: 1 });
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      useSelector.mockImplementation(() => ({}));

      const wrapper = shallow(<MediumList />);
      const table = wrapper.find(Table);
      table.props().pagination.onChange(3);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(3);
    });
    it('should delete medium', () => {
      useSelector.mockImplementation(() => ({
        media: [{ id: 1, name: 'Sample image', caption: 'testing ', alt_text: 'sample' }],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <MediumList />
        </Router>,
      );
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      expect(actions.deleteMedium).toHaveBeenCalled();
      expect(actions.deleteMedium).toHaveBeenCalledWith(1);
      expect(actions.getMedia).toHaveBeenCalledWith({ page: 1 });
    });
    it('should edit medium', () => {
      useSelector.mockImplementation(() => ({
        media: [{ id: 1, name: 'Sample image', caption: 'testing ', alt_text: 'sample' }],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <MediumList />
        </Router>,
      );
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/media/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      useSelector.mockImplementation(() => ({}));

      const wrapper = mount(
        <Router>
          <MediumList />
        </Router>,
      );

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
