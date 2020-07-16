import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer, { act } from 'react-test-renderer';
import { useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import FormatsList from './FormatsList';
import { getFormats, deleteFormat } from '../../../actions/formats';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/formats', () => ({
  getFormats: jest.fn(),
}));

describe('Formats List component', () => {
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
    const tree = renderer.create(<FormatsList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component when loading', () => {
    useSelector.mockImplementation((state) => ({
      formats: [],
      total: 0,
      loading: true,
    }));
    const tree = renderer.create(<FormatsList />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(useSelector).toHaveBeenCalled();
  });
  it('should match component with formats', () => {
    useSelector.mockImplementation((state) => ({
      formats: [{ id: 1, name: 'format' }],
      total: 1,
      loading: false,
    }));

    let component;
    act(() => {
      component = renderer.create(
        <Router>
          <FormatsList />
        </Router>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(useSelector).toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalledTimes(1);
    expect(useSelector).toHaveReturnedWith({
      formats: [{ id: 1, name: 'format' }],
      total: 1,
      loading: false,
    });
    expect(getFormats).toHaveBeenCalledWith({ page: 1 });
  });
});
