import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { act } from 'react-dom/test-utils';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import TagList from './TagList';
import { getTags, deleteTag } from '../../../actions/tags';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/tags', () => ({
  getTags: jest.fn(),
  deleteTag: jest.fn(),
}));

let mockedDispatch, store;

let state = {
  tags: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 5,
        },
        total: 2,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-09-09T06:49:36.566567Z',
        updated_at: '2020-09-09T06:49:36.566567Z',
        deleted_at: null,
        name: 'Election',
        slug: 'election',
        description: {time: 1613561493761, blocks: [{type: "paragraph", data: {text: "Description"}}], version: "2.19.0"},
        medium_id: 0,
        space_id: 1,
        posts: null,
      },
      '2': {
        id: 2,
        created_at: '2020-09-09T06:49:54.027402Z',
        updated_at: '2020-09-09T06:49:54.027402Z',
        deleted_at: null,
        name: 'Politics',
        slug: 'politics',
        description: {time: 1613561493781, blocks: [{type: "paragraph", data: {text: "Description 2"}}], version: "2.19.0"},
        medium_id: 0,
        space_id: 1,
        posts: null,
      },
    },
    loading: false,
  },
};

describe('Tags List component', () => {
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
            <TagList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.tags.loading = true;
      store = mockStore(state);
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <TagList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with tags', () => {
      state.tags.loading = false;
      store = mockStore(state);
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <TagList actions={['update', 'delete']} />
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
              <TagList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(2);
    });
    it('should delete tag', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <TagList actions={['update', 'delete']} />
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

      expect(deleteTag).toHaveBeenCalled();
      expect(deleteTag).toHaveBeenCalledWith(1);
      expect(getTags).toHaveBeenCalledWith({ page: 1, limit: 5 });
    });
    it('should edit tag', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <TagList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/tags/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        tags: {
          req: [],
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <TagList actions={['update', 'delete']} />
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
              <TagList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'tag' } });
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
          limit: 5,
          q: 'tag',
        });
      }, 0);
    });
  });
});
