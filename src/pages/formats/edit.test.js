import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import EditFormat from './edit';

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

jest.mock('../../actions/formats', () => ({
  getFormat: jest.fn(),
  addFormat: jest.fn(),
}));

describe('Formats List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({
      formats: {
        req: [],
        details: {
          '1': {
            id: 1,
            name: 'Article',
            slug: 'article',
            description: 'description',
          },
          '2': {
            id: 2,
            name: 'Factcheck',
            slug: 'factcheck',
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
      format: {
        id: 1,
        name: 'Article',
        slug: 'article',
        description: 'description',
      },
      loading: true,
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <EditFormat />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match component with empty data', () => {
    useSelector.mockReturnValueOnce({
      format: {},
      loading: false,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditFormat />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match skeleton while loading', () => {
    useSelector.mockReturnValueOnce({
      format: {},
      loading: true,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditFormat />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
