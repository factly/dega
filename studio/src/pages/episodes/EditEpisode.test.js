import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditEpisode from './EditEpisode';
import * as actions from '../../actions/episodes';
import EditEpisodeForm from './components/EpisodeForm';

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

jest.mock('../../actions/episodes', () => ({
  getEpisode: jest.fn(),
  updateEpisode: jest.fn(),
}));

describe('Episode Edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
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
          podcast: [1],
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
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <EditEpisode />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        episodes: {
          req: [],
          details: {},
          loading: false,
        },
        podcasts: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditEpisode />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        episodes: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditEpisode />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
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
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getEpisode.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditEpisode />
          </Provider>,
        );
      });
      expect(actions.getEpisode).toHaveBeenCalledWith('1');
    });
    it('should call updateEpisode', (done) => {
      actions.updateEpisode.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditEpisode />
          </Provider>,
        );
      });
      wrapper.find(EditEpisodeForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateEpisode).toHaveBeenCalledWith({
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
          test: 'test',
        });
        expect(push).toHaveBeenCalledWith('/episodes/1/edit');
        done();
      }, 0);
    });
  });
});
