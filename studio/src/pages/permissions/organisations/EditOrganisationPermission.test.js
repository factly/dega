import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../matchMedia.mock';
import EditOrganisationPermission from './EditOrganisationPermission';
import * as actions from '../../../actions/organisations';
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
  useParams: jest.fn().mockReturnValue({ oid: 1, pid: 1 }),
}));

jest.mock('../../../actions/organisations', () => ({
  getOrganisations: jest.fn(),
  updateOrganisationPermission: jest.fn(),
}));

describe('Organisation Permission Edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    organisations: {
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
          title: 'Super Org',
          slug: 'super-org',
          permission: {
            id: 1,
            organisation_id: 1,
            spaces: 2,
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
    admin: {
      organisation: {
        id: 2,
        spaces: 4,
        is_admin: true,
      },
      loading: false,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <EditOrganisationPermission />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        organisations: {
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
        admin: {
          organisation: {
            id: 2,
            spaces: 4,
            is_admin: true,
          },
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditOrganisationPermission />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        organisations: {
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
        admin: {
          organisation: {
            id: 2,
            spaces: 4,
            is_admin: true,
          },
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditOrganisationPermission />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        organisations: {
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
              title: 'Super Org',
              slug: 'super-org',
              permission: {
                id: 1,
                organisation_id: 1,
                spaces: 2,
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
        admin: {
          organisation: {
            id: 2,
            spaces: 4,
            is_admin: true,
          },
          loading: false,
        },
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getOrganisations.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditOrganisationPermission />
          </Provider>,
        );
      });
      expect(actions.getOrganisations).toHaveBeenCalledWith();
    });
    it('should call updateOrganisationPermission', (done) => {
      actions.updateOrganisationPermission.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditOrganisationPermission />
          </Provider>,
        );
      });
      wrapper.find(EditPermissionForm).props().onCreate({ organisation_id: 9, spaces: 5 });
      setTimeout(() => {
        expect(actions.updateOrganisationPermission).toHaveBeenCalledWith({
          id: 1,
          organisation_id: 9,
          spaces: 5,
        });
        expect(push).toHaveBeenCalledWith('/permissions/organisations');
        done();
      }, 0);
    });
  });
});
