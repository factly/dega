import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { useSelector, useDispatch, Provider } from 'react-redux';
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
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/media', () => ({
  getMedia: jest.fn(),
  deleteMedium: jest.fn(),
}));

let mockedDispatch, store;

let state = {
  media: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
          limit: 10,
        },
        total: 1,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-09-23T09:21:29.245873Z',
        updated_at: '2020-09-23T09:21:29.245873Z',
        deleted_at: null,
        name: 'uppy/english/2020/8/1600852886756_pnggrad16rgb.png',
        slug: 'uppy-english-2020-8-1600852886756-pnggrad16rgb-png',
        type: 'image/png',
        title: 'png',
        description: 'png',
        caption: 'png',
        alt_text: 'png',
        file_size: 3974,
        url: 'http://storage.googleapis.com/sample.png',
        dimensions: '100x100',
        space_id: 1,
      },
    },
    loading: false,
  },
};

describe('Media List component', () => {
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
            <MediumList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.media.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <MediumList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with media', () => {
      state.media.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <MediumList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();

      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(actions.getMedia).toHaveBeenCalledWith({ page: 1, limit: 10 });
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
              <MediumList />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(3);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(3);
    });
    it('should delete medium', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <MediumList />
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
      expect(actions.deleteMedium).toHaveBeenCalled();
      expect(actions.deleteMedium).toHaveBeenCalledWith(1);
      expect(actions.getMedia).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
    it('should edit medium', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <MediumList />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/media/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        media: {
          req: [],
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <MediumList />
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
              <MediumList />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'pic' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'asc' } });

        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getPosts).toHaveBeenCalledWith({
          page: 1,
          q: 'tag',
        });
      }, 0);
    });
  });
});
