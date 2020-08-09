import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditSpace from './edit';
import * as actions from '../../actions/spaces';
import SpaceEditForm from './components/SpaceEditForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/spaces', () => ({
  getSpaces: jest.fn(),
  getSpace: jest.fn(),
  addSpace: jest.fn(),
  updateSpace: jest.fn(),
}));

describe('Spaces Edit component', () => {
  let store;
  store = mockStore({
    spaces: {
      orgs: [],
      details: {},
      loading: true,
      selected: 0,
    },
    claims: {
      req: [],
      details: {},
      loading: false,
    },
    claimants: {
      req: [],
      details: {},
      loading: false,
    },
    rating: {
      req: [],
      details: {},
      loading: false,
    },
    media: {
      req: [],
      details: {},
      loading: false,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  const mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should match skeleton while loading', () => {
      let tree;
      store = mockStore({
        spaces: {
          orgs: [],
          details: {},
          loading: true,
          selected: 0,
        },
      });
      act(() => {
        tree = shallow(
          <Provider store={store}>
            <EditSpace />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      let tree;
      store = mockStore({
        spaces: {
          orgs: [],
          details: {},
          loading: true,
          selected: 0,
        },
      });
      act(() => {
        tree = shallow(
          <Provider store={store}>
            <EditSpace />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        spaces: {
          orgs: [
            { id: 1, organazation: 'Organization 1', spaces: [11] },
            { id: 2, organazation: 'Organization 2', spaces: [21, 22] },
          ],
          details: {
            11: {
              organisation_id: 1,
              name: 'name',
              slug: 'slug',
              site_title: 'site_title',
              tag_line: 'tag_line',
              description: 'description',
              site_address: 'site_address',
              logo_id: 1,
              logo_mobile_id: 1,
              fav_icon_id: 1,
              mobile_icon_id: 1,
              social_media_urls: {
                facebook: 'fb.com',
                twitetr: 'twitter.com',
                pintrest: 'pinterest.com',
                instagram: 'instagram.com',
              },
            },
          },
          loading: false,
          selected: 11,
        },
        claims: {
          req: [],
          details: {},
          loading: false,
        },
        claimants: {
          req: [],
          details: {},
          loading: false,
        },
        rating: {
          req: [],
          details: {},
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call updateSpace', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      actions.updateSpace.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditSpace />
          </Provider>,
        );
      });
      wrapper.find(SpaceEditForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateSpace).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/spaces');
        done();
      }, 0);
    });
  });
});
