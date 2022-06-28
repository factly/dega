import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../matchMedia.mock';
import EditSpacePermission from './EditSpacePermission';
import * as actions from '../../../actions/spacePermissions';
import EditPermissionForm from './components/PermissionForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ sid: 1, pid: 1 }),
}));

jest.mock('../../../actions/spacePermissions', () => ({
  getSpaces: jest.fn(),
  updateSpacePermission: jest.fn(),
}));

describe('Space Permission Edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    spacePermissions: {
      req: [
        {
          data: [1],
          query: {
            page: 1,
            limit: 20,
          },
          total: 1,
        },
      ],
      details: {
        1: {
          id: 1,
          name: 'Space 1',
          organisation_id: 4,
          permission: {
            id: 2,
            fact_check: false,
            media: 20,
            posts: 20,
          },
        },
      },
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
          <EditSpacePermission />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        spacePermissions: {
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
      const tree = mount(
        <Provider store={store}>
          <EditSpacePermission />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        spacePermissions: {
          req: [],
          details: {},
          loading: true,
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
      const tree = mount(
        <Provider store={store}>
          <EditSpacePermission />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        spacePermissions: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
                limit: 20,
              },
              total: 1,
            },
          ],
          details: {
            1: {
              id: 1,
              name: 'Space 1',
              organisation_id: 4,
              permission: {
                id: 2,
                fact_check: false,
                media: 20,
                posts: 20,
              },
            },
          },
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
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getSpaces.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditSpacePermission />
          </Provider>,
        );
      });
      expect(actions.getSpaces).toHaveBeenCalledWith();
    });
    it('should call updateOrganisationPermission', (done) => {
      actions.updateSpacePermission.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditSpacePermission />
          </Provider>,
        );
      });
      wrapper
        .find(EditPermissionForm)
        .props()
        .onCreate({ fact_check: false, media: 10, posts: 10 });
      setTimeout(() => {
        expect(actions.updateSpacePermission).toHaveBeenCalledWith({
          id: 2,
          fact_check: false,
          media: 10,
          posts: 10,
        });
        expect(push).toHaveBeenCalledWith('/admin/permissions/spaces');
        done();
      }, 0);
    });
  });
});
