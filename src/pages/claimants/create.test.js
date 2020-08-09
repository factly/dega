import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateClaimant from './create';
import * as actions from '../../actions/claimants';
import ClaimantCreateForm from './components/ClaimantCreateForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

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
  addClaimant: jest.fn(),
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
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = renderer
        .create(
          <Provider store={store}>
            <CreateClaimant />
          </Provider>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addClaimant', (done) => {
      actions.addClaimant.mockReset();
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
        expect(actions.addClaimant).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/claimants');
        done();
      }, 0);
    });
  });
});
