import React from 'react';
import { Provider } from 'react-redux';
import { useLocation } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import { shallow } from 'enzyme';
import PageHeader from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn().mockReturnValue({
    pathname: '/another-route',
    search: '',
    hash: '',
    state: null,
    key: '5nvxpbdafa',
  }),
}));

useLocation.mockReturnValue(jest.fn(() => ({})));

describe('Account Menu component', () => {
  it('should render the component', () => {
    let store = mockStore({});
    let component = shallow(
      <Provider store={store}>
        <PageHeader />
      </Provider>,
    );
    expect(component).toMatchSnapshot();
  });
});
