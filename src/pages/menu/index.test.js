import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Menu from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../actions/menu', () => ({
  getMenus: jest.fn(),
}));

describe('Menu component', () => {
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
        <Router>
          <Menu/>
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data',() => {
    useSelector.mockImplementationOnce(() => ({
      menu: {
        req: [
          {
            data: [1],
            query: {
              page: 1,
              limit: 5,
            },
            total: 1,
          },
        ],
        details: {
          '1': {
            id: 1,
            name: 'Menu 1',
          }
        },
        loading: false,
      },
    }));
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Menu />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});