import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import UserList from './index';
import { mount, shallow } from 'enzyme';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const users = [
  {
    id: 1,
    created_at: '2020-09-23T11:06:11.308302Z',
    updated_at: '2020-09-23T11:36:09.244259Z',
    deleted_at: null,
    email: 'ross.geller@gmail.com',
    first_name: 'Ross',
    last_name: 'Geller',
    birth_date: '1991-12-23T17:05:55+05:30',
    gender: 'male',
    policies: [
      {
        id: 'Editor',
        name: 'Editor',
        description: '',
      },
      {
        id: 'Test',
        name: 'Test',
        description: '',
      },
    ],
  },
  {
    id: 1,
    created_at: '2020-09-23T11:06:11.308302Z',
    updated_at: '2020-09-23T11:36:09.244259Z',
    deleted_at: null,
    email: 'chandler@gmail.com',
    first_name: 'Chandler',
    last_name: 'Bing',
    birth_date: '1991-12-23T17:05:55+05:30',
    gender: 'male',
    policies: [
      {
        id: 'admin',
        name: 'admin',
        description: '',
      },
    ],
  },
];

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/users', () => ({
  getUsers: jest.fn(),
}));

describe('Tags List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn();
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    store = mockStore({
      users: {
        loading: true,
      },
    });
    const tree = shallow(
      <Provider store={store}>
        <Router>
          <UserList />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data', () => {
    store = mockStore({
      users: {
        req: [],
        details: users,
        loading: false,
      },
    });
    const tree = mount(
      <Provider store={store}>
        <Router>
          <UserList />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();

    expect(mockedDispatch).toHaveBeenCalledTimes(1);
  });
});
