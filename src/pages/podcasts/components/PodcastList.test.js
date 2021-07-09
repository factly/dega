import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import PodcastList from './PodcastList';
import { deletePodcast } from '../../../actions/podcasts';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;
const filters = {
  page: 1,
  limit: 20,
};
const setFilters = jest.fn();
const fetchPodcasts = jest.fn();
const info = {
  podcasts: [
    {
      id: 1,
      title: 'Podcast-1',
      slug: 'podcast-1',
      medium_id: 1,
      language: 'english',
      categories: [1],
      episodes: [1],
    },
    {
      id: 2,
      title: 'Podcast-2',
      slug: 'podcast-2',
      medium_id: 1,
      language: 'english',
      categories: [1],
      episodes: [1],
    },
  ],
  total: 2,
  loading: false,
};
let state = {
  podcasts: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 20,
        },
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        title: 'Podcast-1',
        slug: 'podcast-1',
        medium_id: 1,
        language: 'english',
        categories: [1],
        episodes: [1],
      },
      2: {
        id: 2,
        title: 'Podcast-2',
        slug: 'podcast-2',
        medium_id: 1,
        language: 'english',
        categories: [1],
        episodes: [1],
      },
    },
    loading: false,
  },
  media: {
    req: [],
    details: {
      1: {
        name: 'Sample Image',
        slug: 'sample-img',
      },
    },
    loading: false,
  },
  spaces: {
    orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11' },
    },
    loading: false,
    selected: 11,
  },
  categories: {
    req: [],
    details: {},
    loading: false,
  },
  episodes: {
    req: [],
    details: {},
    loading: false,
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/podcasts', () => ({
  getPodcasts: jest.fn(),
  deletePodcast: jest.fn(),
}));

describe('Podcast List component', () => {
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
            <PodcastList
              actions={['admin']}
              data={info}
              filters={filters}
              setFilters={setFilters}
              fetchPodcasts={fetchPodcasts}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.podcasts.loading = true;
      store = mockStore(state);
      const info2 = { ...info };
      info2.loading = true;
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PodcastList
              actions={['admin']}
              data={info2}
              filters={filters}
              setFilters={setFilters}
              fetchPodcasts={fetchPodcasts}
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
              <PodcastList
                actions={['admin']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchPodcasts={fetchPodcasts}
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
    it('should delete podcast', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PodcastList
                actions={['admin']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchPodcasts={fetchPodcasts}
              />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      expect(deletePodcast).toHaveBeenCalled();
      expect(deletePodcast).toHaveBeenCalledWith(1);
    });
    it('should edit podcast', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PodcastList
                actions={['admin']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchPodcasts={fetchPodcasts}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/podcasts/1/edit');
    });
    it('should disable edit delete button if no permission', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PodcastList
                actions={['create']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchPodcasts={fetchPodcasts}
              />
            </Router>
          </Provider>,
        );
      });
      const editButton = wrapper.find('Button').at(0);
      const deleteButton = wrapper.find('Button').at(1);
      expect(editButton.props().disabled).toBe(true);
      expect(deleteButton.props().disabled).toBe(true);
    });
  });
});
