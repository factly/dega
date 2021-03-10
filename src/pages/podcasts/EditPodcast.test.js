import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditPodcast from './EditPodcast';
import * as actions from '../../actions/podcasts';
import EditPodcastForm from './components/PodcastForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/podcasts', () => ({
  getPodcasts: jest.fn(),
  addPodcast: jest.fn(),
  getPodcast: jest.fn(),
  updatePodcast: jest.fn(),
}));

describe('Podcast Edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    podcasts: {
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
          title: 'Podcast-1',
          slug: 'podcast-1',
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
      details: {},
      loading: true,
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
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <EditPodcast />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        podcasts: {
          req: [],
          details: {},
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditPodcast />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        podcasts: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditPodcast />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        podcasts: {
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
              title: 'Podcast-1',
              slug: 'podcast-1',
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
          details: {},
          loading: true,
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
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getPodcast.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditPodcast />
          </Provider>,
        );
      });
      expect(actions.getPodcast).toHaveBeenCalledWith('1');
    });
    it('should call updatePodcast', (done) => {
      actions.updatePodcast.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditPodcast />
          </Provider>,
        );
      });
      wrapper.find(EditPodcastForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updatePodcast).toHaveBeenCalledWith({
          id: 1,
          title: 'Podcast-1',
          slug: 'podcast-1',
          medium_id: 1,
          language: 'english',
          categories: [1],
          episodes: [1],
          test: 'test',
        });
        expect(push).toHaveBeenCalledWith('/podcasts');
        done();
      }, 0);
    });
  });
});
