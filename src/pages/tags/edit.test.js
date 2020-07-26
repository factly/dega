import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import EditTag from './edit';

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

jest.mock('../../actions/tags', () => ({
  getTag: jest.fn(),
  addTag: jest.fn(),
  updateTag: jest.fn(),
}));

describe('Tags List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({
      tags: {
        req: [],
        details: {
          '1': {
            id: 1,
            name: 'Tag-1',
            slug: 'tag-1',
            description: 'description',
          },
          '2': {
            id: 2,
            name: 'Tag-2',
            slug: 'tag-2',
            description: 'description',
          },
        },
        loading: true,
      },
    });
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    useSelector.mockReturnValueOnce({
      tag: {
        id: 1,
        name: 'tag',
        slug: 'slug',
        description: 'description',
      },
      loading: false,
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <EditTag />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match component with empty data', () => {
    useSelector.mockReturnValueOnce({
      tag: {},
      loading: false,
    });
    let component;
    store.details = {};
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditTag />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match skeleton while loading', () => {
    useSelector.mockReturnValueOnce({
      tag: {},
      loading: true,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditTag />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
