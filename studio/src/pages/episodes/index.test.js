import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Episode from './index';
import { getEpisodes } from '../../actions/episodes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('../../actions/episodes', () => ({
  getEpisodes: jest.fn(),
}));
let state = {
  episodes: {
    req: [
      {
        data: [1],
        query: {},
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
      11: {
        id: 11,
        name: 'Space 11',
        permissions: [{ resource: 'episodes', actions: ['get', 'create'] }],
      },
    },
    loading: false,
    selected: 11,
  },
};
describe('Episode Component', () => {
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
      let state2 = {
        episodes: {
          req: [],
          details: {},
          loading: false,
        },
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: {
              id: 11,
              name: 'Space 11',
              permissions: [{ resource: 'episodes', actions: ['get', 'create'] }],
            },
          },
          loading: false,
          selected: 11,
        },
      };
      store = mockStore(state2);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Episode
              permission={{
                actions: ['admin'],
              }}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Episode
              permission={{
                actions: ['admin'],
              }}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getEpisodes).toBeCalledWith({});
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should handle url search params', () => {
      let wrapper;
      window.history.pushState({}, '', '/episodes?limit=20&page=1&q=desc');
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Episode permission={{ actions: ['create'] }} />
            </Router>
          </Provider>,
        );
      });
      expect(getEpisodes).toHaveBeenCalledWith({ page: '1', limit: '20', q: 'desc' });
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Episode permission={{ actions: ['admin'] }} />
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
          .at(2)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: '' } });

        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getEpisodes).toHaveBeenCalledWith({
          page: 1,
          limit: 5,
          q: 'episode',
          sort: '',
        });
      }, 0);
    });
  });
});
