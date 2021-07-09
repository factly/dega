import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import EditEvent from './EditEvent';
import * as actions from '../../actions/events';
import EventEditForm from './components/EventForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

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
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/events', () => ({
  getEvents: jest.fn(),
  addEvent: jest.fn(),
  getEvent: jest.fn(),
  updateEvent: jest.fn(),
}));

let state = {
  events: {
    req: [],
    details: {},
    loading: true,
  },
  spaces: {
    orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11' },
    },
    loading: false,
    selected: 11,
  },
};

describe('Event edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore(state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EditEvent />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      let tree;
      store = mockStore({
        events: {
          req: [],
          details: {},
          loading: true,
        },
        spaces: {
          orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
      });
      act(() => {
        tree = mount(
          <Provider store={store}>
            <Router>
              <EditEvent />
            </Router>
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    state.events = {
      req: [],
      details: {
        1: {
          id: 1,
          name: 'event-1',
        },
      },
      loading: false,
    };
    beforeEach(() => {
      store = mockStore(state);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getEvent.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditEvent />
            </Router>
          </Provider>,
        );
      });
      expect(actions.getEvent).toHaveBeenCalledWith('1');
    });
    it('should call updateEvent', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      actions.updateEvent.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditEvent />
            </Router>
          </Provider>,
        );
      });

      wrapper
        .find(EventEditForm)
        .props()
        .onCreate({ tags: { app: 'dega' } });
      setTimeout(() => {
        expect(actions.updateEvent).toHaveBeenCalledWith({
          id: 1,
          name: 'event-1',
          tags: { app: 'dega' },
        });
        expect(push).toHaveBeenCalledWith('/events/1/edit');
        done();
      }, 0);
    });
    it('should display RecordNotFound if event not found', () => {
      state.events = {
        req: [],
        details: {
          2: {
            id: 2,
            name: 'event-2',
          },
        },
        loading: false,
      };
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditEvent />
            </Router>
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
      expect(wrapper.find(EventEditForm).length).toBe(0);
    });
  });
});
