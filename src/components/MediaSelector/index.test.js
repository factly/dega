import React from 'react';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import MediaSelector from './index';
import { mount } from 'enzyme';
import { List, Modal } from 'antd';
import { act } from 'react-dom/test-utils';
import * as actions from '../../actions/media';

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
  media: {
    req: [
      {
        data: [1],
        query: { page: 1 },
        total: 1,
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
    it('should render the component with empty data', () => {
      state.media = {
        req: [],
        details: {},
        loading: false,
      };
      store = mockStore(() => state);
      const tree = mount(
        <Provider store={store}>
          <MediaSelector value={null} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change state on cancel', () => {
      actions.getMedium.mockReset();
      store = mockStore(() => state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector />
          </Provider>,
        );
      });

      wrapper.setState(true, () => {
        const modal = wrapper.find(Modal);
        modal.props().onCancel();
        wrapper.update();
        expect(wrapper.state()).toEqual(false);
        console.log(wrapper.debug());
        done();
      });
    });
    it('should change the page', () => {
      actions.getMedium.mockReset();
      store = mockStore(() => state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector />
          </Provider>,
        );
      });

      const list = wrapper.find(List);
      list.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(List);
      expect(updatedTable.props().pagination.current).toEqual(2);
      expect(actions.getMedium).toHaveBeenCalledWith({ page: 1 });
    });
  });
});
