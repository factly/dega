import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';
import { act } from 'react-dom/test-utils';

import '../../../matchMedia.mock';
import FormatList from './FormatList';
import { getFormats, deleteFormat } from '../../../actions/formats';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const setFilters = jest.fn();
const fetchFormats = jest.fn();
let store, mockedDispatch;
let info = {
  formats: [
    {
      id: 1,
      created_at: '2020-09-25T07:23:38.40006Z',
      updated_at: '2020-09-25T07:23:38.40006Z',
      deleted_at: null,
      name: 'Fact check',
      slug: 'fact-check',
      description: '',
      space_id: 1,
    },
    {
      id: 2,
      created_at: '2020-09-25T07:24:11.008257Z',
      updated_at: '2020-09-25T07:24:11.008257Z',
      deleted_at: null,
      name: 'Article',
      slug: 'article',
      description: '',
      space_id: 1,
    },
  ],
  total: 2,
  loading: false,
};
const filters = {
  page: 1,
  limit: 20,
};
let state = {
  formats: {
    req: [
      {
        data: [2, 1],
        query: {
          page: 1,
          limit: 20,
        },
        total: 2,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-09-25T07:23:38.40006Z',
        updated_at: '2020-09-25T07:23:38.40006Z',
        deleted_at: null,
        name: 'Fact check',
        slug: 'fact-check',
        description: '',
        space_id: 1,
      },
      '2': {
        id: 2,
        created_at: '2020-09-25T07:24:11.008257Z',
        updated_at: '2020-09-25T07:24:11.008257Z',
        deleted_at: null,
        name: 'Article',
        slug: 'article',
        description: '',
        space_id: 1,
      },
    },
    loading: false,
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/formats', () => ({
  getFormats: jest.fn(),
  deleteFormat: jest.fn(),
}));

describe('Formats List component', () => {
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
            <FormatList data={info} filters={filters} actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.formats.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <FormatList data={info} filters={filters} actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with formats', () => {
      state.formats.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <FormatList
              data={info}
              fetchFormats={fetchFormats}
              filters={filters}
              actions={['update', 'delete']}
            />
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
              <FormatList
                data={info}
                setFilters={setFilters}
                filters={filters}
                actions={['update', 'delete']}
              />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(1);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(1);
    });
    it('should delete format', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <FormatList
                data={info}
                fetchFormats={fetchFormats}
                filters={filters}
                actions={['update', 'delete']}
              />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(0);
      expect(button.text()).toEqual('');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deleteFormat).toHaveBeenCalled();
      expect(deleteFormat).toHaveBeenCalledWith(1);
    });
    it('should edit format', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <FormatList data={info} filters={filters} actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.text()).toEqual('Fact check');
      expect(link.prop('to')).toEqual('/advanced/formats/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        formats: {
          req: [],
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <FormatList
                data={{ formats: [], loading: false, total: 0 }}
                filters={filters}
                actions={['update', 'delete']}
              />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
