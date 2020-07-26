import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import EditSpace from './edit';
import { shallow } from 'enzyme';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/spaces', () => ({
  getSpaces: jest.fn(),
  addSpace: jest.fn(),
}));

describe('Spaces Edit component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({
      spaces: {
        orgs: [],
        details: {},
        loading: true,
        selected: 0,
      },
    });
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should match skeleton while loading', () => {
    let tree;
    store = mockStore({
      spaces: {
        orgs: [],
        details: {},
        loading: true,
        selected: 0,
      },
    });
    act(() => {
      tree = shallow(
        <Provider store={store}>
          <EditSpace />
        </Provider>,
      );
    });
    expect(tree).toMatchSnapshot();
  });
  it('should match skeleton while loading', () => {
    let tree;
    store = mockStore({
      spaces: {
        orgs: [],
        details: {},
        loading: true,
        selected: 0,
      },
    });
    act(() => {
      tree = shallow(
        <Provider store={store}>
          <EditSpace />
        </Provider>,
      );
    });
    expect(tree).toMatchSnapshot();
  });
});
