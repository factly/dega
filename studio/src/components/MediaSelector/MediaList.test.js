import React from 'react';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import MediaList from './MediaList';
import { mount } from 'enzyme';
import { List } from 'antd';
import { act } from 'react-dom/test-utils';
import * as actions from '../../actions/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/media', () => ({
  getMedia: jest.fn(),
}));
let state = {
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
          <MediaList selected={{ id: 1 }} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;

    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    afterEach(() => {
      wrapper.unmount();
    });

    it('should change the page', () => {
      actions.getMedia.mockReset();
      store = mockStore(() => state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaList />
          </Provider>,
        );
      });

      const list = wrapper.find(List);
      list.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(List);
      expect(updatedTable.props().pagination.current).toEqual(2);
      expect(actions.getMedia).toHaveBeenCalledWith({ page: 1, limit: 8 }, false);
    });
    it('should handle image selection', () => {
      store = mockStore(() => state);
      const onSelect = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaList onSelect={onSelect} />
          </Provider>,
        );
      });
      act(() => {
        wrapper.find('input').simulate('change', { target: { value: 'Medium -1' } });
      });
      wrapper.find('Avatar').at(0).simulate('click');
      expect(onSelect).toHaveBeenCalledWith({
        id: 1,
        name: 'Medium -1',
        url: 'some-url',
        file_size: 'file_size',
        caption: 'caption',
        description: 'description',
      });
    });

    it('should handle image unselection', () => {
      store = mockStore(state);
      const onSelect = jest.fn();
      const onUnselect = jest.fn();

      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaList
              onSelect={onSelect}
              onUnselect={onUnselect}
              selected={{
                id: 1,
                name: 'Medium -1',
                url: 'some-url',
                file_size: 'file_size',
                caption: 'caption',
                description: 'description',
              }}
            />
          </Provider>,
        );
      });
      act(() => {
        wrapper.find('input').simulate('change', { target: { value: '' } });
      });

      wrapper.find('Avatar').at(0).simulate('click');
      expect(onSelect).toHaveBeenCalledWith(null);
    });
  });
});
