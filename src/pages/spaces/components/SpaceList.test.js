import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import SpaceList from './SpaceList';
import { getSpaces, deleteSpace } from '../../../actions/spaces';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/spaces', () => ({
  getSpaces: jest.fn(),
}));

describe('Spaces List component', () => {
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
    const tree = renderer.create(<SpaceList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component when loading', () => {
    useSelector.mockImplementation((state) => ({
      spaces: [],
      loading: true,
    }));
    const tree = renderer.create(<SpaceList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component with spaces', () => {
    useSelector.mockImplementation((state) => ({
      spaces: [{ id: 1, name: 'space' }],
      loading: false,
    }));

    let component;
    act(() => {
      component = renderer.create(
        <Router>
          <SpaceList />
        </Router>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(useSelector).toHaveBeenCalled();
    expect(useSelector).toHaveReturnedWith({
      spaces: [{ id: 1, name: 'space' }],
      loading: false,
    });
  });
});
