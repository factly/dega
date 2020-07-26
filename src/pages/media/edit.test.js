import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import EditMedia from './edit';

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

jest.mock('../../actions/media', () => ({
  addMedium: jest.fn(),
  getMedium: jest.fn(),
  updateMedium: jest.fn(),
}));

describe('Media List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({
      media: {
        req: [
          {
            data: [1],
            query: {
              page: 1,
            },
            total: 1,
          },
        ],
        details: {
          '1': {
            id: 1,
            name: 'name',
            url: 'some-url',
            file_size: 'file_size',
            caption: 'caption',
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
      media: {
        id: 1,
        name: 'name',
        url: 'some-url',
        file_size: 'file_size',
        caption: 'caption',
        description: 'description',
      },
      loading: false,
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <EditMedia />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match component with empty data', () => {
    useSelector.mockReturnValueOnce({
      media: {},
      loading: false,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditMedia />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match skeleton while loading', () => {
    useSelector.mockReturnValueOnce({
      media: {},
      loading: true,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditMedia />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
