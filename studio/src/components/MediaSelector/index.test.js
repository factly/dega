import React from 'react';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { Radio } from 'antd';
import '../../matchMedia.mock';
import MediaSelector from './index';
import MediaUploader from './UploadMedium';
import { mount } from 'enzyme';
import { DeleteOutlined } from '@ant-design/icons';
import * as actions from '../../actions/media';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/media', () => ({
  getMedium: jest.fn(),
  getMedia: jest.fn(),
  addMedium: jest.fn(),
}));
let state = {
  spaces: {
    orgs: [
      {
        id: 1,
        name: 'org 1',
        slug: 'org-1',
        spaces: [11],
      },
    ],
    details: {
      11: {
        id: 11,
        organisation_id: 1,
        name: 'name',
        slug: 'slug',
        logo_id: 1,
        logo_mobile_id: 1,
        fav_icon_id: 1,
        mobile_icon_id: 1,
      },
    },
    loading: false,
    selected: 11,
  },
  media: {
    req: [
      {
        data: [1, 2],
        query: { page: 1, limit: 8 },
        total: 2,
      },
    ],
    details: {
      '1': {
        id: 1,
        name: 'Medium -1',
        url: 'some-url',
        file_size: 'file_size',
        caption: 'caption',
        description: 'description',
      },
      '2': {
        id: 2,
        name: 'Medium - 2',
        url: 'some-url',
        file_size: 'file_size',
        caption: 'caption',
        description: 'description',
      },
    },
    loading: false,
  },
};

describe('Media List component', () => {
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
          <MediaSelector value={1} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore(state);
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn(() => Promise.resolve({}));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should handle open and close modal', () => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector />
          </Provider>,
        );
      });
      const selectButton = wrapper.find('Button').at(0);
      expect(selectButton.text()).toBe('');
      selectButton.simulate('click');
      expect(wrapper.find('Modal').props().visible).toBe(true);
      const closeButton = wrapper.find('Button').at(0);
      expect(closeButton.text()).toBe('Cancel');
      closeButton.simulate('click');
      expect(wrapper.find('Modal').props().visible).toBe(false);
    });
    it('should select image', () => {
      const onChange = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector value={1} onChange={onChange} />
          </Provider>,
        );
      });
      const selectButton = wrapper.find('Button').at(0);
      expect(selectButton.text()).toBe('');
      selectButton.simulate('click');
      wrapper.find('Avatar').at(1).simulate('click');
      const okButton = wrapper.find('Button').at(1);
      expect(okButton.text()).toBe('Confirm');
      okButton.simulate('click');
      expect(onChange).toHaveBeenCalledWith(2);
    });
    it('should handle Tab change and unselect image', () => {
      const onChange = jest.fn();
      window.REACT_APP_COMPANION_URL = 'http://127.0.0.1:3020';
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector value={1} onChange={onChange} />
          </Provider>,
        );
      });
      const selectButton = wrapper.find('Button').at(0);
      expect(selectButton.text()).toBe('');
      selectButton.simulate('click');
      wrapper.find('Avatar').at(0).simulate('click');
      wrapper
        .find(Radio.Group)
        .at(0)
        .props()
        .onChange({ target: { value: 'upload' } });
      wrapper.find('Modal').props().onCancel();
      expect(onChange).not.toHaveBeenCalled();
    });
    it('should handle media upload', (done) => {
      const onChange = jest.fn();
      actions.addMedium.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector onChange={onChange} />
          </Provider>,
        );
      });

      const selectButton = wrapper.find('Button').at(0);
      expect(selectButton.text()).toBe('');
      selectButton.simulate('click');
      wrapper
        .find(Radio.Group)
        .at(0)
        .props()
        .onChange({ target: { value: 'upload' } });
      wrapper.update();
      wrapper
        .find(MediaUploader)
        .props()
        .onMediaUpload([{ id: 1, test: 'test', name: 'Medium -1' }], {
          id: 1,
          test: 'test',
          name: 'Medium -1',
        });
      setTimeout(() => {
        expect(actions.getMedia).toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should handle delete', () => {
      const onChange = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector onChange={onChange} value={1} />
          </Provider>,
        );
      });
      wrapper.update();
      const deleteButton = wrapper.find('Button').at(1);
      expect(deleteButton.find(DeleteOutlined).length).not.toBe(0);
      deleteButton.simulate('click');
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });
});
