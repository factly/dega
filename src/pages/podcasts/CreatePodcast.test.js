import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreatePodcast from './CreatePodcast';
import * as actions from '../../actions/podcasts';
import PodcastCreateForm from './components/PodcastForm';

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
}));

jest.mock('../../actions/podcasts', () => ({
  getPodcasts: jest.fn(),
  addPodcast: jest.fn(),
}));

describe('Podcast create component', () => {
  let store;
  let mockedDispatch;

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
          <CreatePodcast />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addPodcast', (done) => {
      actions.addPodcast.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreatePodcast />
          </Provider>,
        );
      });
      wrapper.find(PodcastCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.addPodcast).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/podcasts');
        done();
      }, 0);
    });
  });
});
