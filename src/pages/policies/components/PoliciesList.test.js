import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import PoliciesList from './PoliciesList';
import { getPolicies, deletePolicy } from '../../../actions/policies';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/policies', () => ({
  getPolicies: jest.fn(),
}));

describe('Policies List component', () => {
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
    const tree = renderer.create(<PoliciesList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component when loading', () => {
    useSelector.mockImplementation((state) => ({
      policies: [],
      total: 0,
      loading: true,
    }));
    const tree = renderer.create(<PoliciesList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component with policies', () => {
    useSelector.mockImplementation((state) => ({
      policies: [{ id: 1, name: 'policy' }],
      total: 1,
      loading: false,
    }));

    let component;
    act(() => {
      component = renderer.create(
        <Router>
          <PoliciesList />
        </Router>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(useSelector).toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalledTimes(1);
    expect(useSelector).toHaveReturnedWith({
      policies: [{ id: 1, name: 'policy' }],
      total: 1,
      loading: false,
    });
    expect(getPolicies).toHaveBeenCalledWith({ page: 1 });
  });
});
