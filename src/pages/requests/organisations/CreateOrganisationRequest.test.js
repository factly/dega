import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../matchMedia.mock';
import CreateOrganisationRequest from './CreateOrganisationRequest';
import * as actions from '../../../actions/organisationRequests'
import CreateOrganisationRequestForm from './components/RequestForm';

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
jest.mock('../../../actions/organisationRequests', () => ({
  addOrganisationRequest: jest.fn(),
}));

describe('Organisation Request create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    organisationRequests: {
      req : [
        {
          data: [1],
          query: {
            page: 1,
          },
          total: 1,
        },
      ],
      details: {
        '1' : {
          id: 1,
          title: 'Request',
          spaces: 4,
          organisation_id: 10,
          status: 'pending',
        },
      },
      loading: false,
    },
    spaces: {
      orgs: [],
      details: {},
      loading: true,
    }
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <CreateOrganisationRequest />
        </Provider>
      );
      expect(tree).toMatchSnapshot();  
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addCreateOrganisationRequest', (done) => {
      actions.addOrganisationRequest.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateOrganisationRequest />
          </Provider>,
        );
      });
      wrapper.find(CreateOrganisationRequestForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.addOrganisationRequest).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/requests/organisations');
        done();
      }, 0);
    });
  });
})

