import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import ClaimantsList from './ClaimantsList';
import { getClaimants, deleteClaimant } from '../../../actions/claimants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/claimants', () => ({
  getClaimants: jest.fn(),
  deleteClaimant: jest.fn(),
}));

describe('Claimants List component', () => {
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
      const tree = renderer.create(<ClaimantsList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component when loading', () => {
      useSelector.mockImplementation((state) => ({
        claimants: [],
        total: 0,
        loading: true,
      }));
      const tree = renderer.create(<ClaimantsList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component with claimants', () => {
      useSelector.mockImplementation((state) => ({
        claimants: [{ id: 1, name: 'claimant' }],
        total: 1,
        loading: false,
      }));

      let component;
      act(() => {
        component = renderer.create(
          <Router>
            <ClaimantsList />
          </Router>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      expect(useSelector).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(useSelector).toHaveReturnedWith({
        claimants: [{ id: 1, name: 'claimant' }],
        total: 1,
        loading: false,
      });
      expect(getClaimants).toHaveBeenCalledWith({ page: 1 });
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

      const wrapper = shallow(<ClaimantsList />);
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(2);
    });
    it('should delete claimant', () => {
      useSelector.mockImplementation((state) => ({
        claimants: [
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
          <ClaimantsList />
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
        expect(deleteClaimant).toHaveBeenCalled();
        expect(deleteClaimant).toHaveBeenCalledWith(1);
        expect(getClaimants).toHaveBeenCalledWith({ page: 1 });
      });
    });
    it('should edit claimant', () => {
      useSelector.mockImplementation((state) => ({
        claimants: [
          { id: 1, name: 'Name', description: 'Description', slug: 'slug', parent_id: 1 },
        ],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <ClaimantsList />
        </Router>,
      );
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/claimants/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = mount(
        <Router>
          <ClaimantsList />
        </Router>,
      );

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
