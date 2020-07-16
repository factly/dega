import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import CategoriesList from './CategoriesList';
import { getCategories, deleteCategory } from '../../../actions/categories';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/categories', () => ({
  getCategories: jest.fn(),
}));

describe('Categories List component', () => {
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
    const tree = renderer.create(<CategoriesList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component when loading', () => {
    useSelector.mockImplementation((state) => ({
      categories: [],
      total: 0,
      loading: true,
    }));
    const tree = renderer.create(<CategoriesList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component with categories', () => {
    useSelector.mockImplementation((state) => ({
      categories: [{ id: 1, name: 'category' }],
      total: 1,
      loading: false,
    }));

    let component;
    act(() => {
      component = renderer.create(
        <Router>
          <CategoriesList />
        </Router>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(useSelector).toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalledTimes(1);
    expect(useSelector).toHaveReturnedWith({
      categories: [{ id: 1, name: 'category' }],
      total: 1,
      loading: false,
    });
    expect(getCategories).toHaveBeenCalledWith({ page: 1 });
  });
});
