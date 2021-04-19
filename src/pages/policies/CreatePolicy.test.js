import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreatePolicy from './CreatePolicy';
import * as actions from '../../actions/policies';
import PolicyCreateForm from './components/PolicyForm';

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

jest.mock('../../actions/policies', () => ({
  addPolicy: jest.fn(),
}));

describe('Policies create component', () => {
  let store;
  store = mockStore({
    policies: {
      req: [],
      details: {},
      loading: false,
    },
    authors: {
      req: [{ query: { page: 1, limit: 5 }, total: 1, data: [1] }],
      details: { 1: { id: 1, name: 'Author', email: 'author@aut.co' } },
      loading: false,
    },
  });
  const mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <CreatePolicy />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      tree.unmount();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addPolicy', (done) => {
      actions.addPolicy.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreatePolicy />
          </Provider>,
        );
      });
      wrapper.find(PolicyCreateForm).props().onCreate({ users: [], permissions: [] });
      setTimeout(() => {
        expect(actions.addPolicy).toHaveBeenCalledWith({ permissions: [], users: [] });
        expect(push).toHaveBeenCalledWith('/policies');
        done();
      }, 0);
    });
    it('should call addPolicy with some permissions', (done) => {
      actions.addPolicy.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreatePolicy />
          </Provider>,
        );
      });
      wrapper.find(PolicyCreateForm).props().onCreate({ users: [], permissions: [{resource: "posts", actions: ["create", "update"]}] });
      setTimeout(() => {
        expect(actions.addPolicy).toHaveBeenCalledWith({ permissions: [{resource: "posts", actions: ["create", "update"]}], users: [] });
        expect(push).toHaveBeenCalledWith('/policies');
        done();
      }, 0);
    });
  });
});
