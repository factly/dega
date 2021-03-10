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

let state = {
  episodes: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
          limit: 5,
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
            <EpisodeList actions={['admin']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.episodes.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EpisodeList actions={['admin']} />
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
              <EpisodeList actions={['admin']} />
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
    it('should delete episode', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EpisodeList actions={['admin']} />
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
      expect(deleteEpisode).toHaveBeenCalled();
      expect(deleteEpisode).toHaveBeenCalledWith(1);
      expect(getEpisodes).toHaveBeenCalledWith({ page: 1, limit: 5 });
    });
    it('should edit episode', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EpisodeList actions={['admin']} />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/episodes/1/edit');
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EpisodeList actions={['admin']} />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'episode' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'desc' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getEpisodes).toHaveBeenCalledWith({
          page: 1,
          limit: 5,
          q: 'episode',
          sort: 'desc',
        });
      }, 0);
    });
    it('should disable edit delete button if no permission', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EpisodeList actions={['create']} />
            </Router>
          </Provider>,
        );
      });
      const editButton = wrapper.find('Button').at(1);
      const deleteButton = wrapper.find('Button').at(2);
      expect(editButton.props().disabled).toBe(true);
      expect(deleteButton.props().disabled).toBe(true);
    });
  });
});
