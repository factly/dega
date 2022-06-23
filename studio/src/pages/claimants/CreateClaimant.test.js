import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateClaimant from './CreateClaimant';
import * as actions from '../../actions/claimants';
import ClaimantCreateForm from './components/ClaimantForm';

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

jest.mock('../../actions/claimants', () => ({
  getClaimants: jest.fn(),
  createCategory: jest.fn(),
  createClaimant: jest.fn(),
}));

describe('Claimants create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    claimants: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
      req: [],
      details: {},
      loading: true,
    },
    spaces: {
      orgs: [],
      details: { 1: { site_address: '' } },
      selected: 1,
      loading: true,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <CreateClaimant />
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
    it('should call createCategory', (done) => {
      actions.createCategory.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateClaimant />
          </Provider>,
        );
      });
      wrapper.find(ClaimantCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.createClaimant).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/claimants');
        done();
      }, 0);
    });
  });
});
