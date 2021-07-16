import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateEpisode from './CreateEpisode';
import * as actions from '../../actions/episodes';
import EpisodeCreateForm from './components/EpisodeForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/episodes', () => ({
  getEpisodes: jest.fn(),
  addEpisode: jest.fn(),
}));

describe('Episode create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    episodes: {
      req: [],
      details: {},
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
          <CreateEpisode />
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
    it('should call addEpisode', (done) => {
      actions.addEpisode.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateEpisode />
          </Provider>,
        );
      });
      wrapper.find(EpisodeCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.addEpisode).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/episodes');
        done();
      }, 0);
    });
  });
});
