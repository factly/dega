import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditClaim from './edit';
import * as actions from '../../actions/claims';
import ClaimCreateForm from './components/ClaimCreateForm';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/claims', () => ({
  getClaim: jest.fn(),
  updateClaim: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Claim Edit component', () => {
  store = mockStore({
    claims: {
      req: [],
      details: {},
      loading: true,
    },
    claimants: {
      req: [],
      details: {},
      loading: true,
    },
    rating: {
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
  const mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  useSelector.mockImplementation((state) => ({ details: [], total: 0, loading: false }));

  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
    });
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = shallow(
          <Provider store={store}>
            <EditClaim />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      let component;
      act(() => {
        component = shallow(
          <Provider store={store}>
            <EditClaim />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      let component;
      store = mockStore({
        claims: {
          req: [],
          details: {},
          loading: false,
        },
        claimants: {
          req: [],
          details: {},
          loading: true,
        },
        rating: {
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
      act(() => {
        component = shallow(
          <Provider store={store}>
            <EditClaim />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
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
      wrapper.find(ClaimCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateClaim).toHaveBeenCalledWith({
          test: 'test',
        });
        expect(push).toHaveBeenCalledWith('/claims');
        done();
      }, 0);
    });
  });
});
