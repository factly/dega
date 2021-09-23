import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import UploadMedium from './UploadMedium';
import * as actions from '../../actions/media';
import UppyUploader from '../../components/Uppy';

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
  createMedium: jest.fn(),
}));

describe('Media upload component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    spaces: {
      orgs: [{ id: 1, title: 'Org 1', spaces: [10] }],
      details: {
        10: {
          id: 10,
          name: 'Space 10',
          organisation_id: 1,
        },
      },
      loading: true,
      selected: 10,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const component = shallow(<UploadMedium />);
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call createMedium', (done) => {
      actions.createMedium.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = shallow(<UploadMedium />);
      });
      wrapper.find(UppyUploader).props().onUpload({ test: 'test' });
      setTimeout(() => {
        expect(actions.createMedium).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/media');
        done();
      }, 0);
    });
  });
});
