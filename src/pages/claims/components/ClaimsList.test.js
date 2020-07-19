import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import ClaimsList from './ClaimsList';
import { getClaims, deleteClaim } from '../../../actions/claims';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/claims', () => ({
  getClaims: jest.fn(),
}));

describe('Claims List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn();
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    useSelector.mockImplementation((state) => ({}));
    const tree = renderer.create(<ClaimsList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component when loading', () => {
    useSelector.mockImplementation((state) => ({
      claims: [],
      total: 0,
      loading: true,
    }));
    const tree = renderer.create(<ClaimsList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component with claims', () => {
    useSelector.mockImplementation((state) => ({
      claims: [{ id: 1, name: 'claim' }],
      total: 1,
      loading: false,
    }));

    let component;
    act(() => {
      component = renderer.create(
        <Router>
          <ClaimsList />
        </Router>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(useSelector).toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalledTimes(1);
    expect(useSelector).toHaveReturnedWith({
      claims: [{ id: 1, name: 'claim' }],
      total: 1,
      loading: false,
    });
    expect(getClaims).toHaveBeenCalledWith({ page: 1 });
  });
});
