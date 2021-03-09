import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditClaim from './EditClaim';
import * as actions from '../../actions/claims';
import ClaimEditForm from './components/ClaimForm';

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
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/claims', () => ({
  getClaims: jest.fn(),
  addClaim: jest.fn(),
  getClaim: jest.fn(),
  updateClaim: jest.fn(),
}));
let claims = {
  req: [
    {
      data: [1, 2],
      query: {
        page: 1,
      },
      total: 2,
    },
  ],
  details: {
    '1': {
      id: 1,
      created_at: '2020-07-17T10:14:44.251814Z',
      updated_at: '2020-07-17T10:14:44.251814Z',
      checked_date: '2020-07-17T10:14:44.251814Z',
      claim_date: '2020-07-17T10:14:44.251814Z',
      deleted_at: null,
      name: 'claim-1',
      slug: 'claim-1',
      description: '',
      claimant_id: 1,
      rating_id: 1,
      space_id: 1,
    },
    '2': {
      id: 2,
      created_at: '2020-07-17T10:14:48.173442Z',
      updated_at: '2020-07-17T10:14:48.173442Z',
      checked_date: '2020-07-17T10:14:44.251814Z',
      claim_date: '2020-07-17T10:14:44.251814Z',
      deleted_at: null,
      name: 'claim-2',
      slug: 'claim-2',
      description: '',
      claimant_id: 1,
      rating_id: 1,
      space_id: 1,
    },
  },
  loading: false,
};
let spaces = {
  orgs: [
    {
      id: 1,
      title: 'TOI',
      spaces: [1],
    },
  ],
  details: {
    1: {
      id: 1,
      name: 'English',
      site_address: 'site_address',
      site_title: 'site_title',
      tag_line: 'tag_line',
    },
  },
  selected: 1,
};
let state = {
  claims: claims,
  spaces: spaces,
  media: {
    req: [],
    details: {},
    loading: true,
  },
  ratings: {
    req: [],
    details: {},
    loading: true,
  },
  claimants: {
    req: [],
    details: {},
    loading: true,
  },
};

describe('Claims Edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore(state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EditClaim />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      let tree;
      state.claims = {
        req: [],
        details: {},
        loading: false,
      };
      store = mockStore(state);
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EditClaim data={{}} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      let tree;
      state.claims = {
        req: [],
        details: {},
        loading: true,
      };
      store = mockStore(state);
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EditClaim />
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
        claims: claims,
        media: {
          req: [],
          details: {},
          loading: true,
        },
        spaces: spaces,
        ratings: {
          req: [],
          details: {},
          loading: true,
        },
        claimants: {
          req: [],
          details: {},
          loading: true,
        },
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getClaim.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditClaim />
          </Provider>,
        );
      });
      expect(actions.getClaim).toHaveBeenCalledWith('1');
    });
    it('should call updateClaim', (done) => {
      actions.updateClaim.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditClaim />
          </Provider>,
        );
      });
      wrapper.find(ClaimEditForm).props().onCreate({
        id: 1,
        created_at: '2020-07-17T10:14:44.251814Z',
        updated_at: '2020-07-17T10:14:44.251814Z',
        checked_date: '2020-07-17T10:14:44.251814Z',
        claim_date: '2020-07-17T10:14:44.251814Z',
        deleted_at: null,
        name: 'claim-1',
        slug: 'claim-1',
        description: '',
        claimant_id: 1,
        rating_id: 1,
        space_id: 1,
      });
      setTimeout(() => {
        expect(actions.updateClaim).toHaveBeenCalledWith({
          id: 1,
          created_at: '2020-07-17T10:14:44.251814Z',
          updated_at: '2020-07-17T10:14:44.251814Z',
          checked_date: '2020-07-17T10:14:44.251814Z',
          claim_date: '2020-07-17T10:14:44.251814Z',
          deleted_at: null,
          name: 'claim-1',
          slug: 'claim-1',
          description: '',
          claimant_id: 1,
          rating_id: 1,
          space_id: 1,
        });
        expect(push).toHaveBeenCalledWith('/claims');
        done();
      }, 0);
    });
  });
});
