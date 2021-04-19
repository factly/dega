import React from 'react';
import renderer from 'react-test-renderer';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';

import SpacePermission from './index';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../actions/spacePermissions', () => ({
  getSpaces: jest.fn(),
}));

describe('Space Permission component', () => {
  let store;
  let mockedDispatch;
  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    useSelector.mockImplementationOnce(() => ({}));
    const tree = mount(
      <Provider store={store}>
        <SpacePermission />
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data', () => {
    useSelector.mockImplementationOnce(() => ({
      spacePermissions: {
        req: [
          {
            data: [1, 2],
            query: {
              page: 1,
              limit: 5,
            },
            total: 2,
          },
        ],
        details: {
          '1': {
            id: 1,
            name: 'Space 1',
            organisation_id: 9,
            permission: {
              id: 1,
              fact_check: true,
              media: -1,
              posts: -1,  
            }, 
          },
          '2': {
            id: 2,
            name: 'Space 2',
            organisation_id: 4,
            permission: {
              id: 2,
              fact_check: false,
              media: 20,
              posts: 20,  
            }, 
          },
        },
        loading: false,
      },
    }));
    const tree = mount(
      <Provider store={store}>
        <SpacePermission />
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  })
});