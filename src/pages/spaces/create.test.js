import React from 'react';
import { useHistory } from 'react-router-dom';
import renderer, { act as rendererAct } from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateSpace from './create';
import * as actions from '../../actions/spaces';
import SpaceCreateForm from './components/SpaceCreateForm';

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

jest.mock('../../actions/spaces', () => ({
  getSpaces: jest.fn(),
  addSpace: jest.fn(),
}));

describe('Spaces create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    spaces: {
      orgs: [],
      details: {},
      loading: true,
      selected: 0,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <CreateSpace />
          </Provider>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
      rendererAct(() => component.unmount());
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addSpace', (done) => {
      actions.addSpace.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateSpace />
          </Provider>,
        );
      });
      act(() => {
        wrapper.find(SpaceCreateForm).props().onCreate({ test: 'test' });
        wrapper.update();
      });
      setTimeout(() => {
        expect(actions.addSpace).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/spaces');
        done();
      }, 0);
    });
  });
});
