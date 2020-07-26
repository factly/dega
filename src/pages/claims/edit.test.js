import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import CreateClaim from './create';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Claim Edit Form component', () => {
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
  useDispatch.mockReturnValue(jest.fn());
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
            <CreateClaim />
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
            <CreateClaim />
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
            <CreateClaim />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
});
