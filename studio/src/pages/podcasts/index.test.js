import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Podcast from './index';
import { getPodcasts } from '../../actions/podcasts';

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

jest.mock('../../actions/podcasts', () => ({
  getPodcasts: jest.fn(),
  addPodcast: jest.fn(),
}));

let state = {
  podcasts: {
    req: [
      {
        data: [1, 2],
        query: {},
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
      11: {
        id: 11,
        name: 'Space 11',
        permissions: [{ resource: 'podcasts', actions: ['get', 'create'] }],
      },
    },
    loading: false,
    selected: 11,
  },
  categories: {
    req: [],
    details: {},
    loading: false,
  },
};

describe('Podcast component', () => {
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
        podcasts: {
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
              permissions: [{ resource: 'podcasts', actions: ['get', 'create'] }],
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
            <Podcast
              permission={{
                actions: ['get', 'create'],
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
            <Podcast
              permission={{
                actions: ['admin'],
              }}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getPodcasts).toHaveBeenCalledWith({});
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
      window.history.pushState({}, '', '/podcasts?limit=20&page=1&q=desc');
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Podcast permission={{ actions: ['admin'] }} />
            </Router>
          </Provider>,
        );
      });
      expect(getPodcasts).toHaveBeenCalledWith({ page: 1, limit: 20, q: 'desc' });
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Podcast
                permission={{
                  actions: ['admin'],
                }}
              />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'podcast' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: '' } });

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Search');
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getPodcasts).toHaveBeenCalledWith({
          page: 1,
          limit: 5,
          q: 'podcast',
          sort: '',
        });
      }, 0);
    });
  });
});
