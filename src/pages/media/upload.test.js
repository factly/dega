import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import UploadMedium from './upload';
import UppyUploader from './../../components/Uppy';
import * as actions from '../../actions/media';
import { mount } from 'enzyme';

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

jest.mock('../../actions/media', () => ({
  addMedium: jest.fn(),
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

describe('Media List component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore(state);
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <UploadMedium />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });

  describe('component testing', () => {
    it('should call addMedium', () => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      useDispatch.mockReturnValueOnce(() => Promise.resolve({}));
      actions.addMedium.mockReset();
      store = mockStore(state);
      let wrapper = mount(
        <Provider store={store}>
          <UploadMedium />
        </Provider>,
      );

      wrapper
        .find(UppyUploader)
        .props()
        .onUpload({ name: 'Sample image', caption: 'testing ', alt_text: 'sample' });

      expect(actions.addMedium).toHaveBeenCalledWith({
        name: 'Sample image',
        caption: 'testing ',
        alt_text: 'sample',
      });
      setTimeout(() => {
        expect(push).toHaveBeenCalledWith('/media');
        done();
      }, 0);
    });
  });
});
