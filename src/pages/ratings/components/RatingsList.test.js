import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import RatingsList from './RatingsList';
import { getRatings, deleteRating } from '../../../actions/ratings';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/ratings', () => ({
  getRatings: jest.fn(),
}));

describe('Ratings List component', () => {
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
    const tree = renderer.create(<RatingsList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component when loading', () => {
    useSelector.mockImplementation((state) => ({
      ratings: [],
      total: 0,
      loading: true,
    }));
    const tree = renderer.create(<RatingsList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component with ratings', () => {
    useSelector.mockImplementation((state) => ({
      ratings: [{ id: 1, name: 'rating' }],
      total: 1,
      loading: false,
    }));

    let component;
    act(() => {
      component = renderer.create(
        <Router>
          <RatingsList />
        </Router>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(useSelector).toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalledTimes(1);
    expect(useSelector).toHaveReturnedWith({
      ratings: [{ id: 1, name: 'rating' }],
      total: 1,
      loading: false,
    });
    expect(getRatings).toHaveBeenCalledWith({ page: 1 });
  });
});
