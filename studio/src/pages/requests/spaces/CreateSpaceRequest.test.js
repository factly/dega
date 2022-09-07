import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../matchMedia.mock';
import CreateSpaceRequest from './CreateSpaceRequest';
import * as actions from '../../../actions/spaceRequests';
import CreateSpaceRequestForm from './components/RequestForm';

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
jest.mock('../../../actions/spaceRequests', () => ({
  addSpaceRequest: jest.fn(),
}));

describe('Space Request create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    spaceRequests: {
      req: [
        {
          data: [1, 2],
          query: {
            page: 1,
            limit: 5,
          },
          total: 2,
        },
      ],
      details: {
        '1': {
          id: 1,
          title: 'Request 1',
          description: 'Description',
          status: 'pending',
          media: -1,
          posts: -1,
          fact_check: true,
          space_id: 1,
        },
        '2': {
          id: 2,
          title: 'Request 2',
          description: 'Description',
          status: 'pending',
          media: 5,
          posts: 5,
          fact_check: false,
          space_id: 2,
        },
      },
      loading: false,
    },
    spaces: {
      orgs: [],
      details: {},
      loading: true,
    },
    admin: {
      loading: false,
      organisation: {
        id: 1,
        is_admin: true,
      },
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <CreateSpaceRequest />
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
    it('should call addCreateSpaceRequests', (done) => {
      actions.addSpaceRequest.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateSpaceRequest />
          </Provider>,
        );
      });
      wrapper.find(CreateSpaceRequestForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.addSpaceRequest).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/admin/requests/spaces');
        done();
      }, 0);
    });
  });
});
