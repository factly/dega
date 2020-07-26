import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';

import '../../matchMedia.mock';
import EditClaimant from './edit';

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

jest.mock('../../actions/claimants', () => ({
  addClaimant: jest.fn(),
  getClaimant: jest.fn(),
  updateClaimant: jest.fn(),
}));

describe('Claimants List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({
      claimants: {
        req: [
          {
            data: [1, 2],
            query: {
              page: 1,
            },
            total: 2,
          },
        ],
        details: {
          '1': {
            id: 1,
            name: 'TOI',
            slug: 'toi',
            description: 'description',
            tag_line: 'tag line',
            claimant_date: '2017-12-12',
          },
          '2': {
            id: 2,
            name: 'CNN',
            slug: 'cnn',
            description: 'description',
            tag_line: 'tag line',
            claimant_date: '2017-12-12',
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
      claimant: {
        id: 1,
        name: 'TOI',
        slug: 'toi',
        description: 'description',
        tag_line: 'tag line',
        claimant_date: '2017-12-12',
      },
      loading: false,
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <EditClaimant />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match component with empty data', () => {
    useSelector.mockReturnValueOnce({
      claimant: {},
      loading: false,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditClaimant />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match skeleton while loading', () => {
    useSelector.mockReturnValueOnce({
      claimant: {},
      loading: true,
    });
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditClaimant />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
