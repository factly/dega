import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import ClaimList from './ClaimList';
import { getClaims, deleteClaim } from '../../../actions/claims';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/claims', () => ({
  getClaims: jest.fn(),
  deleteClaim: jest.fn(),
}));

describe('Claims List component', () => {
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
      const tree = renderer.create(<ClaimList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component when loading', () => {
      useSelector.mockImplementation((state) => ({
        claims: [],
        total: 0,
        loading: true,
      }));
      const tree = renderer.create(<ClaimList />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(useSelector).toHaveBeenCalled();
    });
    it('should match component with claims', () => {
      useSelector.mockImplementation((state) => ({
        claims: [{ id: 1, name: 'claim' }],
        total: 1,
        loading: false,
      }));

      let component;
      act(() => {
        component = renderer.create(
          <Router>
            <ClaimList />
          </Router>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      expect(useSelector).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(useSelector).toHaveReturnedWith({
        claims: [{ id: 1, name: 'claim' }],
        total: 1,
        loading: false,
      });
      expect(getClaims).toHaveBeenCalledWith({ page: 1 });
    });
  });
  describe('component testing', () => {
    const claim = {
      id: 1,
      title: 'title',
      claimant: 12,
      rating: 13,
      claim_date: '2020-12-12',
    };
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = shallow(<ClaimList />);
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(2);
    });
    it('should delete claim', () => {
      useSelector.mockImplementation((state) => ({
        claims: [claim],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <ClaimList />
        </Router>,
      );
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      expect(deleteClaim).toHaveBeenCalled();
      expect(deleteClaim).toHaveBeenCalledWith(1);
      expect(getClaims).toHaveBeenCalledWith({ page: 1 });
    });
    it('should edit claim', () => {
      useSelector.mockImplementation((state) => ({
        claims: [claim],
        total: 1,
        loading: false,
      }));

      const wrapper = mount(
        <Router>
          <ClaimList />
        </Router>,
      );
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/claims/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      useSelector.mockImplementation((state) => ({}));

      const wrapper = mount(
        <Router>
          <ClaimList />
        </Router>,
      );

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
