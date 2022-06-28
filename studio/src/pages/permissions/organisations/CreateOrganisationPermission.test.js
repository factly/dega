import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../matchMedia.mock';
import * as actions from '../../../actions/organisations';

import CreateOrganisationPermission from './CreateOrganisationPermission';
import OrganisationPermissionCreateForm from './components/PermissionForm';
import Selector from '../../../components/Selector';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../../components/Selector', () => {
  const Selector = () => <div />;
  return Selector;
});
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../../actions/organisations', () => ({
  addOrganisationPermission: jest.fn(),
}));

describe('Organisation permission create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    spaces: {
      orgs: [],
      details: {},
      loading: true,
      selected: 0,
    },
    organisations: {
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
      const tree = mount(
        <Provider store={store}>
          <CreateOrganisationPermission />
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
    it('should call addOrganisationPermission', (done) => {
      actions.addOrganisationPermission.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateOrganisationPermission />
          </Provider>,
        );
      });
      act(() => {
        wrapper.find(OrganisationPermissionCreateForm).props().onCreate({ test: 'test' });
        wrapper.update();
      });
      setTimeout(() => {
        expect(actions.addOrganisationPermission).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/admin/permissions/organisations');
        done();
      }, 0);
    });
  });
});
