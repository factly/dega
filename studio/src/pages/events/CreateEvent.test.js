import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import CreateEvent from './CreateEvent';
import * as actions from '../../actions/events';
import EventCreateForm from './components/EventForm';

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
}));

jest.mock('../../actions/events', () => ({
  getEvents: jest.fn(),
  addEvent: jest.fn(),
}));

describe('Event create component', () => {
  let store;
  let mockedDispatch;
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
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <CreateEvent />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
      tree.unmount();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addEvent', (done) => {
      actions.addEvent.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CreateEvent />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(EventCreateForm).props().onCreate({ id: 1, name: 'test' });
      setTimeout(() => {
        expect(actions.addEvent).toHaveBeenCalledWith({ id: 1, name: 'test' });
        done();
      }, 0);
    });
  });
});
