import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import EditRating from './edit';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/ratings', () => ({
  getRating: jest.fn(),
  addRating: jest.fn(),
}));

describe('Ratings List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({
      ratings: {
        req: [],
        details: {
          '1': {
            id: 1,
            name: 'True',
            slug: 'true',
            description: 'description',
            numeric_value: 5,
          },
          '2': {
            id: 2,
            name: 'False',
            slug: 'false',
            description: 'description',
            numeric_value: 5,
          },
        },
        loading: true,
      },
      media: {
        req: [],
        details: {},
        loading: true,
      },
    });
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    useSelector.mockReturnValueOnce({
      rating: {
        id: 1,
        name: 'True',
        slug: 'true',
        description: 'description',
        numeric_value: 5,
      },
      loading: false,
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <EditRating />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match component with empty data', () => {
    useSelector.mockReturnValueOnce({
      rating: {},
      loading: false,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditRating />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match skeleton while loading', () => {
    useSelector.mockReturnValueOnce({
      rating: {},
      loading: true,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditRating />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
