import React from 'react';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import UppyUploader from './index';
import { mount } from 'enzyme';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/media', () => ({
  getMedium: jest.fn(),
}));
let state = {
  spaces: {
    orgs: [
      {
        id: 1,
        title: 'TOI',
        spaces: [1],
      },
    ],
    details: {
      1: {
        id: 1,
        name: 'English',
        site_address: 'site_address',
        site_title: 'site_title',
        tag_line: 'tag_line',
      },
    },
    selected: 1,
  },
};

describe('Uppy component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore(() => {});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });

    it('should match component with data', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <UppyUploader />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
