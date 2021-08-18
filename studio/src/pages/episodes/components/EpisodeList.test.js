import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import EpisodeList from './EpisodeList';
import { getEpisodes, deleteEpisode } from '../../../actions/episodes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/episodes', () => ({
  getEpisodes: jest.fn(),
  deleteEpisode: jest.fn(),
}));
const filters = {
  page: 1,
  limit: 20,
};
const setFilters = jest.fn();
const fetchEpisodes = jest.fn();
const info = {
  episodes: [
    {
      id: 1,
      title: 'Episode 1',
      slug: 'episode-1',
      season: 1,
      episode: 1,
      type: 'full',
      description: {
        time: 1595747741807,
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Description',
            },
          },
        ],
        version: '2.18.0',
      },
      audio_url: 'audioUrl',
      medium_id: 1,
    },
  ],
  total: 1,
  loading: false,
};
let state = {
  episodes: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
          limit: 20,
        },
        total: 1,
      },
    ],
    details: {
      1: {
        id: 1,
        title: 'Episode 1',
        slug: 'episode-1',
        season: 1,
        episode: 1,
        type: 'full',
        description: {
          time: 1595747741807,
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'Description',
              },
            },
          ],
          version: '2.18.0',
        },
        audio_url: 'audioUrl',
        medium_id: 1,
      },
    },
    loading: false,
  },
  media: {
    req: [],
    details: {},
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
};

describe('Episode List component', () => {
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
            <EpisodeList
              actions={['admin']}
              data={info}
              filters={filters}
              setFilters={setFilters}
              fetchEpisodes={fetchEpisodes}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.episodes.loading = true;
      store = mockStore(state);
      const info2 = { ...info };
      info2.loading = true;
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EpisodeList
              actions={['admin']}
              data={info2}
              filters={filters}
              setFilters={setFilters}
              fetchEpisodes={fetchEpisodes}
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
              <EpisodeList
                actions={['admin']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchEpisodes={fetchEpisodes}
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
    it('should delete episode', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EpisodeList
                actions={['admin']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchEpisodes={fetchEpisodes}
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
      expect(deleteEpisode).toHaveBeenCalled();
      expect(deleteEpisode).toHaveBeenCalledWith(1);
    });
    it('should edit episode', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EpisodeList
                actions={['admin']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchEpisodes={fetchEpisodes}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.text()).toEqual('Episode 1');
      expect(link.prop('to')).toEqual('/episodes/1/edit');
    });
    it('should disable edit delete button if no permission', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EpisodeList
                actions={['create']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchEpisodes={fetchEpisodes}
              />
            </Router>
          </Provider>,
        );
      });
      const deleteButton = wrapper.find('Button').at(0);
      expect(deleteButton.props().disabled).toBe(true);
    });
  });
});
