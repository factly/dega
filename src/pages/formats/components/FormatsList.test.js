import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import FormatsList from './FormatsList';
import { getFormats, deleteFormat } from '../../../actions/formats';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/formats', () => ({
  getFormats: jest.fn(),
  deleteFormat: jest.fn(),
}));

describe('Formats List component', () => {
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
      useSelector.mockImplementation((state) => ({}));
      const tree = renderer.create(<FormatsList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component when loading', () => {
      useSelector.mockImplementation((state) => ({
        formats: [],
        total: 0,
        loading: true,
      }));
      const tree = renderer.create(<FormatsList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component with formats', () => {
      useSelector.mockImplementation((state) => ({
        formats: [{ id: 1, name: 'format' }],
        total: 1,
        loading: false,
      }));

      let component;
      act(() => {
        component = renderer.create(
          <Router>
            <FormatsList />
          </Router>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      expect(useSelector).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(useSelector).toHaveReturnedWith({
        formats: [{ id: 1, name: 'format' }],
        total: 1,
        loading: false,
      });
      expect(getFormats).toHaveBeenCalledWith({ page: 1 });
    });
  });
  describe('component testing', () => {
    const format = {
      id: 1,
      name: 'format',
      slug: 'slug',
      description: 'description',
    };
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = shallow(<FormatsList />);
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(2);
    });
    it('should delete format', () => {
      useSelector.mockImplementation((state) => ({
        formats: [format],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <FormatsList />
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
        expect(deleteFormat).toHaveBeenCalled();
        expect(deleteFormat).toHaveBeenCalledWith(1);
        expect(getFormats).toHaveBeenCalledWith({ page: 1 });
      });
    });
    it('should edit format', () => {
      useSelector.mockImplementation((state) => ({
        formats: [format],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <FormatsList />
        </Router>,
      );
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/formats/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = mount(
        <Router>
          <FormatsList />
        </Router>,
      );

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
