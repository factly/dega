import React from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import OrganisationPermission from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../actions/organisations', () => ({
  getOrganisations: jest.fn(),
}));

describe('Organisation Permission component', () => {
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
        <OrganisationPermission />
      </Provider>
    );
    expect(tree).toMatchSnapshot();  
  });
  it('should render the component with data', () => {
    useSelector.mockImplementationOnce(() => ({
      organisation_permissions: [
        {
          id: 1,
          title: 'Super Org',
          slug: 'super-org',
          permission : {
            id : 2,
            organisation_id: 1,
            spaces: 2,
          }
        }
      ],
      total: 1,
      loading: false,
    }));
    const tree = mount(
      <Provider store={store}>
        <OrganisationPermission />
      </Provider>
    );
    expect(tree).toMatchSnapshot();  
  })
});