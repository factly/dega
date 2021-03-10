import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Episode from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

describe('Episode Component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    useSelector.mockImplementationOnce(() => ({}));
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
    useSelector.mockImplementationOnce(() => ({
      episodes: [
        {
          title: 'Episode 1',
          slug: 'episode-1',
          season: 1,
          episode: 1,
          type: 'full',
          audio_url: 'audioUrl',
          medium_id: 1,
        },
      ],
      total: 1,
      loading: false,
    }));
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
});
